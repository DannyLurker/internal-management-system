import prisma from "@/shared/db/prisma";
import { forbidden, notFound } from "@/shared/lib/error-handlers";
import { canManageLocation } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  locationCreateSchema,
  LocationCreateSchema,
  locationGetSchema,
  locationUpdateSchema,
  LocationUpdateSchema,
} from "@/shared/lib/zods/location.zod";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { locationRepository, locationSelectData } from "./location.repository";
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

  get: async (locationId: string) => {
    const session = await sessionValidation();

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const selectData = locationSelectData({
      name: true,
      description: true,
      type: true,
      stocks: {
        select: {
          item: {
            select: {
              name: true,
            },
          },
          quantity: true,
        },
      },
      createdAt: true,
      createdBy: true,
      updatedAt: true,
      updatedBy: true,
    });

    const location = await locationRepository.get(
      locationId,
      selectData,
      prisma,
    );
    if (!location) throw notFound("Location not found");

    return {
      message: "Location retrieved successfully",
      location,
    };
  },

  getMany: async (params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = locationGetSchema.parse(params);

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    // skip and take bisa di akal akalin
    let whereQuery: Prisma.LocationFindManyArgs = {};

    if (
      validatedParams.searchQuery &&
      validatedParams.searchQuery.length >= 3
    ) {
      whereQuery.name = {
        contains: validatedParams.searchQuery,
        mode: "insensitive",
      };
    }

    const locations = await locationRepository.getMany();

    return {
      message: "Locations retrieved successfully",
      locations,
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
        validatedData.itemId,
        selectData,
        tx,
      );
      if (!existing) throw notFound("Location not found");

      const location = await locationRepository.update(
        validatedData.itemId,
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

    if (!canManageLocation(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const deleted = await prisma.$transaction(async (tx) => {
      const selectData = locationSelectData({
        name: true,
        type: true,
        description: true,
      });

      const existing = await locationRepository.get(locationId, selectData, tx);
      if (!existing) throw notFound("Location not found");

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
