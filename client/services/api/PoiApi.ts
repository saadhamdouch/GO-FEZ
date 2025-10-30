import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface POILocalization {
  id?: string;
  name: string;
  description: string;
  address: string;
  audioFiles?: string | null;
}

export interface POIFile {
  id?: string;
  image?: string;
  video?: string;
  virtualTour360?: string;
}

export interface POI {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
    address?: string;
    files?: POIFile[];
  };
  category: string;
  practicalInfo: any;
  cityId: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating?: number;
  reviewCount?: number;
  poiFileId?: string | null;
  isDeleted?: boolean;
  arLocalization?: POILocalization;
  frLocalization?: POILocalization;
  enLocalization?: POILocalization;
  poiFile?: POIFile;
  categoryPOI?: any;
  created_at?: string;
  updated_at?: string;
}


export const poiApi = createApi({
  reducerPath: "poiApi",
  baseQuery,
  tagTypes: ["POI", "POIs"],
  endpoints: (builder) => ({
    getAllPOIs: builder.query<{ success: boolean; pois: POI[] }, void>({
      query: () => ({
        url: "/api/pois/",
        method: "GET"
      }),
      providesTags: ["POIs"],
    }),

    getPOIById: builder.query<{ success: boolean; poi: POI }, string>({
      query: (id) => ({
        url: `/api/pois/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "POI", id }],
    }),

    createPOIWithFiles: builder.mutation<{ success: boolean; data: POI }, FormData>({
      query: (formData) => ({
        url: "/api/pois/create-with-files",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["POIs"],
    }),

    updatePOI: builder.mutation<{ success: boolean; data: POI }, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/api/pois/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "POI", id }, "POIs"],
    }),

    deletePOI: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/pois/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["POIs"],
    }),
  }),
});

export const {
  useGetAllPOIsQuery,
  useGetPOIByIdQuery,
  useCreatePOIWithFilesMutation,
  useUpdatePOIMutation,
  useDeletePOIMutation,
} = poiApi;

export default poiApi;