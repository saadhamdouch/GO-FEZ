import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface Category {
  id: string;
  ar: string | { name?: string };
  fr: string | { name?: string };
  en: string | { name?: string };
  icon?: string;
  iconPublicId?: string;
  isActive: boolean;
  isDeleted: boolean;
  nbPois?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  ar: string;
  fr: string;
  en: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  ar?: string;
  fr?: string;
  en?: string;
  isActive?: boolean;
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQuery,
  tagTypes: ['Category', 'Categories'],
  endpoints: (builder) => ({
    getAllCategories: builder.query<{ status: string; data: Category[] }, void>({
      query: () => ({
        url: "/api/categorys/",
        method: "GET",
      }),
      providesTags: ['Categories'],
    }),

    getCategoryById: builder.query<{ status: string; data: Category }, string>({
      query: (id) => ({
        url: `/api/categorys/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<{ status: string; data: Category }, FormData>({
      query: (formData) => ({
        url: "/api/categorys/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<{ status: string; data: Category }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/categorys/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        'Categories'
      ],
    }),

    deleteCategory: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/categorys/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

export default categoryApi;