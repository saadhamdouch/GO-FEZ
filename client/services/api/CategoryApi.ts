import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface Category {
  id: string;
  ar: string;
  fr: string;
  en: string;
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
    // Récupérer toutes les catégories
    getAllCategories: builder.query<{ status: string; data: Category[] }, void>({
      query: () => ({
        url: "/api/categorys/",
        method: "GET",
      }),
      providesTags: ['Categories'],
    }),

    // Récupérer une catégorie par ID
    getCategoryById: builder.query<{ status: string; data: Category }, string>({
      query: (id) => ({
        url: `/api/categorys/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Créer une catégorie
    createCategory: builder.mutation<{ status: string; data: Category }, CreateCategoryData>({
      query: (data) => ({
        url: "/api/categorys/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    // Mettre à jour une catégorie
    updateCategory: builder.mutation<{ status: string; data: Category }, { id: string; data: UpdateCategoryData }>({
      query: ({ id, data }) => ({
        url: `/api/categorys/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        'Categories'
      ],
    }),

    // Supprimer une catégorie (logique)
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