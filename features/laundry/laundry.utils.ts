import { LaundryStatus } from "@prisma/client";

export function getLaundryStatusBadge(status: LaundryStatus) {
  switch (status) {
    case "SENT":
      return {
        label: "SENT (PENDING)",
        className:
          "bg-amber-50 text-amber-800 border-amber-200/80 font-semibold",
      };
    case "RETURNED":
      return {
        label: "RETURNED",
        className:
          "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold",
      };
    case "CANCELLED":
      return {
        label: "CANCELLED",
        className:
          "bg-rose-50 text-rose-800 border-rose-200/80 font-semibold",
      };
    default:
      return {
        label: status,
        className:
          "bg-slate-50 text-slate-700 border-slate-200/80 font-semibold",
      };
  }
}
