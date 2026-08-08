export const reportTypes = ["INVENTORY", "STOCK"] as const;

export type ReportType = (typeof reportTypes)[number];
