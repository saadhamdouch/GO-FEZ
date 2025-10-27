import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface CircuitLocalization {
  name: string;
  description: string;
}

export interface Circuit {
  id: string;
  ar: CircuitLocalization | string;
  fr: CircuitLocalization | string;
  en: CircuitLocalization | string;
  image: string;
  imagePublicId: string;
  cityId: string;
  duration: number;
  distance: number;
  isPremium: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  themes?: Array<{ id: string; fr: string | CircuitLocalization }>;
  pois?: Array<{ id: string }>;
  city?: { id: string; name: string };
}

export const circuitApi = createApi({
  reducerPath: "circuitApi",
  baseQuery,
  tagTypes: ["Circuit", "Circuits"],
  endpoints: (builder) => ({
    getAllCircuits: builder.query<{ success: boolean; data: Circuit[] }, void>({
      query: () => ({
        url: "/api/circuits/",
        method: "GET",
      }),
      providesTags: ["Circuits"],
    }),
    
    getCircuitById: builder.query<{ success: boolean; data: Circuit }, string>({
      query: (id) => ({
        url: `/api/circuits/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Circuit", id }],
    }),
    
    createCircuit: builder.mutation<{ success: boolean; data: Circuit }, FormData>({
      query: (formData) => ({
        url: "/api/circuits/create-with-image",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Circuits"],
    }),
    
    updateCircuit: builder.mutation<
      { success: boolean; data: Circuit },
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/api/circuits/${id}/update-with-image`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Circuit", id },
        "Circuits",
      ],
    }),
    
    deleteCircuit: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/circuits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Circuits"],
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