import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface ThemeLocalization {
  name: string;
  desc: string;
}

export interface Theme {
  id: string;
  ar: ThemeLocalization | string;
  fr: ThemeLocalization | string;
  en: ThemeLocalization | string;
  icon: string;
  image: string;
  imagePublicId: string;
  iconPublicId: string;
  color: string;
  isActive: boolean;
  isDeleted: boolean;
  circuitsCount?: number;
  circuitsFromThemes?: any[];
  created_at: string;
  updated_at: string;
}

export const themeApi = createApi({
  reducerPath: "themeApi",
  baseQuery: baseQuery,
  tagTypes: ['Theme', 'Themes'],
  endpoints: (builder) => ({
    getAllThemes: builder.query<{ status: string; data: Theme[] }, void>({
      query: () => ({
        url: "/api/themes/",
        method: "GET",
      }),
      providesTags: ['Themes'],
    }),

    getThemeById: builder.query<{ status: string; data: Theme }, string>({
      query: (id) => ({
        url: `/api/themes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Theme', id }],
    }),

    createTheme: builder.mutation<{ status: string; data: Theme }, FormData>({
      query: (formData) => ({
        url: "/api/themes/create-with-files",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Themes'],
    }),

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