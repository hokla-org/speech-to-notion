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
import { Input } from "@/components/ui/input";
import { MicIcon } from "@/components/ui/icons";

import { useTranscriber } from "@/hooks/useTranscriber";
import { useNotionBlockURL } from "@/hooks/useNotionBlockURL";
import { useState } from "react";

export default function Home() {
  const { start, stop, results, status, error } = useTranscriber({
    transcription_hint: "Notion",
  });

  const [notionBlockUrl, setNotionBlockUrl] = useState("");
  const urlChecker = useNotionBlockURL();

  const handleStartStopClick = () => {
    if (status === "ready" || status === "error") {
      start(notionBlockUrl);
    } else {
      stop();
    }
  };

  const handleNotionBlockUrlChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNotionBlockUrl(event.target.value);
    const ok = await urlChecker.checkAccess(event.target.value);
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
        <Input
          className="mb-4"
          placeholder="Enter Notion block URL"
          value={notionBlockUrl}
          onChange={handleNotionBlockUrlChange}
        />
        {urlChecker.status === "invalid" ? (
          <div className="text-red-500 border border-red-500 p-2 rounded">
            Notion Error: {urlChecker.error}
          </div>
        ) : null}
        {error ? (
          <div className="text-red-500 border border-red-500 p-2 rounded">
            Transcribe Error: {error.message}
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
          disabled={urlChecker.status !== "valid"}
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
