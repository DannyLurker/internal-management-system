# Guide: DB → PDF → Supabase Storage → Email (via Inngest)

This guide is written for your stack: **Next.js (App Router) + TypeScript (strict) + PostgreSQL/Prisma + Zod**, deployed with a background job pipeline that:

1. Queries data from Postgres via Prisma
2. Renders it into a PDF
3. Uploads the PDF to **Supabase Storage**
4. Emails a link (or attachment) to the recipient
5. Is orchestrated as a durable, retryable background job with **Inngest**

---

## 0. Architecture overview

```
[Trigger: API route / cron / user action]
        │
        ▼
inngest.send({ name: "report/generate" })
        │
        ▼
Inngest Function (durable, step-based)
   ├─ step.run("fetch-data")        → Prisma query
   ├─ step.run("generate-pdf")      → PDF buffer
   ├─ step.run("upload-supabase")   → storage.from(bucket).upload()
   └─ step.run("send-email")       → Resend/Nodemailer
```

Inngest is the right tool here because each step is retried independently if it fails (e.g. if the email provider times out, you don't re-run the DB query or re-upload the PDF).

**A note if you're already using Supabase for anything else** (auth, DB, realtime): this consolidates your infra — one dashboard, one set of credentials, no separate Cloudflare account. If you're on Prisma against a _different_ Postgres host and only want Supabase for storage, that's fine too — Storage is usable standalone.

---

## 1. Install dependencies

```bash
npm install inngest
npm install @supabase/supabase-js
npm install @react-pdf/renderer                                # PDF generation
npm install resend                                              # or nodemailer
```

Notes on choices:

- **`@react-pdf/renderer`** — good fit since you're already in a React/TS codebase; lets you define PDF layout as JSX components. Alternatives: `pdfkit` (lower-level, more control) or `puppeteer` (render an HTML/Tailwind template to PDF — heavier, but reuses your existing shadcn/Tailwind styling).
- **`resend`** — simple DX, good deliverability, easy to swap for `nodemailer` + SMTP if you already have a provider.
- **`@supabase/supabase-js`** — the official client; storage upload/download/signed-URL calls are all on `supabase.storage`, no S3 SDK needed.

---

## 2. Set up Supabase Storage

1. In the Supabase dashboard: **Storage → New bucket** (e.g. `hotel-reports`). Leave it **private** — reports are only accessed via signed URLs, not public listing.
2. **Project Settings → API** — note down:
   - Project URL (`https://<project-ref>.supabase.co`)
   - `service_role` key (server-side only — this bypasses Row Level Security, so it must **never** reach the client bundle)
3. (Optional) If you want RLS-scoped access instead of always using the service role, add storage policies on `storage.objects` for the bucket — but for a background job writing on the server, the service role key is simplest and fine.

Add to `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx   # server-only, never expose to the client
SUPABASE_STORAGE_BUCKET=hotel-reports

INNGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_SIGNING_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

RESEND_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

Create a Supabase admin client (`src/lib/supabase-admin.ts`):

```ts
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key.
// Do NOT import this from any client component or route that ships to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
```

---

## 3. Set up Inngest

Create the client (`src/lib/inngest.ts`) — unchanged from the R2 version, since Inngest doesn't care about your storage backend:

```ts
import { Inngest, EventSchemas } from "inngest";
import { z } from "zod";

const reportGenerateSchema = z.object({
  name: z.literal("report/generate"),
  data: z.object({
    reportType: z.enum(["inventory", "stock", "occupancy"]),
    requestedBy: z.string(), // user id or email
    recipientEmail: z.string().email(),
    dateFrom: z.string(), // ISO date
    dateTo: z.string(),
  }),
});

export const inngest = new Inngest({
  id: "hotel-management-system",
  schemas: new EventSchemas().fromZod([reportGenerateSchema]),
});
```

Expose the Inngest handler as a Next.js Route Handler (`src/app/api/inngest/route.ts`):

```ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateReportFunction } from "@/inngest/functions/generate-report";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateReportFunction],
});
```

---

## 4. Write the Inngest function

`src/inngest/functions/generate-report.ts`:

```ts
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { renderReportPdf } from "@/lib/pdf/render-report";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!;

