import {
  StockRequestCreateSchema,
  StockRequestFilterSchema,
  StockRequestReviewSchema,
  StockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";
import { MovementType, Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import itemRepository from "../items/item.repository";
import { locationRepository } from "../locations/location.repository";
import { badRequest, notFound } from "@/shared/lib/error-handlers";

import { sendPushToUser } from "@/shared/lib/push";
import { stockRepository } from "../stocks/stock.repository";
import {
  createStockRequestOrderByQuery,
  createStockRequestSelect,
  createStockRequestWhereQuery,
  stockRequestRepository,
} from "./stock-request.repository";
import stockMovementsService from "../stock-movements/stock-movements.service";
import auditLogsRepository from "../audit-logs/audit-log.repository";

const stockRequestService = {
  create: async (
    session: Session["user"],
    data: StockRequestCreateSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const [item, stock, destinationLocation] = await Promise.all([
      itemRepository.findById(data.itemId, prisma),
      stockRepository.findById(data.stockId, prisma),
      locationRepository.findById(data.destinationLocationId, prisma),
    ]);

    // TODO: Create a validation to check wether the requested stock exceeds the limit or not

    if (!item) throw badRequest("Item not found");
    if (!stock) throw badRequest("Stock not found");
    if (!destinationLocation)
      throw badRequest("Destination location not found");

    const transaction = await prisma.$transaction(async (tx) => {
      const stockRequest = await stockRequestRepository.create(
        {
          item: {
            connect: {
              id: data.itemId,
            },
          },
          requestedQuantity: data.quantity,
          sourceLocation: { connect: { id: stock.locationId } },
          destinationLocation: {
            connect: { id: data.destinationLocationId },
          },
          type: data.requestType,
          reason: data.reason,
          requestedBy: { connect: { id: session.id } },
        },
        tx,
      );

      sendPushToUser(null, ["HOTEL_MANAGER", "SUPERVISOR"], {
        title: "New Stock Request",
        body: `${session.name} has submitted a new stock request.`,
        url: process.env.NEXT_PUBLIC_BASE_URL!,
      });

      await auditLogsRepository.create(
        {
          entity: "STOCK_REQUEST",
          action: "CREATE",
          entityId: stockRequest.id,
          metadata: {
            itemId: stockRequest.itemId,
            quantity: stockRequest.requestedQuantity,
            sourceLocationId: stockRequest.sourceLocationId,
            destinationLocationId: stockRequest.destinationLocationId,
            requestType: stockRequest.type,
            reason: stockRequest.reason,
          },
          userId: session.id,
        },
        tx,
      );

      return { stockRequest };
    });

    return {
      message: "Stock request created successfully",
      data: {
        id: transaction.stockRequest.id,
      },
    };
  },

  update: async (
    session: Session["user"],
    stockRequestId: string,
    data: StockRequestUpdateSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const [sourceLocation, destinationLocation, stockRequest] =
      await Promise.all([
        data.sourceLocationId
          ? locationRepository.findById(data.sourceLocationId, prisma)
          : null,
        locationRepository.findById(data.destinationLocationId, prisma),
        stockRequestRepository.findById(stockRequestId, prisma),
      ]);

    if (!sourceLocation) throw notFound("Source location not found");
    if (!destinationLocation) throw notFound("Destination location not found");
    if (!stockRequest) throw notFound("Stock request not found");

    if (stockRequest.status !== "PENDING")
      throw badRequest("Can't update a stock request that has been reviewed");

    if (sourceLocation.id === destinationLocation.id)
      throw badRequest(
        "Source location and destination location can't be same",
      );

    const transaction = await prisma.$transaction(async (tx) => {
      const updatedStockRequest = await stockRequestRepository.update(
        stockRequestId,
        data,
        tx,
      );

      await auditLogsRepository.create(
        {
          entity: "STOCK_REQUEST",
          action: "CREATE",
          entityId: updatedStockRequest.id,
          metadata: {
            stockRequestId: updatedStockRequest.id,
            quantity: updatedStockRequest.requestedQuantity,
            sourceLocationId: updatedStockRequest.sourceLocationId,
            destinationLocationId: updatedStockRequest.destinationLocationId,
            requestType: updatedStockRequest.type,
            reason: updatedStockRequest.reason,
          },
          userId: session.id,
        },
        tx,
      );

      return {
        updatedStockRequest,
      };
    });

    return {
      message: `Stock request updated successfully`,
      stockRequestId: transaction.updatedStockRequest.id,
    };
  },

  review: async (
    session: Session["user"],
    stockRequestId: string,
    data: StockRequestReviewSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const stockRequest = await stockRequestRepository.findById(
      stockRequestId,
      prisma,
    );

    if (!stockRequest) throw notFound("Stock request not found");

    if (stockRequest.status !== "PENDING") {
      throw badRequest("This stock request has already been reviewed.");
    }

    if (stockRequest?.type !== data.stockRequestType) {
      throw badRequest("Stock request type mismatch");
    }

    const totalActiveReadyStock = await stockRepository.aggregate(
      {
        itemId: stockRequest.itemId,
      },
      { quantity: true },
      prisma,
    );

    // Guard clause: Ensure stock record exists
    if (
      totalActiveReadyStock.quantity === null ||
      totalActiveReadyStock.quantity === undefined
    ) {
      throw notFound("Stock record not found.");
    }

    if (
      !totalActiveReadyStock ||
      totalActiveReadyStock.quantity < data.approvedQuantity
    ) {
      throw badRequest(
        "Approved quantity cannot exceed the total ready stock quantity.",
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const reviewedStockRequest = await stockRequestRepository.review(
        session.id,
        stockRequestId,
        data,
        tx,
      );

      let stockMovementType: MovementType;

      switch (stockRequest.type) {
        case "ISSUE":
          stockMovementType = "CONSUME";
          break;
        case "RESTOCK":
          stockMovementType = "RECEIVE";
          break;
        case "SALE":
          stockMovementType = "SALE";
          break;
        case "TRANSFER":
          stockMovementType = "TRANSFER";
          break;
        case "REPORT_LOST":
          stockMovementType = "MARK_AS_LOST";
          break;
        case "WRITE_OFF":
          stockMovementType = data.writeOffTypeDecision as MovementType;
          break;
        case "LAUNDRY_IN":
          stockMovementType = "LAUNDRY_IN";
          break;
        case "LAUNDRY_OUT":
          stockMovementType = "LAUNDRY_OUT";
          break;
        default:
          throw badRequest("Invalid stock request type");
      }

      const stock = await stockRepository.findFirst(
        {
          itemId: stockRequest.itemId,
          locationId: stockRequest.sourceLocationId
            ? stockRequest.sourceLocationId
            : stockRequest.destinationLocationId,
        },
        tx,
      );

      await stockMovementsService.create(
        session,
        {
          itemId: stockRequest.itemId,
          quantity: data.approvedQuantity,
          reason: stockRequest.reason,
          stockMovementType,
          destinationLocationId: stockRequest.destinationLocationId,
          stockId: stock?.id,
          isGlobalStock: stockRequest.sourceLocationId === null,
        },
        tx,
      );

      sendPushToUser(reviewedStockRequest.requestedById, null, {
        title: "Stock Request Reviewed",
        body: `Your stock request has been ${data.stockRequestStatus.toLowerCase()}.`,
        url: process.env.NEXT_PUBLIC_BASE_URL!,
      });

      await auditLogsRepository.create(
        {
          entity: "STOCK_REQUEST",
          action: "CREATE",
          entityId: reviewedStockRequest.id,
          metadata: {
            itemId: reviewedStockRequest.itemId,
            quantity: reviewedStockRequest.requestedQuantity,
            sourceLocationId: reviewedStockRequest.sourceLocationId,
            destinationLocationId: reviewedStockRequest.destinationLocationId,
            requestType: reviewedStockRequest.type,
            reason: reviewedStockRequest.reason,
          },
          userId: session.id,
        },
        tx,
      );

      return {
        reviewedStockRequest,
      };
    });

    return {
      message: "Stock request reviewed successfully",
      stockRequestId: transaction.reviewedStockRequest.id,
    };
  },

  getMany: async (
    session: Session["user"],
    filters: StockRequestFilterSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const where = createStockRequestWhereQuery(session, filters);
    const orderBy = createStockRequestOrderByQuery(
      filters.sortBy,
      filters.sortOrder,
    );

    const select = createStockRequestSelect({
      approvedBy: { select: { id: true, name: true } },
      requestedBy: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
      item: { select: { id: true, name: true } },
      type: true,
      status: true,
      destinationLocation: { select: { id: true, name: true } },
      sourceLocation: { select: { id: true, name: true } },
      decisionNotes: true,
      requestedQuantity: true,
      approvedQuantity: true,
    });

    const take = filters.dataPerPage;
    const skip = (filters.page - 1) * take;

    const [stockRequests, totalStockRequests] = await Promise.all([
      stockRequestRepository.getMany(
        where,
        select,
        orderBy,
        skip,
        take,
        prisma,
      ),
      stockRequestRepository.countRows(where, prisma),
    ]);

    return {
      message: "Stock requests successfully retrieved",
      data: { stockRequests, totalStockRequests: totalStockRequests },
    };
  },

  getById: async (
    session: Session["user"],
    stockRequestId: string,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const select = createStockRequestSelect({
      approvedBy: { select: { id: true, name: true } },
      requestedBy: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
      item: { select: { id: true, name: true } },
      type: true,
      status: true,
      destinationLocation: { select: { id: true, name: true } },
      sourceLocation: { select: { id: true, name: true } },
      decisionNotes: true,
      requestedQuantity: true,
      approvedQuantity: true,
    });

    const stockRequest = await stockRequestRepository.getById(
      stockRequestId,
      select,
      prisma,
    );

    if (!stockRequest) throw notFound("Stock request not found");

    return {
      message: "Stock request retrieved successfully",
      stockRequest,
    };
  },
};

export default stockRequestService;
