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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as WebSocket from 'ws';
import * as dotenv from 'dotenv';
import { NotionBlockId, NotionService } from '../notion/notion.service';
dotenv.config();

const GLADIA_WEB_SOCKET_URL =
  'wss://api.gladia.io/audio/text/audio-transcription';

interface InitialConfigMessage {
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

const DEFAULT_GLADIA_CONFIG: InitialConfigMessage = {
  x_gladia_key: process.env.GLADIA_API_KEY || '',
  sample_rate: 48000,
  language_behaviour: 'automatic single language',
  frames_format: 'bytes',
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  // Set maximum HTTP buffer size to 25 MB to handle large audio files
  maxHttpBufferSize: 25e6,
  // Set a timeout for the connection
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
})
export class AudioTranscriptionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly notionService: NotionService) {}

  @WebSocketServer() server: Server;
  private gladiaWs: WebSocket; // WebSocket connection to Gladia
  private logger = new Logger('AudioTranscriptionGateway');
  private notionBlockId: NotionBlockId | null = null;

  afterInit() {
    this.connectToGladia();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client id: ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliend id: ${client.id} disconnected`);
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
      // Forward Gladia's response to all connected clients
      this.server.emit('transcriptionResult', data.toString());

      const result: GladiaResult = JSON.parse(data.toString());

      if (
        result.event === 'transcript' &&
        result.type === 'final' &&
        this.notionBlockId
      ) {
        const blocks = await this.notionService.appendTextAfterBlock({
          ...this.notionBlockId,
          text: result.transcription,
        });

        // append text after created block
        this.notionBlockId.blockId = blocks.results[0]?.id;
      }
    });

    this.gladiaWs.on('error', (error) => {
      this.logger.error('❌ WebSocket error connecting to Gladia:', error);
    });
  }

  @SubscribeMessage('audioFrame')
  handleAudioFrame(@MessageBody() data: string) {
    // Convert base64 data to binary before forwarding audio frame to Gladia
    if (this.gladiaWs.readyState === WebSocket.OPEN) {
      const binaryData = Buffer.from(data, 'base64');
      this.logger.log(
        `🔊 Sending audio frame of length: ${(binaryData.length / (1024 * 1024)).toFixed(2)} MB`,
      );
      this.gladiaWs.send(binaryData);
    }
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
      const blocks = await this.notionService.appendTextAfterBlock({
        ...this.notionBlockId,
        text: 'Starting transcription...',
      });
      // append text after created block
      this.notionBlockId.blockId = blocks.results[0]?.id;

      this.logger.log(
        `Notion target blockId set for client ${client.id}`,
        this.notionBlockId,
      );
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
}
