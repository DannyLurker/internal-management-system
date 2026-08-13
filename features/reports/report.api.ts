import { api } from "@/shared/lib/api-client";
import { GeneratePdfReportApiResponse } from "./report.types";
import { ReportGenerateSchema } from "@/shared/lib/zods/report.zod";

const reportApi = {
  createPdf: async (payload: ReportGenerateSchema) => {
    const result = await api.post<GeneratePdfReportApiResponse>(
      "/reports",
      payload,
    );

    return result.data;
  },
};

export default reportApi;
