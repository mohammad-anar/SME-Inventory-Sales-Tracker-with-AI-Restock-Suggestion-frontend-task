import { baseApi } from "./baseApi";
import { ApiResponse, UserProfile, UpdateProfilePayload } from "@/types/api";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<
      ApiResponse<UserProfile>,
      UpdateProfilePayload
    >({
      query: (body) => ({
        url: "/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
} = profileApi;
