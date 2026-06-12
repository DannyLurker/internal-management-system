import prisma from "@/shared/db/prisma";
import { badRequest, forbidden, notFound } from "@/shared/lib/error-handlers";
import {
  canDeleteLocation,
  canManageLocation,
} from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  locationCreateSchema,
  LocationCreateSchema,
  locationGetSchema,
  locationGetSpesificSchema,
  locationUpdateSchema,
  LocationUpdateSchema,
} from "@/shared/lib/zods/location.zod";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import {
  locationRepository,
  locationSelectData,
  locationWhereUniqueInput,
} from "./location.repository";
import { Prisma } from "@prisma/client";

const locationService = {
  create: async (rawData: LocationCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = locationCreateSchema.parse(rawData);

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const created = await prisma.$transaction(async (tx) => {
      const location = await locationRepository.create(
        {
          name: validatedData.name,
          type: validatedData.type,
          description: validatedData.description,
          userCreatedBy: {
            connect: {
              id: session.id,
            },
          },
        },
        tx,
      );

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "CREATE",
          entity: "LOCATION",
          entityId: location.id,
          metadata: {
            name: location.name,
            type: location.type,
            description: location.description,
          },
        },
        tx,
      );

      return location;
    });

    return {
      message: `${created.name} created successfully`,
      id: created.id,
    };
  },

  get: async (locationId: string, params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = locationGetSpesificSchema.parse(params);

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const whereQuery = locationWhereUniqueInput({
      id: locationId,
    });

    const skip =
      (validatedParams.itemPage - 1) * validatedParams.itemDataPerPage;

    const take = validatedParams.itemDataPerPage;

    const selectData = locationSelectData({
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      description: true,
      type: true,
      userCreatedBy: { select: { name: true } },
      userUpdatedBy: { select: { name: true } },
      stocks: {
        select: {
          item: { select: { name: true } },
          quantity: true,
          type: true,
        },
        where: {
          ...(validatedParams.stockStatusType
            ? { type: validatedParams.stockStatusType }
            : {}),
          ...(validatedParams.itemSearchQuery &&
          validatedParams.itemSearchQuery.length >= 3
            ? {
                item: {
                  name: {
                    contains: validatedParams.itemSearchQuery,
                    mode: "insensitive",
                  },
                },
              }
            : {}),
        },
        orderBy: [
          ...(validatedParams.sortBy === "stockType"
            ? [{ type: validatedParams.sortOrder }]
            : []),
          ...(validatedParams.sortBy === "name"
            ? [{ item: { name: validatedParams.sortOrder } }]
            : []),
        ],
        skip,
        take,
      },
    });

    const location = await locationRepository.get(
      whereQuery,
      selectData,
      prisma,
    );

    if (!location) throw notFound("Location not found");

    const totalStocksCount = await prisma.stock.count({
      where: {
        locationId: locationId,
        ...(validatedParams.stockStatusType
          ? { type: validatedParams.stockStatusType }
          : {}),
        ...(validatedParams.itemSearchQuery &&
        validatedParams.itemSearchQuery.length >= 3
          ? {
              item: {
                name: {
                  contains: validatedParams.itemSearchQuery,
                  mode: "insensitive",
                },
              },
            }
          : {}),
      },
    });

    return {
      message: "Location retrieved successfully",
      data: { location, totalStocks: totalStocksCount },
    };
  },

  getMany: async (params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = locationGetSchema.parse(params);

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    let whereQuery: Prisma.LocationWhereInput = {};

    if (
      validatedParams.searchQuery &&
      validatedParams.searchQuery.length >= 3
    ) {
      whereQuery.name = {
        contains: validatedParams.searchQuery,
        mode: "insensitive",
      };
    }

    if (validatedParams.locationType) {
      whereQuery.type = validatedParams.locationType;
    }

    const selectData = locationSelectData({
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      description: true,
      type: true,
      userCreatedBy: {
        select: {
          name: true,
        },
      },
      userUpdatedBy: {
        select: {
          name: true,
        },
      },
    });

    const skip = (validatedParams.page - 1) * validatedParams.dataPerPage;

    const take = validatedParams.dataPerPage;

    const locations = await locationRepository.getMany(
      whereQuery,
      selectData,
      skip,
      take,
      validatedParams.sortOrderEnum,
      validatedParams.sortBy,
      prisma,
    );

    const totalCount = await prisma.location.count({
      where: whereQuery,
    });

    return {
      message: "Locations retrieved successfully",
      data: { locations, totalCount },
    };
  },

  update: async (rawData: LocationUpdateSchema) => {
    const session = await sessionValidation();
    const validatedData = locationUpdateSchema.parse(rawData);

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const selectData = locationSelectData({
        name: true,
        type: true,
        description: true,
      });

      const existing = await locationRepository.get(
        { id: validatedData.locationId },
        selectData,
        tx,
      );
      if (!existing) throw notFound("Location not found");

      const location = await locationRepository.update(
        validatedData.locationId,
        {
          name: validatedData.name,
          type: validatedData.type,
          description: validatedData.description,
          userCreatedBy: {
            connect: {
              id: session.id,
            },
          },
        },
        tx,
      );

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "UPDATE",
          entity: "LOCATION",
          entityId: location.id,
          metadata: {
            id: location.id,
            old: {
              name: existing.name,
              type: existing.type,
              description: existing.description,
            },
            new: {
              name: location.name,
              type: location.type,
              description: location.description,
            },
          },
        },
        tx,
      );

      return location;
    });

    return {
      message: `${updated.name} updated successfully`,
    };
  },

  delete: async (locationId: string) => {
    const session = await sessionValidation();

    if (!canDeleteLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const deleted = await prisma.$transaction(async (tx) => {
      const selectData = locationSelectData({
        id: true,
        name: true,
        type: true,
        description: true,
        stocks: {
          select: {
            id: true,
          },
          take: 1,
        },
      });

      const existing = await locationRepository.get(
        { id: locationId },
        selectData,
        tx,
      );

      if (!existing) throw notFound("Location not found");

      if (existing.id)
        throw badRequest(
          "Item was found in this location. Migrate all the item before deleting.",
        );

      const location = await locationRepository.delete(locationId, tx);

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "DELETE",
          entity: "LOCATION",
          entityId: location.id,
          metadata: {
            id: existing.id,
            name: existing.name,
            type: existing.type,
            description: existing.description,
          },
        },
        tx,
      );

      return location;
    });

    return {
      message: `${deleted.name} deleted successfully`,
    };
  },
};

export default locationService;
