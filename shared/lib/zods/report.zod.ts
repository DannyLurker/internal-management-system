import z from "zod";
import { reportTypeEnum } from "./general.zod";

export const reportGenerateSchema = z.object({
  reportType: reportTypeEnum,
  recipientEmail: z.email(),
  dateFrom: z.string(),
  dateTo: z.string(),
});
