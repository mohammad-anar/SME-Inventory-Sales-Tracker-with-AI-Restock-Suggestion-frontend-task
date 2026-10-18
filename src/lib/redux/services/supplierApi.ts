import { baseApi } from "./baseApi";
import { ApiResponse, Supplier } from "@/types/api";

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateSupplierPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<ApiResponse<Supplier[]>, SupplierQueryParams | void>({
      query: (params) => ({
        url: "/suppliers",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Supplier" as const, id })),
              { type: "Supplier", id: "LIST" },
            ]
          : [{ type: "Supplier", id: "LIST" }],
    }),
    getSupplierById: builder.query<ApiResponse<Supplier>, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Supplier", id }],
    }),
    createSupplier: builder.mutation<ApiResponse<Supplier>, CreateSupplierPayload>({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),
    updateSupplier: builder.mutation<
      ApiResponse<Supplier>,
      { id: string; body: UpdateSupplierPayload }
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
        { type: "Product", id: "LIST" },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),
    updateSupplierStatus: builder.mutation<
      ApiResponse<Supplier>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/suppliers/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useUpdateSupplierStatusMutation,
} = supplierApi;
