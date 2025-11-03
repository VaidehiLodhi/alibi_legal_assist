import { broadcastSse } from "@/lib/sse";

export async function POST(request: Request) {
  try {
    const secret = process.env.WORKFLOW_EVENTS_SECRET;
    if (secret) {
      const provided = request.headers.get("x-workflow-secret");
      if (provided !== secret) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Minimal validation
    const { executionId, node, status, timestamp, data } = body as any;
    if (!node || !status) {
      return new Response("Missing required fields: node, status", { status: 400 });
    }

    const event = {
      type: "workflow:event",
      executionId: executionId ?? null,
      node,
      status,
      timestamp: timestamp ?? new Date().toISOString(),
      data: data ?? null,
    } as const;

    // Broadcast to all connected SSE clients
    broadcastSse(event);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Workflow-Secret",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}


