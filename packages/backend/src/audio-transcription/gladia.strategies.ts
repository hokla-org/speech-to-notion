import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as WebSocket from 'ws';
import { NotionService, NotionBlockId } from '../notion/notion.service';
import { GladiaService } from '../gladia/gladia.service';

const GLADIA_WEB_SOCKET_URL =
  'wss://api.gladia.io/audio/text/audio-transcription';

const DEFAULT_GLADIA_CONFIG: GladiaConfig = {
  x_gladia_key: process.env.GLADIA_API_KEY || '',
  sample_rate: 44100,
  language_behaviour: 'automatic single language',
  encoding: 'OPUS',
  frames_format: 'bytes',
  language: 'french',
  transcription_hint:
    'Un meeting entre Floryan, Head of QARA de Hokla, et Dour, CEO de Dalia Care. Atelier réglementaire sur Dalia',
};

interface GladiaConfig {
  x_gladia_key: string;
  encoding?:
    | 'WAV'
    | 'WAV/PCM'
    | 'WAV/ALAW'
    | 'WAV/ULAW'
    | 'AMB'
    | 'MP3'
    | 'FLAC'
    | 'OGG/VORBIS'
    | 'OPUS'
    | 'SPHERE'
    | 'AMR-NB';
  bit_depth?: 8 | 16 | 24 | 32 | 64;
  sample_rate?: 8000 | 16000 | 32000 | 44100 | 48000;
  language_behaviour?:
    | 'manual'
    | 'automatic single language'
    | 'automatic multiple languages';
  language?: string;
  transcription_hint?: string;
  endpointing?: number;
  model_type?: 'accurate' | 'fast';
  frames_format?: 'base64' | 'bytes';
  prosody?: 'true' | 'false';
  reinject_context?: boolean | string;
  word_timestamps?: 'true' | 'false';
  maximum_audio_duration?: number;
}

type WordDetail = {
  word: string;
  time_begin: number;
  time_end: number;
  confidence: number;
};

type TranscriptionResult = {
  event: 'transcript';
  type: 'final' | 'partial';
  transcription: string;
  language: string;
  time_begin: number;
  time_end: number;
  duration: number;
  words: WordDetail[];
};

type ConnectedResult = {
  event: 'connected';
  request_id: string;
};

type ErrorResult = {
  event: 'error';
  message: string;
};

