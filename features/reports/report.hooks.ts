import { ReportGenerateSchema } from "@/shared/lib/zods/report.zod";
import { useMutation } from "@tanstack/react-query";
import reportApi from "./report.api";
import { toast } from "sonner";

export const useCreatePdfReport = () => {
  return useMutation({
    mutationFn: (payload: ReportGenerateSchema) => reportApi.createPdf(payload),
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (res) => {
      toast.error(res.message);
    },
  });
};
