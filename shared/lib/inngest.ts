import { Inngest } from "inngest";
import { reportGenerateSchema } from "./zods/report.zod";

export const inngest = new Inngest({
  id: "hotel-management-system",
  schemas: {
    "report/generate": {
      data: reportGenerateSchema,
    },
  },
});
