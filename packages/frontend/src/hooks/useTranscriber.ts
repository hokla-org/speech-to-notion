"use client";
import { useState, useCallback, useRef } from "react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { io } from "socket.io-client";

type WordDetail = {
  word: string;
  time_begin: number;
  time_end: number;
  confidence: number;
};

type TranscriptionResult = {
  event: "transcript";
  type: "final" | "partial";
  transcription: string;
  language: string;
  time_begin: number;
  time_end: number;
  duration: number;
  words: WordDetail[];
};

type ConnectedResult = {
  event: "connected";
  request_id: string;
};

type ErrorResult = {
  event: "error";
  message: string;
};

type Result = TranscriptionResult | ConnectedResult | ErrorResult;

type Status = "ready" | "connecting" | "transcribing" | "error";

interface UseTranscriberConfig {
  transcription_hint?: string;
}

const DEFAULT_RECORDER_CONFIG: RecordRTC.Options = {
  type: "audio",
  mimeType: "audio/wav",
  sampleRate: 16000,
  desiredSampRate: 16000,
  recorderType: StereoAudioRecorder,
  numberOfAudioChannels: 1,
  timeSlice: 10000, // Send data every 10 seconds
};

class TranscribeClient {
  socket: ReturnType<typeof io> | null = null;
  onConnected: () => void;
  onResult: (result: TranscriptionResult) => void;
  onError: (error: Error) => void;

  constructor(
    onConnected: () => void,
    onResult: (result: TranscriptionResult) => void,
    onError: (error: Error) => void
  ) {
    this.onConnected = onConnected;
    this.onResult = onResult;
    this.onError = onError;
  }

  connect() {
    this.socket = io(
      process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:4000"
    );

    this.socket.on("connect", this.onConnected);
    this.socket.on("transcriptionResult", (data: string) => {
      const result: Result = JSON.parse(data);
      if (result.event === "transcript") {
        this.onResult(result as TranscriptionResult);
      } else if (result.event === "error") {
        this.onError(new Error(result.message));
      }
    });
    this.socket.on(
      "notionTargetResponse",
      (response: { status: string; blockId?: string; message?: string }) => {
        if (response.status === "success") {
          console.log(
            `Notion target set successfully. Block ID: ${response.blockId}`
          );
        } else {
          console.error(`Failed to set Notion target: ${response.message}`);
        }
      }
    );
    this.socket.on("connect_error", (err: Error) => {
      this.onError(new Error(`Socket.io connection error: ${err.message}`));
    });
    this.socket.on("disconnect", () => {
      this.socket = null;
    });
  }

  setNotionTarget(notionUrl: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("setNotionTarget", { notionUrl });
    }
  }

  async emitFrame(blob: Blob) {
    if (this.socket && this.socket.connected) {
      const arrayBuffer = await blob.arrayBuffer();
      const modifiedBuffer = arrayBuffer.slice(44); // Removing the WAV header
      if (modifiedBuffer.byteLength > 0) {
        const base64Data = Buffer.from(modifiedBuffer).toString("base64");
        console.log(
          `Sending buffer of length: ${(modifiedBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`
        );

        this.socket.emit("audioFrame", base64Data);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const useTranscriber = (config: UseTranscriberConfig) => {
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [error, setError] = useState<Error | null>(null);
  const recorder = useRef<RecordRTC | null>(null);
  const client = useRef<TranscribeClient | null>(null);

  const start = useCallback(async (notionURL: string) => {
    setStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new RecordRTC(stream, {
        ...DEFAULT_RECORDER_CONFIG,
        ondataavailable: (blob: Blob) => {
          client.current?.emitFrame(blob);
        },
      });

      client.current = new TranscribeClient(
        () => {
          setStatus("transcribing");
          client.current!.setNotionTarget(notionURL);
          recorder.current!.startRecording();
        },
        (result) => {
          setResults((prev) => [...prev, result]);
        },
        (err) => {
          setError(err);
          setStatus("error");
        }
      );

      client.current.connect();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      setStatus("error");
    }
  }, []);

  const stop = useCallback(() => {
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stopRecording();
    }
    client.current?.disconnect();
    recorder.current = null;
    client.current = null;
    if (status !== "error") {
      setStatus("ready");
    }
  }, [status]);

  return { start, results, stop, status, error };
};
