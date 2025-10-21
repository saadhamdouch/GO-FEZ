import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface CircuitLocalization {
  name: string;
  description: string;
}

export interface Circuit {
  id: string;
  ar: CircuitLocalization;
  fr: CircuitLocalization;
  en: CircuitLocalization;
  image: string;
  imagePublicId: string;
  cityId: string;
  duration: number;
  distance: number;
  startPoint: string | null;
  endPoint: string | null;
  isActive: boolean;
  isPremium: boolean;
  price: number | null;
  rating: number;
  reviewCount: number;
  isDeleted: boolean;
  city?: any;
  themes?: any[];
  pois?: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateCircuitData {
  data: string; // JSON contenant: cityId, duration, distance, isPremium, themeIds, poiIds, localizations
  image?: File;
}

export const circuitApi = createApi({
  reducerPath: "circuitApi",
  baseQuery: baseQuery,
  tagTypes: ['Circuit', 'Circuits'],
  endpoints: (builder) => ({
    // Récupérer tous les circuits
    getAllCircuits: builder.query<{ status: string; data: Circuit[] }, void>({
      query: () => ({
        url: "/api/circuits/",
        method: "GET",
      }),
      providesTags: ['Circuits'],
    }),

    // Récupérer un circuit par ID
    getCircuitById: builder.query<{ status: string; data: Circuit }, string>({
      query: (id) => ({
        url: `/api/circuits/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Circuit', id }],
    }),

    // Créer un circuit avec image
    createCircuit: builder.mutation<{ success: boolean; data: Circuit }, FormData>({
      query: (formData) => ({
        url: "/api/circuits/create-with-image",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Circuits'],
    }),

    // Mettre à jour un circuit
    updateCircuit: builder.mutation<{ status: string; data: Circuit }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/circuits/${id}/update-with-image`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Circuit', id },
        'Circuits'
      ],
    }),

    // Supprimer un circuit
    deleteCircuit: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/circuits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Circuits'],
    }),
  }),
});

export const {
  useGetAllCircuitsQuery,
  useGetCircuitByIdQuery,
  useCreateCircuitMutation,
  useUpdateCircuitMutation,
  useDeleteCircuitMutation,
} = circuitApi;

export default circuitApi;