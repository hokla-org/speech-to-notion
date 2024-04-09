import { useCallback, useEffect, useState } from "react";
import { TranscriptionRequest, TranscriptionResult } from "./gladia.types";

type IdleState = { status: "idle"; id: null; result: null };
type UploadingState = { status: "uploading"; id: null; result: null };
type TranscribingState = {
  status: "transcribing";
  id: string;
  result: TranscriptionResult;
};
type CompletedState = {
  status: "completed";
  id: string;
  result: TranscriptionResult;
};
type ErrorState = {
  status: "error";
  id: string | null;
  result: TranscriptionResult | null;
  error: string;
};

type TranscriptionState =
  | IdleState
  | UploadingState
  | TranscribingState
  | CompletedState
  | ErrorState;

const useGladiaTranscriber = () => {
  const [state, setState] = useState<TranscriptionState>({
    id: null,
    result: null,
    status: "idle",
  });

  const BACKEND_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/gladia`;

  const startTranscription = useCallback(
    async (file: File, prompt: string, numberOfSpeakers: number) => {
      setState({
        status: "uploading",
        id: null,
        result: null,
      });
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadResponse = await fetch(`${BACKEND_ENDPOINT}/audio`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();

        const body: TranscriptionRequest = {
          audio_url: uploadData.audio_url,
          context_prompt: prompt,
          diarization: true,
          diarization_config: { number_of_speakers: numberOfSpeakers },
        };

        const transcriptionResponse = await fetch(
          `${BACKEND_ENDPOINT}/transcription`,
          {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data =
          (await transcriptionResponse.json()) as TranscriptionResult;

        setState({
          status: "transcribing",
          id: data.id,
          result: data,
        });
      } catch (error) {
        console.error("Error starting transcription:", error);
        setState({
          status: "error",
          error: (error as Error).toString(),
          id: null,
          result: null,
        });
      }
    },
    [BACKEND_ENDPOINT]
  );

  useEffect(() => {
    const checkTranscriptionStatus = async () => {
      if (state.id && state.status === "transcribing") {
        try {
          const response = await fetch(
            `${BACKEND_ENDPOINT}/transcription/${state.id}`
          );
          const data = (await response.json()) as TranscriptionResult;
          console.log("📝 Transcription data received:", data);
          if (data.status === "done") {
            setState({
              result: data,
              id: state.id,
              status: "completed",
            });
          } else if (data.status === "error") {
            console.error("Transcription error:", data.error_message);
            setState({
              id: state.id,
              status: "error",
              result: data,
              error: data.error_message,
            });
          }
        } catch (error) {
          console.error("Error checking transcription status:", error);
          setState((prevState) => ({
            ...prevState,
            status: "error",
            error: (error as Error).toString(),
          }));
        }
      }
    };

    const intervalId = setInterval(checkTranscriptionStatus, 5000);

    return () => clearInterval(intervalId);
  }, [BACKEND_ENDPOINT, state.id, state.status]);

  return {
    startTranscription,
    result: state.result,
    status: state.status,
  };
};

export default useGladiaTranscriber;
