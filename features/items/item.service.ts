import prisma from "@/shared/db/prisma";
import { unauthorized } from "@/shared/lib/error-handlers";
import { canManageItem } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import { itemCreateSchema, ItemCreateSchema } from "@/shared/lib/zods/item.zod";
import itemRepository from "./item.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";

const itemService = {
  create: async (rawData: ItemCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = itemCreateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    await prisma.$transaction(async (tx) => {
      const item = await itemRepository.create(session.id, validatedData, tx);

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "CREATE",
          entity: "ITEM",
          entityId: item.id,
          metadata: {
            name: item.name,
            categoryId: item.categoryId,
            locationId: validatedData.locationId,
            sellingPrice: item.sellingPrice,
            initialStock: validatedData.stock?.quantity ?? 0,
          },
        },
        tx,
      );
    });
  },
};

export default itemService;
