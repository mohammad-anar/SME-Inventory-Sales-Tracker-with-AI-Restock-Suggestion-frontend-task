import { baseApi } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface RestockSuggestionItem {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  incomingStock: number;
  forecastedDemand7Days: number;
  suggestedRestockQuantity: number;
  estimatedCost: string | number;
  urgency: "CRITICAL" | "RECOMMENDED" | "HEALTHY";
  supplier?: {
    id: string;
    name: string;
  };
  isSufficientData: boolean;
}

export interface ProductForecastDetails {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  incomingStock: number;
  forecast: {
    horizonDays: number;
    totalForecastedDemand: number;
    dailyPredictions: Array<{ date: string; predictedDemand: number }>;
  };
  recommendation: {
    suggestedQuantity: number;
    urgency: "CRITICAL" | "RECOMMENDED" | "HEALTHY";
  };
  evaluation?: {
    mae: number;
    unit: string;
    wapePercentage?: number;
    evaluationPeriod: {
      startDate: string;
      endDate: string;
      durationDays: number;
    };
  };
}

export const forecastApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestockSuggestions: builder.query<
      ApiResponse<RestockSuggestionItem[]>,
      { page?: number; limit?: number; urgency?: string } | void
    >({
      query: (params) => ({
        url: "/restock-suggestions",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "Forecast", id: "SUGGESTIONS" }],
    }),
    getProductForecast: builder.query<
      ApiResponse<ProductForecastDetails>,
      string
    >({
      query: (productId) => ({
        url: `/restock-suggestions/${productId}/forecast`,
        method: "GET",
      }),
      providesTags: (_result, _error, productId) => [
        { type: "Forecast", id: productId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRestockSuggestionsQuery,
  useGetProductForecastQuery,
} = forecastApi;
