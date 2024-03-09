export type UploadResponse = {
  audio_url: string;
  audio_metadata: {
    id: string;
    filename: string;
    extension: string;
    size: number;
    audio_duration: number;
    number_of_channels: number;
  };
};

export type TranscriptionRequest = {
  audio_url: string;
  context_prompt?: string;
  custom_vocabulary?: string[];
  detect_language?: boolean;
  enable_code_switching?: boolean;
  diarization?: boolean;
  diarization_config?: {
    max_speakers?: number;
    min_speakers?: number;
    number_of_speakers?: number;
  };
  language?: string;
  subtitles?: boolean;
  subtitles_config?: {
    formats?: string[];
  };
  summarization?: boolean;
  summarization_config?: {
    type?: string;
  };
  custom_metadata?: unknown;
};

export type TranscriptionResultQueue = {
  id: string;
  request_id: string;
  kind: string;
  status: 'queued';
  created_at: string;
  file: {
    id: string;
    filename: string;
    source: string | null;
    audio_duration: number;
    number_of_channels: number;
  };
  request_params: {
    audio_url: string;
    context_prompt: string;
    custom_vocabulary: string[];
    detect_language: boolean;
    diarization: boolean;
    diarization_config: {
      max_speakers: number;
      min_speakers: number;
      number_of_speakers: number;
    };
    language: string;
    subtitles: boolean;
    subtitles_config: {
      formats: string[];
    };
    summarization: boolean;
    summarization_config: {
      type: string;
    };
  };
};

export type TranscriptionResultProcessing = {
  id: string;
  request_id: string;
  kind: string;
  status: 'processing';
  created_at: string;
  file: {
    id: string;
    filename: string;
    source: string | null;
    audio_duration: number;
    number_of_channels: number;
  };
  request_params: {
    audio_url: string;
    context_prompt: string;
    custom_vocabulary: string[];
    detect_language: boolean;
    diarization: boolean;
    diarization_config: {
      max_speakers: number;
      min_speakers: number;
      number_of_speakers: number;
    };
    language: string;
    subtitles: boolean;
    subtitles_config: {
      formats: string[];
    };
    summarization: boolean;
    summarization_config: {
      type: string;
    };
  };
};

export type TranscriptionResultDone = {
  id: string;
  request_id: string;
  kind: string;
  status: 'done';
  created_at: string;
  completed_at: string;
  file: {
    id: string;
    filename: string;
    source: string | null;
    audio_duration: number;
    number_of_channels: number;
  };
  request_params: {
    audio_url: string;
    context_prompt: string;
    custom_vocabulary: string[];
    detect_language: boolean;
    diarization: boolean;
    diarization_config: {
      max_speakers: number;
      min_speakers: number;
      number_of_speakers: number;
    };
    language: string;
    subtitles: boolean;
    subtitles_config: {
      formats: string[];
    };
    summarization: boolean;
    summarization_config: {
      type: string;
    };
  };
  result: {
    metadata: {
      audio_duration: number;
      number_of_distinct_channels: number;
      billing_time: number;
      transcription_time: number;
    };
    transcription: {
      full_transcript: string;
      languages: string[];
      utterances: {
        words: {
          word: string;
          start: number;
          end: number;
          confidence: number;
        }[];
        text: string;
        language: string;
        start: number;
        end: number;
        speaker: number;
        channel: number;
      }[];
    };
  };
};

export type TranscriptionResultError = {
  id: string;
  request_id: string;
  kind: string;
  status: 'error';
  created_at: string;
  error_message: string;
  file: {
    id: string;
    filename: string;
    source: string | null;
    audio_duration: number;
    number_of_channels: number;
  };
  request_params: {
    audio_url: string;
    context_prompt: string;
    custom_vocabulary: string[];
    detect_language: boolean;
    diarization: boolean;
    diarization_config: {
      max_speakers: number;
      min_speakers: number;
      number_of_speakers: number;
    };
    language: string;
    subtitles: boolean;
    subtitles_config: {
      formats: string[];
    };
    summarization: boolean;
    summarization_config: {
      type: string;
    };
  };
};

export type TranscriptionResult =
  | TranscriptionResultQueue
  | TranscriptionResultProcessing
  | TranscriptionResultDone
  | TranscriptionResultError;
