import { Module } from '@nestjs/common';
import {
  GladiaLiveStrategy,
  GladiaPreRecordedStrategy,
} from './gladia.strategies';
import { NotionService } from '../notion/notion.service';
import { GladiaService } from '../gladia/gladia.service';

@Module({
  providers: [
    {
      provide: 'AudioTranscriptionStrategy',
      useClass:
        process.env.GLADIA_STRATEGY === 'pre-recorded'
          ? GladiaPreRecordedStrategy
          : GladiaLiveStrategy,
    },
    NotionService,
    GladiaService,
  ],
  exports: ['AudioTranscriptionStrategy'],
})
export class AudioTranscriptionModule {}
