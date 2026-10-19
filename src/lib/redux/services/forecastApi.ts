import { baseApi } from "./baseApi";
import {
  ApiResponse,
  RestockRecommendationsResult,
  ProductForecastDetail,
} from "@/types/api";

export interface GetRestockParams {
  planningHorizonDays?: number;
  analysisPeriodDays?: number;
  priority?: "HIGH" | "MEDIUM" | "LOW" | "ALL";
  search?: string;
  forceRefresh?: boolean;
}

export interface GetProductForecastParams {
  productId: string;
  planningHorizonDays?: number;
  analysisPeriodDays?: number;
}

export const forecastApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestockRecommendations: builder.query<
      ApiResponse<RestockRecommendationsResult>,
      GetRestockParams | void
    >({
      query: (params) => ({
        url: "/ai-restock/recommendations",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Forecast"],
    }),
    getProductForecast: builder.query<
      ApiResponse<ProductForecastDetail>,
      GetProductForecastParams | string
    >({
      query: (arg) => {
        const productId = typeof arg === "string" ? arg : arg.productId;
        const params =
          typeof arg === "string"
            ? undefined
            : {
                planningHorizonDays: arg.planningHorizonDays,
                analysisPeriodDays: arg.analysisPeriodDays,
              };

        return {
          url: `/ai-restock/products/${productId}`,
          method: "GET",
          params,
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "Forecast",
          id: typeof arg === "string" ? arg : arg.productId,
        },
      ],
    }),
    refreshRestockRecommendations: builder.mutation<
      ApiResponse<RestockRecommendationsResult>,
      void
    >({
      query: () => ({
        url: "/ai-restock/refresh",
        method: "POST",
      }),
      invalidatesTags: ["Forecast"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRestockRecommendationsQuery,
  useLazyGetRestockRecommendationsQuery,
  useGetProductForecastQuery,
  useLazyGetProductForecastQuery,
  useRefreshRestockRecommendationsMutation,
} = forecastApi;
