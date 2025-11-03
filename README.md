This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## n8n workflow tracking (dashboard + integration)

You can show a live, animated dashboard of your n8n workflow steps in the frontend. The sample flow we track:

- Extract from PDF → simplify answers
- Determine crime type
- Choose a lawyer
- Email the user with dates and lawyer

Two ways to keep the UI in sync with n8n:

1) Push (recommended)
- Add an HTTP Request node in n8n after each step.
- POST to your app endpoint with a simple payload. Example payload:

```json
{
  "executionId": "{{$json["$executionId"]}}",
  "node": "determine_crime_type",
  "status": "success", // one of: started|success|error
  "data": { "crimeType": "Theft" },
  "timestamp": "{{$now}}"
}
```

2) Pull (Executions API)
- Store the `executionId` on start, then poll the n8n Executions API to read node statuses. This is slightly more work and rate‑limit sensitive.

Suggested UI
- Render a 4‑step timeline: Extract → Classify Crime → Choose Lawyer → Email Sent
- Each step can be pending/running/success/error with timestamps.

### How to connect this repo to n8n

1) Webhooks used by this app
- PDF processing (base64): `https://vaibee.app.n8n.cloud/webhook-test/legal-document`
- Contact registration: `https://vaibee.app.n8n.cloud/webhook-test/get-contact-information`

You can override them via env:

```bash
N8N_WEBHOOK_URL=https://<your-host>/webhook/…
N8N_CONTACT_WEBHOOK_URL=https://<your-host>/webhook/…
```

2) Add status callbacks in your n8n workflow (Push mode)
- After each node, insert an HTTP Request node → POST to your app, e.g. `/api/workflow-events`.
- Send: `executionId`, `node`, `status`, optional `data`, and `timestamp` (see payload above).

3) Frontend live updates
- Subscribe to a server endpoint (SSE/WebSocket) like `/api/workflow-events/stream?executionId=…` and animate the 4 steps as events arrive.

Notes
- If you prefer not to run a streaming endpoint, you can poll `/api/workflow-events?executionId=…` or the n8n Executions API on an interval (1–3s) until the workflow finishes.
- Keep payloads small; put large artifacts (e.g., PDFs) behind URLs rather than inlined.

