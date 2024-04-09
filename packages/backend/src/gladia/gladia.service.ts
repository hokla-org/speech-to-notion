import { Injectable } from '@nestjs/common';
import {
  UploadResponse,
  TranscriptionRequest,
  TranscriptionResult,
} from './gladia.types';

@Injectable()
export class GladiaService {
  constructor() {}
  async uploadAudio(file: Blob): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch('https://api.gladia.io/v2/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'x-gladia-key': process.env.GLADIA_API_KEY,
      },
    });

    const data = await response.json();
    return data;
  }

  async requestTranscription(
    transcriptionRequest: TranscriptionRequest,
  ): Promise<{ id: string; result_url: string }> {
    const response = await fetch('https://api.gladia.io/v2/transcription', {
      method: 'POST',
      body: JSON.stringify(transcriptionRequest),
      headers: {
        'x-gladia-key': process.env.GLADIA_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Transcription request response:', data);
    return data as { id: string; result_url: string };
  }

  async getTranscription(id: string): Promise<TranscriptionResult> {
    const response = await fetch(
      `https://api.gladia.io/v2/transcription/${id}`,
      {
        method: 'GET',
        headers: {
          'x-gladia-key': process.env.GLADIA_API_KEY,
        },
      },
    );

    const data = (await response.json()) as TranscriptionResult;
    return data;
  }
}
