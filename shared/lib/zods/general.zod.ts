import { Entity } from "@prisma/client";
import z from "zod";

export const page = z.coerce.number().min(1).default(1);
export const dataPerPage = z.coerce.number().min(10).default(10);

export const sortOrderEnum = z.enum(["asc", "desc"]).default("asc");
export const userActionEnum = z.enum(["CREATE", "UPDATE", "DELETE"]);
export const sortItemByEnum = z.enum(["name", "createdAt"]).default("name");
export const entityEnum = z.enum(Object.values(Entity));

export const generateReadableError = (issue: z.core.$ZodIssue): string => {
  const fieldName = issue.path.join(".");

  switch (issue.code) {
    case "invalid_type":
      return issue.input === undefined
        ? `${fieldName} is required`
        : `${fieldName} should be a ${issue.expected}`;
    case "too_small":
      return `${fieldName} must be at least ${issue.minimum} characters`;
    default:
      return issue.message;
  }
};

export const auditLogSchema = z.object({
  userId: z.string(),
  action: userActionEnum,
  entity: entityEnum,
  entityId: z.string(),
  metadata: z.record(z.any(), z.any()).default({}),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
