# Guide: DB → PDF → Cloudflare R2 → Email (via Inngest)

This guide is written for your stack: **Next.js (App Router) + TypeScript (strict) + PostgreSQL/Prisma + Zod**, deployed with a background job pipeline that:

1. Queries data from Postgres via Prisma
2. Renders it into a PDF
3. Uploads the PDF to Cloudflare R2
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
   ├─ step.run("fetch-data")     → Prisma query
   ├─ step.run("generate-pdf")   → PDF buffer
   ├─ step.run("upload-r2")      → PutObjectCommand
   └─ step.run("send-email")     → Resend/Nodemailer
```

Inngest is the right tool here because each step is retried independently if it fails (e.g. if the email provider times out, you don't re-run the DB query or re-upload the PDF).

---

## 1. Install dependencies

```bash
npm install inngest
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner   # R2 is S3-compatible
npm install @react-pdf/renderer                                # PDF generation
npm install resend                                              # or nodemailer
```

Notes on choices:
- **`@react-pdf/renderer`** — good fit since you're already in a React/TS codebase; lets you define PDF layout as JSX components. Alternatives: `pdfkit` (lower-level, more control) or `puppeteer` (render an HTML/Tailwind template to PDF — heavier, but reuses your existing shadcn/Tailwind styling).
- **`resend`** — simple DX, good deliverability, easy to swap for `nodemailer` + SMTP if you already have a provider.

---

## 2. Set up Cloudflare R2

1. In the Cloudflare dashboard: **R2 → Create bucket** (e.g. `hotel-reports`).
2. **R2 → Manage API tokens → Create API token** with Object Read & Write scoped to that bucket.
3. Note down:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Bucket name
   - (Optional) a public bucket URL or custom domain if you want direct links instead of signed URLs.

Add to `.env`:

```bash
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=hotel-reports
R2_PUBLIC_URL=https://reports.yourdomain.com   # if using a custom domain / public bucket

INNGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_SIGNING_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

RESEND_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

Create an R2 client (`src/lib/r2.ts`):

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

---

## 3. Set up Inngest

Create the client (`src/lib/inngest.ts`):

```ts
import { Inngest, EventSchemas } from "inngest";
import { z } from "zod";

const reportGenerateSchema = z.object({
  name: z.literal("report/generate"),
  data: z.object({
    reportType: z.enum(["inventory", "stock", "occupancy"]),
    requestedBy: z.string(),      // user id or email
    recipientEmail: z.string().email(),
    dateFrom: z.string(),         // ISO date
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
import { r2 } from "@/lib/r2";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { renderReportPdf } from "@/lib/pdf/render-report";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      const buffer = await renderReportPdf({ reportType, rows, dateFrom, dateTo });
      return buffer.toString("base64");
    });

    // Step 3 — Upload to R2
    const objectKey = await step.run("upload-r2", async () => {
      const key = `reports/${reportType}/${Date.now()}-${crypto.randomUUID()}.pdf`;
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: Buffer.from(pdfBase64, "base64"),
          ContentType: "application/pdf",
        })
      );
      return key;
    });

    // Step 4 — Get a shareable link (signed URL, expires in 7 days)
    const downloadUrl = await step.run("sign-url", async () => {
      return getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: objectKey }),
        { expiresIn: 60 * 60 * 24 * 7 }
      );
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
  }
);
```

**Why `step.run` matters:** each block is checkpointed. If the email step fails (say, Resend has a blip), Inngest retries just that step — it won't re-query Postgres or regenerate/re-upload the PDF.

---

## 5. Build the PDF renderer

`src/lib/pdf/render-report.tsx` (using `@react-pdf/renderer`):

```tsx
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  header: { fontSize: 16, marginBottom: 12, fontWeight: 700 },
  row: { flexDirection: "row", borderBottom: "1 solid #eee", paddingVertical: 4 },
  cell: { flex: 1 },
});

type Row = { item: { name: string }; location: { name: string }; quantity: number; createdAt: Date };

function ReportDocument({ rows, reportType, dateFrom, dateTo }: {
  rows: Row[]; reportType: string; dateFrom: string; dateTo: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{reportType} report</Text>
        <Text>{dateFrom} — {dateTo}</Text>
        {rows.map((r, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.cell}>{r.item.name}</Text>
            <Text style={styles.cell}>{r.location.name}</Text>
            <Text style={styles.cell}>{r.quantity}</Text>
            <Text style={styles.cell}>{r.createdAt.toISOString().slice(0, 10)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderReportPdf(props: {
  reportType: string; rows: Row[]; dateFrom: string; dateTo: string;
}): Promise<Buffer> {
  return renderToBuffer(<ReportDocument {...props} />);
}
```

If you'd rather reuse your existing Tailwind/shadcn styling instead of `@react-pdf`'s own layout primitives, swap this step for `puppeteer` rendering an HTML route to PDF — worth it only if visual fidelity with your app's design matters a lot, since it's a heavier dependency for serverless.

---

## 6. Trigger the job

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

This spins up the Inngest Dev Server at `http://localhost:8288`, where you can see each run, inspect step input/output, and manually re-trigger events — very useful for debugging the PDF/R2/email chain without waiting on real emails each time.

---

## 8. Deploying

- **Vercel**: add the Inngest integration (or just set `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` env vars) — Inngest auto-discovers your `/api/inngest` route on deploy.
- Make sure R2 and Resend env vars are set in your production environment too.
- Double check your R2 bucket's CORS/public-access settings if you intend the signed URL to be opened directly in a browser from your app's domain.

---

## Summary checklist

- [ ] R2 bucket + API token created, env vars set
- [ ] Inngest client + `/api/inngest` route wired up
- [ ] Prisma query for the report data
- [ ] PDF renderer (`@react-pdf/renderer` or `puppeteer`)
- [ ] `generate-report` Inngest function with 4–5 `step.run` stages
- [ ] Email step (Resend/Nodemailer) with signed R2 link
- [ ] Trigger wired into an API route or server action
- [ ] Tested locally with `inngest-cli dev`
