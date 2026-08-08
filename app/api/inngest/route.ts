import { serve } from "inngest/next";
import { inngest } from "@/shared/lib/inngest";
import { generateReportFunction } from "@/shared/inngest/functions/generate-report";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateReportFunction],
});
