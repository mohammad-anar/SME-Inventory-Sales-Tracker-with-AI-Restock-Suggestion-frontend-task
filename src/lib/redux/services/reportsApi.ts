import { baseApi } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface InventoryValuationReportItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQty: number;
  costPrice: string | number;
  unitPrice: string | number;
  totalCostValue: string | number;
  totalRetailValue: string | number;
  potentialMargin: string | number;
}

export interface InventoryValuationSummary {
  totalUnitsOnHand: number;
  inventoryCostValue: string | number;
  inventoryRetailValue: string | number;
  unrealizedMargin: string | number;
  items: InventoryValuationReportItem[];
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryValuation: builder.query<
      ApiResponse<InventoryValuationSummary>,
      { categoryId?: string; supplierId?: string } | void
    >({
      query: (params) => ({
        url: "/reports/inventory-valuation",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Report", id: "INVENTORY_VALUATION" }],
    }),
    getSalesReport: builder.query<
      ApiResponse<unknown>,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/reports/sales",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Report", id: "SALES" }],
    }),
    getPurchaseReport: builder.query<
      ApiResponse<unknown>,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/reports/purchases",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Report", id: "PURCHASES" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInventoryValuationQuery,
  useGetSalesReportQuery,
  useGetPurchaseReportQuery,
} = reportsApi;
