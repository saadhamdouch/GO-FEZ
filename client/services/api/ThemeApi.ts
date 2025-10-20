import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface ThemeLocalization {
  name: string;
  desc: string;
}

export interface Theme {
  id: string;
  ar: ThemeLocalization;
  fr: ThemeLocalization;
  en: ThemeLocalization;
  icon: string;
  image: string;
  imagePublicId: string;
  iconPublicId: string;
  color: string;
  isActive: boolean;
  isDeleted: boolean;
  circuitsCount?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateThemeData {
  data: string; // JSON stringifié contenant localizations, color, isActive
  icon: File;
  image: File;
}

export interface UpdateThemeData {
  id: string;
  data?: string;
  icon?: File;
  image?: File;
}

export const themeApi = createApi({
  reducerPath: "themeApi",
  baseQuery: baseQuery,
  tagTypes: ['Theme', 'Themes'],
  endpoints: (builder) => ({
    // Récupérer tous les thèmes
    getAllThemes: builder.query<{ status: string; data: Theme[] }, void>({
      query: () => ({
        url: "/api/themes/",
        method: "GET",
      }),
      providesTags: ['Themes'],
    }),

    // Récupérer un thème par ID
    getThemeById: builder.query<{ status: string; data: Theme }, string>({
      query: (id) => ({
        url: `/api/themes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Theme', id }],
    }),

    // Créer un thème avec fichiers
    createTheme: builder.mutation<{ status: string; data: Theme }, FormData>({
      query: (formData) => ({
        url: "/api/themes/create-with-files",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Themes'],
    }),

    // Mettre à jour un thème
    updateTheme: builder.mutation<{ status: string; data: Theme }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/themes/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Theme', id },
        'Themes'
      ],
    }),

    // Supprimer un thème (logique)
    deleteTheme: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/themes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Themes'],
    }),
  }),
});

export const {
  useGetAllThemesQuery,
  useGetThemeByIdQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useDeleteThemeMutation,
} = themeApi;

export default themeApi;