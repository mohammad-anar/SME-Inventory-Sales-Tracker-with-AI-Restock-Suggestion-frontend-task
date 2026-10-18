import { baseApi } from "./baseApi";
import { ApiResponse, PurchaseOrder, PurchaseOrderStatus } from "@/types/api";

export interface PurchaseOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus | string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePurchaseOrderItemPayload {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  note?: string;
  items: CreatePurchaseOrderItemPayload[];
}

export interface UpdatePurchaseOrderPayload {
  note?: string;
  items?: CreatePurchaseOrderItemPayload[];
}

export const purchaseOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<
      ApiResponse<PurchaseOrder[]>,
      PurchaseOrderQueryParams | void
    >({
      query: (params) => ({
        url: "/purchase-orders",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "PurchaseOrder" as const,
                id,
              })),
              { type: "PurchaseOrder", id: "LIST" },
            ]
          : [{ type: "PurchaseOrder", id: "LIST" }],
    }),
    getPurchaseOrderById: builder.query<ApiResponse<PurchaseOrder>, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "PurchaseOrder", id }],
    }),
    getPurchaseOrderReceipt: builder.query<ApiResponse<PurchaseOrder>, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/receipt`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "PurchaseOrder", id: `RECEIPT-${id}` },
      ],
    }),
    createPurchaseOrder: builder.mutation<
      ApiResponse<PurchaseOrder>,
      CreatePurchaseOrderPayload
    >({
      query: (body) => ({
        url: "/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),
    updatePurchaseOrder: builder.mutation<
      ApiResponse<PurchaseOrder>,
      { id: string; body: UpdatePurchaseOrderPayload }
    >({
      query: ({ id, body }) => ({
        url: `/purchase-orders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PurchaseOrder", id },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),
    updatePurchaseOrderStatus: builder.mutation<
      ApiResponse<PurchaseOrder>,
      { id: string; status: PurchaseOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/purchase-orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PurchaseOrder", id },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),
    receivePurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/receive`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "PurchaseOrder", id },
        { type: "PurchaseOrder", id: "LIST" },
        { type: "Product", id: "LIST" },
        { type: "Product", id: "LOW_STOCK" },
        { type: "StockMovement", id: "LIST" },
        { type: "Dashboard", id: "METRICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useGetPurchaseOrderReceiptQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useReceivePurchaseOrderMutation,
} = purchaseOrderApi;
