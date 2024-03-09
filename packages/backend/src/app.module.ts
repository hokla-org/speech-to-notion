import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioTranscriptionGateway } from './audio-transcription/audio-transcription.gateway';
import { NotionService } from './notion/notion.service';
import { NotionController } from './notion/notion.controller';
import { GladiaService } from './gladia/gladia.service';

@Module({
  imports: [],
  controllers: [AppController, NotionController],
  providers: [
    AppService,
    AudioTranscriptionGateway,
    NotionService,
    GladiaService,
  ],
})
export class AppModule {}
