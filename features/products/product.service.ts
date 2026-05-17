import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  productCreateSchema,
  ProductCreateSchema,
  productGetSchema,
  productUpdateSchema,
  ProductUpdateSchema,
} from "@/shared/lib/zods/product.zod";
import productRepository from "./product.repository";
import prisma from "@/shared/db/prisma";

import { badRequest, forbidden } from "@/shared/lib/error-handlers";
import { canManageProduct } from "@/shared/lib/validations/user-access-validation";
import auditLogsRepository from "../audit-logs/audit-log.repository";

const productService = {
  create: async (rawData: ProductCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = productCreateSchema.parse(rawData);

    if (!canManageProduct(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await productRepository.create(
        session.id,
        validatedData,
        tx,
      );

      await auditLogsRepository.create(
        {
          action: "CREATE",
          entity: "PRODUCT",
          entityId: product.id,
          metadata: {
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            price: product.price,
          },
          userId: session.id,
        },
        tx,
      );

      return product;
    });

    return {
      message: `${result.name} was successfully created`,
      id: result.id,
    };
  },

  get: async (productId: string) => {
    await sessionValidation();

    if (!productId) throw badRequest("Product ID is missing");

    const product = await productRepository.get(productId, undefined, prisma);

    return {
      message: `${product?.name} was successfully retrieved`,
      product: product,
      totalStock: product.totalStock,
    };
  },

  // I set the params into any because it comes from params that takes everything as a string, it won't match into zod type because it has number, boolean, etc
  getMany: async (params: { [key: string]: string }) => {
    await sessionValidation();
    const validatedParams = productGetSchema.parse(params);

    let products;

    if (validatedParams.isByCategory) {
      products = await productRepository.getManyByCategory(
        validatedParams,
        prisma,
      );
    } else {
      products = await productRepository.getMany(
        validatedParams,
        undefined,
        prisma,
      );
    }

    return {
      message: "Product data successfully retrieved",
      products,
    };
  },

  update: async (rawData: ProductUpdateSchema) => {
    const session = await sessionValidation();
    const validatedData = productUpdateSchema.parse(rawData);

    if (!canManageProduct(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get existing product for audit log
      const existingProduct = await tx.product.findUnique({
        where: { id: validatedData.productId },
      });

      await productRepository.update(session.id, validatedData, tx);

      await auditLogsRepository.create(
        {
          action: "UPDATE",
          entity: "PRODUCT",
          entityId: validatedData.productId,
          metadata: {
            id: validatedData.productId,
            oldName: existingProduct?.name,
            newName: validatedData.name,
            oldPrice: existingProduct?.price,
            newPrice: validatedData.price,
          },
          userId: session.id,
        },
        tx,
      );

      return { name: validatedData.name };
    });

    return {
      message: `${result.name} was successfully updated`,
    };
  },

  delete: async (productId: string) => {
    const session = await sessionValidation();

    if (!productId) throw badRequest("Product id is missing");

    if (!canManageProduct(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get existing product for audit log before deletion
      const existingProduct = await tx.product.findUnique({
        where: { id: productId },
      });

      const product = await productRepository.delete(productId, tx);

      await auditLogsRepository.create(
        {
          action: "DELETE",
          entity: "PRODUCT",
          entityId: productId,
          metadata: {
            id: productId,
            name: existingProduct?.name,
            category: existingProduct?.categoryId,
            price: existingProduct?.price,
          },
          userId: session.id,
        },
        tx,
      );

      return product;
    });

    return {
      message: `${result.name} was successfully deleted`,
    };
  },
};

export default productService;
