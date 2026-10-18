import { baseApi } from "./baseApi";
import { ApiResponse, Category } from "@/types/api";

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, CategoryQueryParams | void>({
      query: (params) => ({
        url: "/categories",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryPayload>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: string; body: UpdateCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),
    updateCategoryStatus: builder.mutation<
      ApiResponse<Category>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/categories/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
} = categoryApi;
