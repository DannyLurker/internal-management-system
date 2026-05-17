import { AuditLog } from "@/shared/lib/zods/general.zod";
import { Entity, Prisma, PrismaClient } from "@prisma/client";

const auditLogsRepository = {
  create: async (
    data: AuditLog,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity as Entity,
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  },
};

export default auditLogsRepository;
