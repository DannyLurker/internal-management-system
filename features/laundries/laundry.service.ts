import {
  LaundryCreateSchema,
  LaundryGetManySchema,
} from "@/shared/lib/zods/laundry.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { laundryRepository } from "./laundry.repository";
import { forbidden, notFound } from "@/shared/lib/error-handlers";
import { stockRepository } from "../stocks/stock.repository";
import stockMovementsRepository from "../stock-movements/stock-movements.repository";
import { canManageLaundry } from "@/shared/lib/validations/user-access-validation";

export const laundryService = {
  getMany: async (
    session: Session["user"],
    params: LaundryGetManySchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    if (!canManageLaundry(session.role)) {
      throw forbidden("You're not allowed to access laundry records.");
    }

    const whereClause = laundryRepository.buildWhereClause(params);

    const [laundries, totalLaundries] = await Promise.all([
      laundryRepository.getMany(
        whereClause,
        params.page,
        params.dataPerPage,
        params.sortBy,
        params.sortOrder,
        prisma,
      ),
      laundryRepository.countRows(whereClause, prisma),
    ]);

    return {
      laundries,
      totalLaundries,
      page: params.page,
      dataPerPage: params.dataPerPage,
    };
  },

  getById: async (
    session: Session["user"],
    id: string,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    if (!canManageLaundry(session.role)) {
      throw forbidden("You're not allowed to access laundry records.");
    }

    const laundry = await laundryRepository.getById(id, prisma);
    if (!laundry) {
      throw notFound("Laundry movement record not found");
    }

    return {
      laundry: laundry,
    };
  },

  create: async (
    session: Session["user"],
    data: LaundryCreateSchema,
    prisma: Prisma.TransactionClient | PrismaClient,
  ) => {
    const result = await prisma.$transaction(async (tx) => {
      const laundry = await laundryRepository.findById(data.laundryId, tx);

      if (!laundry) {
        throw notFound("Laundry data not found");
      }

      const vendorLaundryStock = await stockRepository.findById(
        laundry.vendorLaundryStockId,
        tx,
      );

      if (!vendorLaundryStock) throw notFound("Vendor laundry not found");

      let destinationStock;

      if (data.actionType === "RETURNED") {
        destinationStock = await stockRepository.findOrUpdateOrCreate(
          {
            locationId: data.destinationLocationId,
            type: vendorLaundryStock?.type,
            expiredAt: vendorLaundryStock?.expiredAt,
            itemId: vendorLaundryStock?.itemId,
          },
          {},
          {
            location: {
              connect: {
                id: data.destinationLocationId,
              },
            },
            type: vendorLaundryStock?.type,
            expiredAt: vendorLaundryStock?.expiredAt,
            item: {
              connect: {
                id: vendorLaundryStock?.itemId,
              },
            },
            creator: {
              connect: {
                id: session.id,
              },
            },
          },
          prisma,
        );

        const unitCost =
          vendorLaundryStock?.quantity > 0
            ? (vendorLaundryStock.totalCost ?? 0) / vendorLaundryStock.quantity
            : 0;
        const totalCost = laundry.quantity * unitCost;

        await stockMovementsRepository.create(
          {
            itemId: laundry.itemId,
            stockId: destinationStock.id,
            itemName: laundry.item.name,
            createdBy: session.id,
            quantity: laundry.quantity,
            reason: `${laundry.item.name} has laundered out`,
            type: "LAUNDRY_IN",
            sourceLocationId: vendorLaundryStock.locationId,
            destinationLocationId: data.destinationLocationId,
            totalCost: totalCost,
          },
          tx,
        );

        await stockRepository.update(
          destinationStock?.id,
          {
            quantity: {
              increment: laundry.quantity,
            },
            totalCost: {
              increment: totalCost,
            },
          },
          tx,
        );

        await stockRepository.update(
          vendorLaundryStock.id,
          {
            quantity: {
              decrement: laundry.quantity,
            },
            totalCost: {
              decrement: totalCost,
            },
          },
          tx,
        );

        await laundryRepository.update(
          laundry.id,
          {
            returnedAt: new Date(),
            status: "RETURNED",
          },
          tx,
        );
      }

      if (data.actionType === "CANCELLED") {
        destinationStock = await stockRepository.findOrUpdateOrCreate(
          {
            locationId: data.destinationLocationId,
            type: "DIRTY",
            expiredAt: vendorLaundryStock?.expiredAt,
            itemId: vendorLaundryStock?.itemId,
          },
          {},
          {
            location: {
              connect: {
                id: data.destinationLocationId,
              },
            },
            type: "DIRTY",
            expiredAt: vendorLaundryStock?.expiredAt,
            item: {
              connect: {
                id: vendorLaundryStock?.itemId,
              },
            },
            creator: {
              connect: {
                id: session.id,
              },
            },
          },
          prisma,
        );

        const unitCost =
          vendorLaundryStock?.quantity > 0
            ? (vendorLaundryStock.totalCost ?? 0) / vendorLaundryStock.quantity
            : 0;
        const totalCost = laundry.quantity * unitCost;

        await stockMovementsRepository.create(
          {
            itemId: laundry.itemId,
            stockId: destinationStock.id,
            itemName: laundry.item.name,
            createdBy: session.id,
            quantity: laundry.quantity,
            reason: `${laundry.item.name} has laundered out`,
            type: "MARK_AS_EXPIRED",
            sourceLocationId: vendorLaundryStock.locationId,
            destinationLocationId: data.destinationLocationId,
            totalCost: totalCost,
          },
          tx,
        );

        await stockRepository.update(
          destinationStock?.id,
          {
            quantity: {
              increment: laundry.quantity,
            },
            totalCost: {
              increment: totalCost,
            },
          },
          tx,
        );

        await stockRepository.update(
          vendorLaundryStock.id,
          {
            quantity: {
              decrement: laundry.quantity,
            },
            totalCost: {
              decrement: totalCost,
            },
          },
          tx,
        );

        await laundryRepository.update(
          laundry.id,
          {
            returnedAt: new Date(),
            status: "CANCELLED",
          },
          tx,
        );
      }

      return { laundry: laundry, destinationStock: destinationStock };
    });

    return {
      message: `${result.laundry.item.name} ${data.actionType.toLowerCase()} successfully`,
      laundryId: result.laundry.id,
      destinationStockId: result.destinationStock?.id,
    };
  },
};
