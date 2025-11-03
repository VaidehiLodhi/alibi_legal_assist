import { inngest } from "./client";
import { prisma } from "@/lib/db";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const processChatMessage = inngest.createFunction(
  { id: "process-chat-message" },
  { event: "chat/message.process" },
  async ({ event, step }) => {
    const { messageId, projectId, userMessage } = event.data;

    // Call Gemini chat API
    const ragResponse = await step.run("call-gemini-chat", async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const payload = {
        contents: [
          {
            parts: [
              {
                text: String(userMessage ?? ""),
              },
            ],
          },
        ],
      } as const;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (err) {
        const preview = raw.slice(0, 300);
        throw new Error(`Gemini response not JSON (${response.status}): ${preview}`);
      }

      if (!response.ok) {
        const preview = typeof data === "object" ? JSON.stringify(data).slice(0, 300) : String(raw).slice(0, 300);
        throw new Error(`Gemini API error ${response.status}: ${preview}`);
      }

      // Extract text from Gemini response
      try {
        const partsArray = data?.candidates?.[0]?.content?.parts;
        const joined = Array.isArray(partsArray)
          ? partsArray.map((p: any) => (p && typeof p.text === "string" ? p.text : "")).filter(Boolean).join("\n")
          : "";
        const primary = joined || data?.output_text || data?.text || "";

        const sanitized = String(primary)
          .replace(/[\u0000-\u001F\u007F]/g, "")
          .trim()
          .slice(0, 20000);

        return sanitized.length > 0 ? sanitized : "Sorry, I couldn't generate a response.";
      } catch (error) {
        console.error("Error parsing Gemini response:", error);
        return "Sorry, I couldn't generate a response.";
      }
    });

    // Save the assistant's response to the database
    await step.run("save-assistant-message", async () => {
      await prisma.message.create({
        data: {
          content: ragResponse,
          role: "ASSISTANT",
          type: "RESULT",
          projectId: projectId,
        },
      });
    });

    return {
      messageId,
      projectId,
      assistantResponse: ragResponse
    };
  },
);