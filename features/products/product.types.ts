import productService from "./product.service";

export type ProductGetManyResponse = Awaited<
  ReturnType<typeof productService.getMany>
>;

export type ProductGetResponse = Awaited<ReturnType<typeof productService.get>>;

export type ProductCreateResponse = Awaited<
  ReturnType<typeof productService.create>
>;

export type ProductUpdateResponse = Awaited<
  ReturnType<typeof productService.update>
>;

export type ProductDeleteResponse = Awaited<
  ReturnType<typeof productService.delete>
>;
