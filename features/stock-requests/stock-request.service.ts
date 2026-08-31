import {
  StockRequestCreateSchema,
  StockRequestReviewSchema,
  StockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import itemRepository from "../items/item.repository";
import { locationRepository } from "../locations/location.repository";
import { badRequest, notFound } from "@/shared/lib/error-handlers";
import stockRequestRepository from "./stock-request.repository";
import { sendPushToUser } from "@/shared/lib/push";
import { stockRepository } from "../stocks/stock.repository";

const stockRequestService = {
  create: async (
    session: Session["user"],
    data: StockRequestCreateSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const [item, sourceLocation, destinationLocation] = await Promise.all([
      itemRepository.findById(data.itemId, prisma),
      locationRepository.findById(data.sourceLocationId, prisma),
      locationRepository.findById(data.destinationLocationId, prisma),
    ]);

    if (!item) throw badRequest("Item not found");
    if (!sourceLocation) throw badRequest("Source location not found");
    if (!destinationLocation)
      throw badRequest("Destination location not found");

    const stockRequest = await stockRequestRepository.create(
      session.id,
      {
        itemId: data.itemId,
        quantity: data.quantity,
        sourceLocationId: data.sourceLocationId,
        destinationLocationId: data.destinationLocationId,
        requestType: data.requestType,
      },
      prisma,
    );

    sendPushToUser(null, ["HOTEL_MANAGER", "SUPERVISOR"], {
      title: "New Stock Request",
      body: `${session.name} has submitted a new stock request.`,
      url: process.env.NEXT_PUBLIC_BASE_URL!,
    });

    return {
      message: "Stock request created successfully",
      data: {
        id: stockRequest.id,
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
        locationRepository.findById(data.sourceLocationId, prisma),
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

    const result = await stockRequestRepository.update(
      stockRequestId,
      data,
      prisma,
    );

    return {
      message: `Stock request updated successfully`,
      stockRequestId: result.id,
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

    const reviewedStockRequest = await stockRequestRepository.review(
      session.id,
      stockRequestId,
      data,
      prisma,
    );

    sendPushToUser(reviewedStockRequest.requestedById, null, {
      title: "Stock Request Reviewed",
      body: `Your stock request has been ${data.stockRequestStatus.toLowerCase()}.`,
      url: process.env.NEXT_PUBLIC_BASE_URL!,
    });

    return {
      message: "Stock request reviewed successfully",
      stockRequestId: reviewedStockRequest.id,
    };
  },
};

export default stockRequestService;
