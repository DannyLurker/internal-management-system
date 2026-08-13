import { GetFinancialSummaryServiceResult } from "@/features/dashboards/dashboard.types";
import ReportEmail from "@/shared/emails/ReportEmail";
import { inngest } from "@/shared/lib/inngest";
import { renderReportPdf } from "@/shared/lib/pdf/RenderReport";
import { supabaseAdmin } from "@/shared/lib/supabase-admin";
import { ReportGenerateSchema } from "@/shared/lib/zods/report.zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!;

export const generateReportFunction = inngest.createFunction(
  { id: "generate-report", retries: 3, triggers: { event: "report/generate" } },
  async ({
    event,
    step,
  }: {
    event: {
      data: ReportGenerateSchema & {
        data: GetFinancialSummaryServiceResult;
        recipientEmail: string;
      };
    };
    step: any;
  }) => {
    const { recipientEmail, data, dateFrom, dateTo } = event.data;

    const pdfBase64 = await step.run("generate-pdf", async () => {
      // Turn the pdf into buffer because it will be more effiecient rather than handle data byte by byte, and buffer functions as temporary storage
      const buffer = await renderReportPdf({
        data,
        dateFrom,
        dateTo,
      });

      // turn the buffer into base64 string so that it can be saved to inngest database so it can resume after the retries / pauses
      return buffer.toString("base64");
    });

    const objectKey = await step.run("upload-supabase", async () => {
      const key = `reports/${Date.now()}-${crypto.randomUUID()}.pdf`;
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

    const downloadUrl = await step.run("sign-url", async () => {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(objectKey, 60 * 60 * 24 * 7);

      if (error || !data?.signedUrl) {
        throw error || new Error("Failed to create signed URL");
      }
      return data.signedUrl;
    });

    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: recipientEmail,
        subject: `Your report (${dateFrom.split("T")[0]} – ${dateTo.split("T")[0]})`,
        react: ReportEmail({
          dateFrom: dateFrom.split("T")[0],
          dateTo: dateTo.split("T")[0],
          downloadUrl,
        }),
      });
    });

    return { objectKey, downloadUrl };
  },
);
