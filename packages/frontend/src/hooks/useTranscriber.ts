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

type Status = "idle" | "connecting" | "transcribing" | "error";

interface UseTranscriberConfig {
  transcription_hint: string;
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

export const useTranscriber = (config: UseTranscriberConfig) => {
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const start = useCallback(async () => {
    setStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const handleAudioFrame = async (blob: Blob) => {
        if (socketRef.current && socketRef.current.connected) {
          const arrayBuffer = await blob.arrayBuffer();
          // Removing the WAV header from the audio buffer before sending
          const modifiedBuffer = arrayBuffer.slice(44);

          const lengthInMB = modifiedBuffer.byteLength / (1024 * 1024);
          console.log(`Sending buffer of length: ${lengthInMB.toFixed(2)} MB`);
          if (modifiedBuffer.byteLength > 0) {
            const base64Data = Buffer.from(modifiedBuffer).toString("base64");
            socketRef.current.emit("audioFrame", base64Data);
          }
        }
      };

      recorderRef.current = new RecordRTC(stream, {
        ...DEFAULT_RECORDER_CONFIG,
        ondataavailable: handleAudioFrame,
      });

      socketRef.current = io(
        process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:4000"
      );
      socketRef.current.on("connect", () => {
        setStatus("transcribing");
        recorderRef.current!.startRecording();
      });

      socketRef.current.on("transcriptionResult", (data) => {
        const result: Result = JSON.parse(data);
        if (result.event === "transcript") {
          setResults((prev) => [...prev, result]);
        }
        if (result.event === "error") {
          setError(new Error(result.message));
          setStatus("error");
        }
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket.io connection error:", err);
        setError(new Error(`Socket.io connection error: ${err}`));
        setStatus("error");
      });

      socketRef.current.on("disconnect", () => {
        if (status !== "error") {
          setStatus("idle");
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      setStatus("error");
    }
  }, [config]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stopRecording();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    recorderRef.current = null;
    socketRef.current = null;
    if (status !== "error") {
      setStatus("idle");
    }
  }, [status]);

  return { start, results, stop, status, error };
};
