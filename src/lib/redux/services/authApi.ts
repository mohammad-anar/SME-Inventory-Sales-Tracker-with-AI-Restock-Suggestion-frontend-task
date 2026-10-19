import { baseApi } from "./baseApi";
import {
  ApiResponse,
  UserProfile,
  RegisterPayload,
  SetPasswordPayload,
  VerifySetupTokenResponse,
} from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: UserProfile;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<LoginResponseData>, RegisterPayload>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifySetupToken: builder.query<ApiResponse<VerifySetupTokenResponse>, string>({
      query: (token) => ({
        url: `/auth/verify-setup-token?token=${encodeURIComponent(token)}`,
        method: "GET",
      }),
    }),
    setPassword: builder.mutation<ApiResponse<LoginResponseData>, SetPasswordPayload>({
      query: (body) => ({
        url: "/auth/set-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<ApiResponse<UserProfile>, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifySetupTokenQuery,
  useSetPasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
} = authApi;
