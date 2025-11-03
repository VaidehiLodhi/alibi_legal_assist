"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Mail, Check, Loader2 } from "lucide-react";
import z from "zod";

interface Props {
  projectId: string;
}

const contactSchema = z.object({
  gmailAddress: z
    .string()
    .min(1, { message: "Gmail address is required" })
    .email({ message: "Please enter a valid Gmail address" })
    .refine(
      (email) => email.endsWith("@gmail.com"),
      { message: "Please enter a Gmail address (@gmail.com)" }
    ),
});

export const ContactInformation = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      gmailAddress: "",
    },
  });

  const saveContactMutation = useMutation(trpc.reports.saveContactInfo.mutationOptions({
    onSuccess: (data) => {
      setIsSaved(true);
      form.reset();
    },
    onError: (error) => {
      // Error will be shown via FormMessage
    },
  }));

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    await saveContactMutation.mutateAsync({
      projectId,
      gmailAddress: values.gmailAddress,
    });
  };

  const isPending = saveContactMutation.isPending;

  return (
    <div className="p-6 text-black flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
        <p className="text-sm font-normal text-gray-600">
          Connect your Gmail account to enable email notifications and calendar integration.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="gmailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold text-black">
                  Gmail Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="your.email@gmail.com"
                      disabled={isPending}
                      className="pl-10 border-2 border-black rounded-none bg-white text-black font-normal h-11 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs font-normal text-gray-600">
                  This address will be used to send emails and manage your Google Calendar.
                </FormDescription>
                <FormMessage className="text-xs font-normal text-red-600" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending || !form.formState.isValid}
            className="bg-black text-white hover:bg-gray-800 rounded-none border-2 border-black font-bold py-3 px-6 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Connected
              </>
            ) : (
              "Connect Gmail Account"
            )}
          </Button>
        </form>
      </Form>

      {isSaved && (
        <div 
          className="border-2 p-4 flex items-center gap-3 rounded-none"
          style={{
            backgroundColor: "#E7F6F2",
            borderColor: "#1EA887",
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1EA887" }}></div>
          <span className="font-bold text-sm" style={{ color: "#1EA887" }}>
            Gmail account registered successfully! Email address saved to database and n8n workflow triggered.
          </span>
        </div>
      )}
    </div>
  );
};

