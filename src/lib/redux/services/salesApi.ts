import { baseApi } from "./baseApi";
import { ApiResponse, PaymentMethod, Sale, SaleStatus } from "@/types/api";

export interface SalesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  staffId?: string;
  status?: SaleStatus | string;
  paymentMethod?: PaymentMethod | string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateSaleItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateSalePayload {
  customerName?: string;
  paymentMethod?: PaymentMethod;
  discount?: number;
  items: CreateSaleItemPayload[];
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<ApiResponse<Sale[]>, SalesQueryParams | void>({
      query: (params) => ({
        url: "/sales",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Sale" as const, id })),
              { type: "Sale", id: "LIST" },
            ]
          : [{ type: "Sale", id: "LIST" }],
    }),
    getSaleById: builder.query<ApiResponse<Sale>, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Sale", id }],
    }),
    getSaleByInvoice: builder.query<ApiResponse<Sale>, string>({
      query: (invoiceNo) => ({
        url: `/sales/invoice/${invoiceNo}`,
        method: "GET",
      }),
      providesTags: (_result, _error, invoiceNo) => [
        { type: "Sale", id: invoiceNo },
      ],
    }),
    createSale: builder.mutation<ApiResponse<Sale>, CreateSalePayload>({
      query: (body) => ({
        url: "/sales",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Sale", id: "LIST" },
        { type: "Product", id: "LIST" },
        { type: "Product", id: "LOW_STOCK" },
        { type: "StockMovement", id: "LIST" },
        { type: "Dashboard", id: "METRICS" },
      ],
    }),
    voidSale: builder.mutation<ApiResponse<Sale>, string>({
      query: (id) => ({
        url: `/sales/${id}/void`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Sale", id },
        { type: "Sale", id: "LIST" },
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
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useGetSaleByInvoiceQuery,
  useCreateSaleMutation,
  useVoidSaleMutation,
} = salesApi;
