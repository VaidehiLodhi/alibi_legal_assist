import { addSseClient, removeSseClient } from "@/lib/sse";

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const client = addSseClient((chunk) => controller.enqueue(chunk));
      const keepAlive = setInterval(() => {
        try { controller.enqueue(new TextEncoder().encode(`: ping\n\n`)); } catch {}
      }, 15000);

      // @ts-ignore - attach for cleanup
      this.client = client;
      // @ts-ignore
      this.keepAlive = keepAlive;
    },
    cancel() {
      // @ts-ignore
      if (this.client) removeSseClient(this.client);
      // @ts-ignore
      if (this.keepAlive) clearInterval(this.keepAlive);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}


