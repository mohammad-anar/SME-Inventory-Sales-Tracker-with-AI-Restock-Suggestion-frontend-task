import { baseApi } from "./baseApi";
import { ApiResponse, StockMovement, StockMovementType } from "@/types/api";

export interface StockMovementQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  type?: StockMovementType | string;
  startDate?: string;
  endDate?: string;
}

export interface ManualStockAdjustmentPayload {
  productId: string;
  quantityChange: number;
  note?: string;
}

export const stockMovementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovements: builder.query<
      ApiResponse<StockMovement[]>,
      StockMovementQueryParams | void
    >({
      query: (params) => ({
        url: "/stock-movements",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "StockMovement", id: "LIST" }],
    }),
    getStockMovementById: builder.query<ApiResponse<StockMovement>, string>({
      query: (id) => ({
        url: `/stock-movements/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "StockMovement", id }],
    }),
    adjustStock: builder.mutation<ApiResponse<StockMovement>, ManualStockAdjustmentPayload>({
      query: (body) => ({
        url: "/stock-movements/adjustments",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "StockMovement", id: "LIST" },
        { type: "Product", id: "LIST" },
        { type: "Product", id: "LOW_STOCK" },
        { type: "Dashboard", id: "METRICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockMovementsQuery,
  useGetStockMovementByIdQuery,
  useAdjustStockMutation,
} = stockMovementApi;
