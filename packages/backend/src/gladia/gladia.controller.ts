import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GladiaService } from './gladia.service';
import {
  TranscriptionRequest,
  TranscriptionResult,
  UploadResponse,
} from './gladia.types';

@Controller('gladia')
export class GladiaController {
  constructor(private readonly gladiaService: GladiaService) {}

  @Post('audio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    return this.gladiaService.uploadAudio(
      new Blob([file.buffer], { type: file.mimetype }),
    );
  }

  @Post('transcription')
  async createTranscription(
    @Body() transcriptionRequest: TranscriptionRequest,
  ): Promise<{ id: string; result_url: string }> {
    return this.gladiaService.requestTranscription(transcriptionRequest);
  }

  @Get('transcription/:id')
  async getTranscription(
    @Param('id') id: string,
  ): Promise<TranscriptionResult> {
    return this.gladiaService.getTranscription(id);
  }
}
