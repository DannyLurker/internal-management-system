import prisma from "@/shared/db/prisma";
import { inngest } from "@/shared/lib/inngest";
import { renderReportPdf } from "@/shared/lib/pdf/RenderReport";
import { supabaseAdmin } from "@/shared/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!;

export const generateReportFunction = inngest.createFunction(
  { id: "generate-report", retries: 3, triggers: { event: "report/generate" } },
  async ({ event, step }: { event: any; step: any }) => {
    const { reportType, recipientEmail, dateFrom, dateTo } = event.data;

    // Step 1 — Fetch data dari Postgres via Prisma
    const rows = await step.run("fetch-data", async () => {
      return prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
        include: {
          item: true,
          destinationLocation: true,
          sourceLocation: true,
        },
        orderBy: { createdAt: "asc" },
      });
    });

    // Step 2 — Render PDF
    const pdfBase64 = await step.run("generate-pdf", async () => {
      const buffer = await renderReportPdf({
        reportType,
        rows,
        dateFrom,
        dateTo,
      });
      return buffer.toString("base64");
    });

    // Step 3 — Upload ke Supabase Storage (Menggunakan Uint8Array agar aman secara tipe)
    const objectKey = await step.run("upload-supabase", async () => {
      const key = `reports/${reportType}/${Date.now()}-${crypto.randomUUID()}.pdf`;
      const fileBuffer = new Uint8Array(Buffer.from(pdfBase64, "base64"));

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(key, fileBuffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (error) throw error;
      return key;
    });

    // Step 4 — Buat Signed URL (Expired dalam 7 hari)
    const downloadUrl = await step.run("sign-url", async () => {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(objectKey, 60 * 60 * 24 * 7);

      if (error || !data?.signedUrl) {
        throw error || new Error("Failed to create signed URL");
      }
      return data.signedUrl;
    });

    // Step 5 — Kirim Email
    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "onboarding@resend.dev",
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
