"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { MicIcon } from "@/components/ui/icons";

import { useTranscriber } from "@/hooks/useTranscriber";

export default function Home() {
  const { start, stop, results, status, error } = useTranscriber({
    transcription_hint: "Notion",
  });

  const handleStartStopClick = () => {
    if (status === "idle" || status === "error") {
      start();
    } else {
      stop();
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Speech to Notion</CardTitle>
        <CardDescription>
          Transcribe audio recording into Notion in real time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 border border-red-500 p-2 rounded">
            Error: {error.message}
          </div>
        ) : (
          <div>
            {results.map((result, index) => (
              <p key={index}>{result.transcription}</p>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex">
        <Button
          className={`flex-1 ${status === "transcribing" ? "bg-red-500" : "bg-green-500"}`}
          onClick={handleStartStopClick}
        >
          <MicIcon className="mr-2 h-4 w-4" />
          {status === "transcribing"
            ? "Stop transcribing"
            : "Start transcribing"}
        </Button>
      </CardFooter>
    </Card>
  );
}
