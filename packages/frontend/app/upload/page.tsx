"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import useGladiaTranscriber from "@/hooks/useGladiaTranscriber";

interface UploadFormInputs {
  audioFile: FileList;
  prompt: string;
  numberOfSpeakers: number;
}

const UploadPage = () => {
  const form = useForm<UploadFormInputs>();
  const { startTranscription, result, status } = useGladiaTranscriber();
  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  useEffect(() => {
    if (result?.status === "done" && result) {
      const base64Data = btoa(
        JSON.stringify(result.result.transcription.utterances)
      );
      setDownloadLink(`data:application/json;base64,${base64Data}`);
    }
  }, [status, result]);

  const onSubmit = async (data: UploadFormInputs) => {
    const file = data.audioFile[0];
    const prompt = data.prompt;
    const numberOfSpeakers = data.numberOfSpeakers;
    startTranscription(file, prompt, numberOfSpeakers);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Upload Audio for Transcription
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormItem>
            <FormLabel htmlFor="audioFile">Audio File</FormLabel>
            <FormControl>
              <Input
                {...form.register("audioFile", { required: true })}
                type="file"
              />
            </FormControl>
            {form.formState.errors.audioFile && (
              <span>This field is required</span>
            )}
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="prompt">Prompt</FormLabel>
            <FormControl>
              <Input
                {...form.register("prompt", { required: true })}
                type="text"
                placeholder="Enter a hint prompt"
              />
            </FormControl>
            {form.formState.errors.prompt && (
              <span>This field is required</span>
            )}
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="numberOfSpeakers">Number of Speakers</FormLabel>
            <FormControl>
              <Input
                {...form.register("numberOfSpeakers", {
                  required: true,
                  valueAsNumber: true,
                })}
                type="number"
                placeholder="Enter the number of speakers"
                min="1"
              />
            </FormControl>
            {form.formState.errors.numberOfSpeakers && (
              <span>This field is required</span>
            )}
          </FormItem>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </Form>
      {status === "transcribing" && <p>Transcribing... Please wait.</p>}
      {status === "error" && (
        <p className="text-red-500">
          An error occurred during transcription. Please try again.
        </p>
      )}
      {downloadLink && (
        <a href={downloadLink} download="transcription.txt">
          Download Transcription
        </a>
      )}
    </div>
  );
};

export default UploadPage;
