import { badRequest, forbidden, notFound } from "@/shared/lib/error-handlers";
import {
  canDeleteAllStockRequest,
  canDeleteOwnStockRequest,
} from "@/shared/lib/validations/user-access-validation";
import { Session } from "next-auth";
import { ItemRepositoryFindById } from "../items/item.types";
import { StockRepositoryFindById } from "../stocks/stock.types";
import { LocationRepositoryFindById } from "../locations/location.types";
import { StockRequestUpdateSchema } from "@/shared/lib/zods/stock-request.zod";
import { StockRequestRepositoryFindById } from "./stock-request.types";

export function assertCanCreateStockRequest(
  item: ItemRepositoryFindById | undefined | null,
  stock: StockRepositoryFindById,
  destinationLocation: LocationRepositoryFindById,
  totalReadyStock: number | undefined | null,
  requestedQuantity: number,
) {
  if (!item) throw badRequest("Item not found");
  if (!stock) throw badRequest("Stock not found");
  if (!destinationLocation) throw badRequest("Destination location not found");

  if (totalReadyStock === undefined || totalReadyStock === null) {
    throw badRequest("Unable to determine the total ready stock.");
  }

  if (totalReadyStock < requestedQuantity) {
    throw badRequest("Requested quantity exceeds the available stock.");
  }
}

export function assertCanUpdateStockRequest(
  data: StockRequestUpdateSchema,
  stockRequest: StockRequestRepositoryFindById,
  sourceLocation: LocationRepositoryFindById,
  destinationLocation: LocationRepositoryFindById,
) {
  if (!sourceLocation && data.sourceLocationId)
    throw notFound("Source location not found");
  if (!destinationLocation) throw notFound("Destination location not found");
  if (!stockRequest) throw notFound("Stock request not found");

  if (stockRequest.status !== "PENDING")
    throw badRequest("Can't update a stock request that has been reviewed");

  if (sourceLocation!.id === destinationLocation.id)
    throw badRequest("Source location and destination location can't be same");
}

export function assertCanDeleteStockRequest(
  session: Session["user"],
  stockRequest: { requestedById: string },
): void {
  // If the user has global delete permission, allow execution
  if (canDeleteAllStockRequest(session.role)) {
    return;
  }

  // If the user has self-delete permission, enforce ownership match
  if (canDeleteOwnStockRequest(session.role)) {
    if (stockRequest.requestedById !== session.id) {
      throw forbidden(
        "You are only allowed to delete your own stock requests.",
      );
    }
    return;
  }

  // Reject all other cases
  throw forbidden("You are not allowed to delete this stock request.");
}
