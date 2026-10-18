import { baseApi } from "./baseApi";
import {
  ApiResponse,
  UserProfile,
  UpdateProfilePayload,
  Sale,
  StaffSalesSummary,
  StaffActivity,
} from "@/types/api";

export interface GetStaffSalesParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetStaffSummaryParams {
  startDate?: string;
  endDate?: string;
}

export interface GetStaffActivitiesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => ({
        url: "/staff/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    updateStaffProfile: builder.mutation<
      ApiResponse<UserProfile>,
      UpdateProfilePayload
    >({
      query: (body) => ({
        url: "/staff/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getStaffSales: builder.query<ApiResponse<Sale[]>, GetStaffSalesParams | void>({
      query: (params) => ({
        url: "/staff/me/sales",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Sale"],
    }),
    getStaffSalesSummary: builder.query<
      ApiResponse<StaffSalesSummary>,
      GetStaffSummaryParams | void
    >({
      query: (params) => ({
        url: "/staff/me/sales/summary",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Sale"],
    }),
    getStaffActivities: builder.query<
      ApiResponse<StaffActivity[]>,
      GetStaffActivitiesParams | void
    >({
      query: (params) => ({
        url: "/staff/me/activities",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Sale", "StockMovement"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStaffProfileQuery,
  useLazyGetStaffProfileQuery,
  useUpdateStaffProfileMutation,
  useGetStaffSalesQuery,
  useLazyGetStaffSalesQuery,
  useGetStaffSalesSummaryQuery,
  useGetStaffActivitiesQuery,
} = staffApi;
