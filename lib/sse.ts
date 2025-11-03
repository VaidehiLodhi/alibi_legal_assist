const encoder = new TextEncoder();

type Client = {
  id: number;
  enqueue: (chunk: Uint8Array) => void;
};

let nextId = 1;
const clients = new Set<Client>();

export function addSseClient(enqueue: (chunk: Uint8Array) => void): Client {
  const client: Client = { id: nextId++, enqueue };
  clients.add(client);
  // Send initial comment to open the stream
  enqueue(encoder.encode(`: connected\n\n`));
  return client;
}

export function removeSseClient(client: Client) {
  clients.delete(client);
}

export function broadcastSse(event: any) {
  const payload = typeof event === "string" ? event : JSON.stringify(event);
  const chunk = encoder.encode(`data: ${payload}\n\n`);
  for (const c of clients) {
    try {
      c.enqueue(chunk);
    } catch {
      // ignore broken pipes; client will be GC'ed elsewhere
    }
  }
}


