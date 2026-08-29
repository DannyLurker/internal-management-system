import { StockRequestCreateSchema } from "@/shared/lib/zods/stock-request.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import itemRepository from "../items/item.repository";
import { locationRepository } from "../locations/location.repository";
import { badRequest } from "@/shared/lib/error-handlers";
import stockRequestRepository from "./stock-request.repository";
import { sendPushToUser } from "@/shared/lib/push";

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
      url: process.env.BASE_URL,
    });

    return {
      message: "Stock request created successfully",
      data: {
        id: stockRequest.id,
      },
    };
  },
};

export default stockRequestService;
