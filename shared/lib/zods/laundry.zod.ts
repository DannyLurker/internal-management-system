import z from "zod";

export const laundryCreateSchema = z.object({
  laundryId: z.string().min(1),
  actionType: z.enum(["CANCEL", "RETURNED"]),
  destinationLocationId: z.string().min(1),
});

export type LaundryCreateSchema = z.infer<typeof laundryCreateSchema>;