export const generateReportFunction = inngest.createFunction(
  { id: "generate-report", retries: 3 },
  { event: "report/generate" },
  async ({ event, step }) => {
    const { reportType, recipientEmail, dateFrom, dateTo } = event.data;

    // Step 1 — Fetch data from Postgres via Prisma
    const rows = await step.run("fetch-data", async () => {
      return prisma.stockMovement.findMany({
        where: {
          createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) },
        },
        include: { item: true, location: true },
        orderBy: { createdAt: "asc" },
      });
    });

    // Step 2 — Render PDF (returns a base64 string; steps must return
    // serializable data since Inngest persists step output between retries)
    const pdfBase64 = await step.run("generate-pdf", async () => {
      const buffer = await renderReportPdf({
        reportType,
        rows,
        dateFrom,
        dateTo,
      });
      return buffer.toString("base64");
    });

    // Step 3 — Upload to Supabase Storage
    const objectKey = await step.run("upload-supabase", async () => {
      const key = `reports/${reportType}/${Date.now()}-${crypto.randomUUID()}.pdf`;
      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(key, Buffer.from(pdfBase64, "base64"), {
          contentType: "application/pdf",
          upsert: false,
        });
      if (error) throw error; // step.run retries on throw
      return key;
    });

    // Step 4 — Get a shareable link (signed URL, expires in 7 days)
    const downloadUrl = await step.run("sign-url", async () => {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(objectKey, 60 * 60 * 24 * 7);
      if (error) throw error;
      return data.signedUrl;
    });

    // Step 5 — Send email
    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "reports@yourdomain.com",
        to: recipientEmail,
        subject: `Your ${reportType} report (${dateFrom} – ${dateTo})`,
        html: `
          <p>Your report is ready.</p>
          <p><a href="${downloadUrl}">Download PDF</a> (link expires in 7 days)</p>
        `,
      });
    });

    return { objectKey, downloadUrl };
  },
);
```

**Why `step.run` matters:** each block is checkpointed. If the email step fails (say, Resend has a blip), Inngest retries just that step — it won't re-query Postgres or regenerate/re-upload the PDF.

**Why `throw error` in the upload/sign steps:** the Supabase JS client doesn't throw on failure the way the S3 SDK does — it returns `{ data, error }`. You have to check `error` yourself and throw explicitly, or Inngest will treat a failed upload as a successful step (since no exception was raised) and move on with a bad key. This is the main behavioral gotcha when porting from the S3-style R2 client.

---

## 5. Build the PDF renderer

Unchanged from the R2 version — PDF generation doesn't touch storage at all.

`src/lib/pdf/render-report.tsx` (using `@react-pdf/renderer`):

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  header: { fontSize: 16, marginBottom: 12, fontWeight: 700 },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    paddingVertical: 4,
  },
  cell: { flex: 1 },
});

type Row = {
  item: { name: string };
  location: { name: string };
  quantity: number;
  createdAt: Date;
};

function ReportDocument({
  rows,
  reportType,
  dateFrom,
  dateTo,
}: {
  rows: Row[];
  reportType: string;
  dateFrom: string;
  dateTo: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{reportType} report</Text>
        <Text>
          {dateFrom} — {dateTo}
        </Text>
        {rows.map((r, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.cell}>{r.item.name}</Text>
            <Text style={styles.cell}>{r.location.name}</Text>
            <Text style={styles.cell}>{r.quantity}</Text>
            <Text style={styles.cell}>
              {r.createdAt.toISOString().slice(0, 10)}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderReportPdf(props: {
  reportType: string;
  rows: Row[];
  dateFrom: string;
  dateTo: string;
}): Promise<Buffer> {
  return renderToBuffer(<ReportDocument {...props} />);
}
```

If you'd rather reuse your existing Tailwind/shadcn styling instead of `@react-pdf`'s own layout primitives, swap this step for `puppeteer` rendering an HTML route to PDF — worth it only if visual fidelity with your app's design matters a lot, since it's a heavier dependency for serverless.

---

## 6. Trigger the job

Unchanged from the R2 version — the trigger side never knew about storage internals.

From an API route or server action, e.g. `src/app/api/reports/route.ts`:

```ts
import { inngest } from "@/lib/inngest";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  await inngest.send({
    name: "report/generate",
    data: {
      reportType: body.reportType,
      requestedBy: body.userId,
      recipientEmail: body.recipientEmail,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
    },
  });

  return NextResponse.json({ status: "queued" });
}
```

From the client (e.g. a "Download report" button with TanStack Query mutation):

```ts
const { mutate } = useMutation({
  mutationFn: (input: ReportInput) =>
    fetch("/api/reports", { method: "POST", body: JSON.stringify(input) }),
});
```

---

## 7. Local development

```bash
npx inngest-cli@latest dev
```

This spins up the Inngest Dev Server at `http://localhost:8288`, where you can see each run, inspect step input/output, and manually re-trigger events — very useful for debugging the PDF/Supabase/email chain without waiting on real emails each time.

Two Supabase-specific notes for local dev:

- You can point `NEXT_PUBLIC_SUPABASE_URL` at a local Supabase instance (`supabase start`, via the Supabase CLI) so uploads during dev don't hit your production bucket.
- Signed URLs from a local instance are only reachable from your machine — fine for testing the flow, but you won't be able to click them from, say, a phone on the same network unless you tunnel it.

---

## 8. Deploying

- **Vercel**: add the Inngest integration (or just set `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` env vars) — Inngest auto-discovers your `/api/inngest` route on deploy.
- Make sure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, and Resend env vars are set in your production environment too.
- Double-check the bucket is **private** in production and that you're relying on `createSignedUrl` rather than a public bucket URL — this keeps reports from being enumerable/guessable.
- The `service_role` key must only ever be read server-side (Inngest function, route handler). If it ends up in a `NEXT_PUBLIC_*` var or a client bundle, anyone can read/write your entire storage project — double check this before deploying.

---

## Summary checklist

- [ ] Supabase bucket created (private), service role key + project URL set
- [ ] Inngest client + `/api/inngest` route wired up
- [ ] Prisma query for the report data
- [ ] PDF renderer (`@react-pdf/renderer` or `puppeteer`)
- [ ] `generate-report` Inngest function with 4–5 `step.run` stages
- [ ] Upload/sign-url steps explicitly check and throw on `{ error }` (Supabase client doesn't throw automatically)
- [ ] Email step (Resend/Nodemailer) with signed Supabase Storage link
- [ ] Trigger wired into an API route or server action
- [ ] Tested locally with `inngest-cli dev`
