import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
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
  }),
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
