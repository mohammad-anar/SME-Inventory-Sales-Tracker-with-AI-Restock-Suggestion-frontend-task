import { baseApi } from "./baseApi";
import {
  ApiResponse,
  StaffUser,
  CreateStaffPayload,
  CreateStaffResponse,
  GenerateSetupTokenResponse,
  UpdateStaffStatusPayload,
  Sale,
  StaffActivity,
} from "@/types/api";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<StaffUser[]>, GetUsersParams | void>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<ApiResponse<StaffUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createStaff: builder.mutation<ApiResponse<CreateStaffResponse>, CreateStaffPayload>({
      query: (body) => ({
        url: "/users/staff",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    generateSetupToken: builder.mutation<ApiResponse<GenerateSetupTokenResponse>, string>({
      query: (id) => ({
        url: `/users/${id}/setup-token`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    updateUserStatus: builder.mutation<
      ApiResponse<StaffUser>,
      { id: string; payload: UpdateStaffStatusPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<
      ApiResponse<StaffUser>,
      { id: string; body: Partial<CreateStaffPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getAdminStaffSales: builder.query<
      ApiResponse<Sale[]>,
      { id: string; params?: Record<string, unknown> }
    >({
      query: ({ id, params }) => ({
        url: `/users/${id}/sales`,
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Sale"],
    }),
    getAdminStaffActivities: builder.query<
      ApiResponse<StaffActivity[]>,
      { id: string; params?: Record<string, unknown> }
    >({
      query: ({ id, params }) => ({
        url: `/users/${id}/activities`,
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Sale", "StockMovement"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateStaffMutation,
  useGenerateSetupTokenMutation,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
  useGetAdminStaffSalesQuery,
  useGetAdminStaffActivitiesQuery,
} = usersApi;
