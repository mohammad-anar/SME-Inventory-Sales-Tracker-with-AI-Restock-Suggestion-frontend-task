import { baseApi } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface DashboardSummaryData {
  sales: {
    grossRevenue: string | number;
    totalOrders: number;
    averageOrderValue: string | number;
    totalDiscount: string | number;
    costOfGoodsSold?: string | number;
    grossProfit?: string | number;
    grossProfitMargin?: string | number;
  };
  inventory: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    inventoryCostValue?: string | number;
    inventoryRetailValue?: string | number;
    totalUnitsOnHand: number;
  };
  purchases: {
    incurredCost: string | number;
    committedCost: string | number;
    receivedOrdersCount: number;
    orderedOrdersCount: number;
    draftOrdersCount: number;
  };
}

export interface SalesTrendDataPoint {
  date: string;
  salesCount: number;
  revenue: string | number;
  cogs?: string | number;
  profit?: string | number;
}

export interface TopProductData {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  totalQuantitySold: number;
  totalRevenue: string | number;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<
      ApiResponse<DashboardSummaryData>,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/dashboard/summary",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Dashboard", id: "METRICS" }],
    }),
    getSalesTrend: builder.query<
      ApiResponse<SalesTrendDataPoint[]>,
      { interval?: "day" | "month"; startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/dashboard/sales-trend",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Dashboard", id: "TREND" }],
    }),
    getTopProducts: builder.query<
      ApiResponse<TopProductData[]>,
      { limit?: number; sortBy?: "quantity" | "revenue" } | void
    >({
      query: (params) => ({
        url: "/dashboard/top-products",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Dashboard", id: "TOP_PRODUCTS" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardSummaryQuery,
  useGetSalesTrendQuery,
  useGetTopProductsQuery,
} = dashboardApi;
