import { baseApi } from "./baseApi";
import { ApiResponse, Product } from "@/types/api";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean | string;
  stockStatus?: "low-stock" | "out-of-stock" | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LowStockQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean | string;
  stockStatus?: "out-of-stock" | string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  categoryId: string;
  supplierId: string;
  avatar?: string;
  unitPrice: number;
  costPrice: number;
  reorderLevel?: number;
}

export interface UpdateProductPayload {
  sku?: string;
  name?: string;
  description?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  avatar?: string;
  unitPrice?: number;
  costPrice?: number;
  reorderLevel?: number;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<Product[]>, ProductQueryParams | void>({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    getLowStockProducts: builder.query<ApiResponse<Product[]>, LowStockQueryParams | void>({
      query: (params) => ({
        url: "/products/low-stock",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Product", id: "LOW_STOCK" }],
    }),
    getProductById: builder.query<ApiResponse<Product>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<ApiResponse<Product>, CreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "Product", id: "LOW_STOCK" },
        { type: "Dashboard", id: "METRICS" },
      ],
    }),
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; body: UpdateProductPayload }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "Product", id: "LOW_STOCK" },
        { type: "Dashboard", id: "METRICS" },
      ],
    }),
    updateProductStatus: builder.mutation<
      ApiResponse<Product>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/products/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "Product", id: "LOW_STOCK" },
        { type: "Dashboard", id: "METRICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetLowStockProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
} = productApi;
