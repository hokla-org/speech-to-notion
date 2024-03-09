import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioTranscriptionGateway } from './audio-transcription/audio-transcription.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AudioTranscriptionGateway],
})
export class AppModule {}
