import z from "zod";

export const reportGenerateSchema = z.object({
  dateFrom: z.string(),
  dateTo: z.string(),
});

export type ReportGenerateSchema = z.infer<typeof reportGenerateSchema>;
