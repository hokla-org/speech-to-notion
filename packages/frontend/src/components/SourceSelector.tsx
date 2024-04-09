import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { AppWindowIcon, MicIcon } from "./ui/icons";

const sourceSchema = z.object({
  source: z.enum(["tab", "microphone"]),
});

type SourceFormInputs = z.infer<typeof sourceSchema>;

interface SourceSelectorProps {
  onSubmit: (data: SourceFormInputs) => void;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({ onSubmit }) => {
  const form = useForm<SourceFormInputs>({
    resolver: zodResolver(sourceSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          name="source"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Source</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid max-w-md grid-rows-2 gap-2 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="tab" className="sr-only" />
                    </FormControl>
                    <div className="-mx-2 flex items-start space-x-4 border-2 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                      <AppWindowIcon className="mt-px h-5 w-5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Tab</p>
                        <p className="text-sm text-muted-foreground">
                          Capture audio from tab
                        </p>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="microphone" className="sr-only" />
                    </FormControl>
                    <div className="-mx-2 flex items-start space-x-4 border-2 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                      <AppWindowIcon className="mt-px h-5 w-5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Microphone</p>
                        <p className="text-sm text-muted-foreground">
                          Capture audio from microphone
                        </p>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
