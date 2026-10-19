import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { token: string | null } };
    let token = state.auth?.token;

    if (!token && typeof window !== "undefined") {
      try {
        token = localStorage.getItem("stockpilot_token");
      } catch {
        token = null;
      }
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const isAuthRoute =
      typeof args === "string"
        ? args.includes("/auth/login") ||
          args.includes("/auth/set-password") ||
          args.includes("/auth/register")
        : args.url.includes("/auth/login") ||
          args.url.includes("/auth/set-password") ||
          args.url.includes("/auth/register");

    if (!isAuthRoute) {
      api.dispatch(logout());
      api.dispatch(baseApi.util.resetApiState());
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/set-password")
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Category",
    "Supplier",
    "Product",
    "Sale",
    "SaleItem",
    "PurchaseOrder",
    "StockMovement",
    "Dashboard",
    "Forecast",
    "Report",
    "User",
  ],
  endpoints: () => ({}),
});
