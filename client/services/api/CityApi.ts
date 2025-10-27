import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface CityCoordinates {
  address: string;
  addressAr: string;
  addressEn: string;
  longitude: number;
  latitude: number;
}

export interface City {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  image: string;
  imagePublicId: string;
  country: string;
  coordinates: CityCoordinates;
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
  address: string;
  addressAr: string;
  addressEn: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
}

export interface UpdateCityData {
  name?: string;
  nameAr?: string;
  nameEn?: string;
  country?: string;
  radius?: number;
  address?: string;
  addressAr?: string;
  addressEn?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export const cityApi = createApi({
  reducerPath: "cityApi",
  baseQuery: baseQuery,
  tagTypes: ['City', 'Cities'],
  endpoints: (builder) => ({
    getAllCities: builder.query<{ status: string; data: City[] }, void>({
      query: () => ({
        url: "/api/city/",
        method: "GET",
      }),
      providesTags: ['Cities'],
    }),

    getCityById: builder.query<{ status: string; data: City }, string>({
      query: (id) => ({
        url: `/api/city/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'City', id }],
    }),

    createCityWithImage: builder.mutation<{ status: string; data: City }, FormData>({
      query: (formData) => ({
        url: "/api/city/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Cities'],
    }),

    updateCityWithImage: builder.mutation<
      { status: string; data: City },
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/api/city/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'City', id },
        'Cities'
      ],
    }),

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
  useGetCityByIdQuery,
  useCreateCityWithImageMutation,
  useUpdateCityWithImageMutation,
  useDeleteCityMutation,
} = cityApi;

export default cityApi;