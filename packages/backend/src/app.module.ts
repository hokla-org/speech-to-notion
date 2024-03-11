import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotionService } from './notion/notion.service';
import { NotionController } from './notion/notion.controller';
import { GladiaService } from './gladia/gladia.service';
import { AudioTranscriptionModule } from './audio-transcription/audio-transcription.module';

@Module({
  imports: [AudioTranscriptionModule],
  controllers: [AppController, NotionController],
  providers: [AppService, NotionService, GladiaService],
})
export class AppModule {}
