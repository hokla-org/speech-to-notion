import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioTranscriptionGateway } from './audio-transcription/audio-transcription.gateway';
import { NotionService } from './notion/notion.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AudioTranscriptionGateway, NotionService],
})
export class AppModule {}
