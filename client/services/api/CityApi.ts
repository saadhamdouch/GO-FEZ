import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface City {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  image: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radius: number;
  isActive: boolean;
  isDeleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCityData {
  name: string;
  nameAr: string;
  nameEn: string;
  country: string;
  radius: number;
  isActive?: boolean;
}

export interface UpdateCityData {
  name?: string;
  nameAr?: string;
  nameEn?: string;
  country?: string;
  radius?: number;
  isActive?: boolean;
}

export const cityApi = createApi({
  reducerPath: "cityApi",
  baseQuery: baseQuery,
  tagTypes: ['City', 'Cities'],
  endpoints: (builder) => ({
    // Récupérer toutes les villes
    getAllCities: builder.query<{ status: string; data: City[] }, void>({
      query: () => ({
        url: "/api/city/",
        method: "GET",
      }),
      providesTags: ['Cities'],
    }),

    // Créer une ville
    createCity: builder.mutation<{ status: string; data: City }, CreateCityData>({
      query: (data) => ({
        url: "/api/city/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Cities'],
    }),

    // Mettre à jour une ville
    updateCity: builder.mutation<{ status: string; data: City }, { id: string; data: UpdateCityData }>({
      query: ({ id, data }) => ({
        url: `/api/city/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'City', id },
        'Cities'
      ],
    }),

    // Supprimer une ville (logique)
    deleteCity: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/city/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Cities'],
    }),
  }),
});

export const {
  useGetAllCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = cityApi;

export default cityApi;