type GladiaResult = TranscriptionResult | ConnectedResult | ErrorResult;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 25e6,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
})
abstract class AudioTranscriptionStrategy
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  protected logger = new Logger(AudioTranscriptionStrategy.name);
  protected notionBlockId: NotionBlockId | null = null;

  constructor(protected readonly notionService: NotionService) {}

  afterInit() {
    this.logger.log(`${this.constructor.name} initialized`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client id: ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client id: ${client.id} disconnected`);
  }

  async appendText(text: string) {
    if (!this.notionBlockId?.blockId) {
      this.logger.error('No Notion block ID set. Cannot append text.');
      return;
    }

    const result = await this.notionService.appendTextAfterBlock({
      ...this.notionBlockId,
      text: text,
    });

    // Update the block ID to the newly created block's ID for future appends
    this.notionBlockId.blockId = result.results[0]?.id;
  }

  @SubscribeMessage('setNotionTarget')
  async handleSetNotionTarget(
    @MessageBody() data: { notionUrl: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.notionService.checkAccess(data.notionUrl);
      if (result.status === 'error') {
        this.logger.error(`Invalid Notion URL provided by client ${client.id}`);
        client.emit('notionTargetResponse', {
          status: 'error',
          message: 'Invalid Notion URL',
        });
        return;
      }
      this.notionBlockId = { pageId: result.pageId, blockId: result.blockId };
      await this.appendText('Starting transcription...');
      client.emit('notionTargetResponse', {
        status: 'success',
        blockId: this.notionBlockId,
      });
    } catch (error) {
      this.logger.error(
        `Error setting Notion target for client ${client.id}: ${error.message}`,
      );
      client.emit('notionTargetResponse', {
        status: 'error',
        message: 'Error setting Notion target',
      });
    }
  }

  abstract handleAudioFrame(data: string): Promise<void>;
}

@Injectable()
export class GladiaLiveStrategy extends AudioTranscriptionStrategy {
  private gladiaWs: WebSocket;

  constructor(
    protected readonly notionService: NotionService,
    private readonly gladiaService: GladiaService,
  ) {
    super(notionService);
    this.logger = new Logger(GladiaLiveStrategy.name);
  }

  afterInit() {
    super.afterInit();
    this.connectToGladia();
  }

  connectToGladia() {
    // Initialize WebSocket connection to Gladia API
    this.gladiaWs = new WebSocket(GLADIA_WEB_SOCKET_URL);

    this.gladiaWs.on('open', () => {
      this.logger.log('Connected to Gladia WebSocket API');

      this.logger.log(
        'Sending initial configuration to Gladia:',
        DEFAULT_GLADIA_CONFIG,
      );
      const initialConfig = {
        ...DEFAULT_GLADIA_CONFIG,
      };

      this.gladiaWs.send(JSON.stringify(initialConfig));
    });

    this.gladiaWs.on('message', async (data) => {
      this.logger.log('📩 Received message from Gladia:', data.toString());

      const result: GladiaResult = JSON.parse(data.toString());

      if (
        result.event === 'transcript' &&
        result.type === 'final' &&
        this.notionBlockId
      ) {
        // Forward Gladia's response to all connected clients
        this.server.emit('transcriptionResult', data.toString());

        await this.appendText(result.transcription);
      }
    });

    this.gladiaWs.on('error', (error) => {
      this.logger.error('❌ WebSocket error connecting to Gladia:', error);
    });

    this.gladiaWs.on('close', (code, reason) => {
      this.logger.log(
        `Gladia WebSocket closed with code: ${code}, reason: ${reason}`,
      );
    });

    this.gladiaWs.on('ping', (data) => {
      this.logger.log(`Received ping from Gladia with data: ${data}`);
    });

    this.gladiaWs.on('pong', (data) => {
      this.logger.log(`Received pong from Gladia with data: ${data}`);
    });

    this.gladiaWs.on('unexpected-response', (request, response) => {
      this.logger.error(
        `Unexpected response from Gladia: ${response.statusCode} ${response.statusMessage}`,
      );
    });

    this.gladiaWs.on('upgrade', (response) => {
      this.logger.log(`Connection upgraded: ${response.headers}`);
    });
  }

  @SubscribeMessage('audioFrame')
  async handleAudioFrame(@MessageBody() data: string) {
    if (this.gladiaWs.readyState === WebSocket.OPEN) {
      const binaryData = Buffer.from(data, 'base64');
      this.logger.log(
        `Sending audio frame of length: ${(binaryData.length / (1024 * 1024)).toFixed(2)} MB`,
      );
      this.gladiaWs.send(binaryData);
    }
  }
}

export class GladiaPreRecordedStrategy extends AudioTranscriptionStrategy {
  constructor(
    protected readonly notionService: NotionService,
    private readonly gladiaService: GladiaService,
  ) {
    super(notionService);
    this.logger = new Logger(GladiaPreRecordedStrategy.name);
  }

  @SubscribeMessage('audioFrame')
  async handleAudioFrame(@MessageBody() data: string) {
    const binaryData = Buffer.from(data, 'base64');
    const blobData = new Blob([binaryData], {
      type: 'audio/webm;codecs=opus',
    });
    console.log(
      '📦 Uploading audio blob of size: ' +
        (blobData.size / 1024 / 1024).toFixed(2) +
        ' MB',
    );
    const audioFile = await this.gladiaService.uploadAudio(blobData);
    const { id } = await this.gladiaService.requestTranscription({
      audio_url: audioFile.audio_url,
      diarization: true,
      diarization_config: {
        max_speakers: 2,
        min_speakers: 1,
        number_of_speakers: 2,
      },
      context_prompt:
        'Un meeting entre Floryan, Head of QARA de Hokla, et Dour, CEO de Dalia Care. Atelier réglementaire sur Dalia',
      language: 'fr',
    });
    this.logger.log(`Fetching transcription with ID: ${id}`);
    let request = await this.gladiaService.getTranscription(id);
    this.logger.log(`Fetched transcription status: ${request.status}`);

    let pollingAttempts = 0;
    const MAX_POLLING_ATTEMPS = 12; // Assuming we want to poll for a maximum of 1 minute at a 5-second interval
    const SLEEP_INTERVAL = 5000;
    while (
      (request.status === 'processing' || request.status === 'queued') &&
      pollingAttempts < MAX_POLLING_ATTEMPS
    ) {
      this.logger.log('🔄 Polling for transcription status...');
      request = await this.gladiaService.getTranscription(request.id);

      await new Promise((resolve) => setTimeout(resolve, SLEEP_INTERVAL));
      pollingAttempts++;
    }
    if (pollingAttempts === MAX_POLLING_ATTEMPS) {
      this.logger.log(
        '⏱️ Max polling attempts reached. Stopping transcription status checks.',
      );
      return;
    }

    if (request.status === 'done') {
      this.logger.log('✅ Transcription completed:', request);
      await this.appendText(request.result.transcription.full_transcript);
    }
  }
}
