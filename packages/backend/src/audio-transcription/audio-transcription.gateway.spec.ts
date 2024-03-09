import { Test, TestingModule } from '@nestjs/testing';
import { AudioTranscriptionGateway } from './audio-transcription.gateway';

describe('AudioTranscriptionGateway', () => {
  let gateway: AudioTranscriptionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioTranscriptionGateway],
    }).compile();

    gateway = module.get<AudioTranscriptionGateway>(AudioTranscriptionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
