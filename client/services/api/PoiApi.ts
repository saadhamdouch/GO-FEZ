import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface POILocalization {
  id: string;
  name: string;
  description: string;
  address: string;
  audioFiles: string | null;
}

export interface POIFile {
  id: string;
  image: string;
  video: string;
  virtualTour360: string;
}

export interface POI {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  category: string;
  practicalInfo: any;
  cityId: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  poiFileId: string | null;
  isDeleted: boolean;
  arLocalization?: POILocalization;
  frLocalization?: POILocalization;
  enLocalization?: POILocalization;
  poiFile?: POIFile;
  created_at: string;
  updated_at: string;
}

export const poiApi = createApi({
  reducerPath: "poiApi",
  baseQuery: baseQuery,
  tagTypes: ['POI', 'POIs'],
  endpoints: (builder) => ({
    // Récupérer tous les POIs
    getAllPOIs: builder.query<{ success: boolean; pois: POI[] }, void>({
      query: () => ({
        url: "/api/pois/",
        method: "GET",
      }),
      providesTags: ['POIs'],
    }),

    // Récupérer un POI par ID
    getPOIById: builder.query<{ success: boolean; poi: POI }, string>({
      query: (id) => ({
        url: `/api/pois/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'POI', id }],
    }),

    // Créer un POI avec fichiers
    createPOIWithFiles: builder.mutation<{ success: boolean; data: any }, FormData>({
      query: (formData) => ({
        url: "/api/pois/create-with-files",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['POIs'],
    }),

    // Créer un POI sans fichiers
    createPOI: builder.mutation<{ success: boolean; data: any }, any>({
      query: (data) => ({
        url: "/api/pois/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['POIs'],
    }),

    // Mettre à jour un POI
    updatePOI: builder.mutation<{ success: boolean; message: string }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/api/pois/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'POI', id },
        'POIs'
      ],
    }),

    // Supprimer un POI
    deletePOI: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/pois/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['POIs'],
    }),

    // Upload d'image
    uploadImage: builder.mutation<{ success: boolean; imageUrl: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: "/api/pois/upload/image",
        method: "POST",
        body: formData,
      }),
    }),

    // Upload d'audio
    uploadAudio: builder.mutation<{ success: boolean; audioUrl: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: "/api/pois/upload/audio",
        method: "POST",
        body: formData,
      }),
    }),

    // Upload de vidéo
    uploadVideo: builder.mutation<{ success: boolean; videoUrl: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: "/api/pois/upload/video",
        method: "POST",
        body: formData,
      }),
    }),

    // Upload de visite virtuelle
    uploadVirtualTour: builder.mutation<{ success: boolean; virtualTourUrl: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: "/api/pois/upload/virtual-tour",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetAllPOIsQuery,
  useGetPOIByIdQuery,
  useCreatePOIWithFilesMutation,
  useCreatePOIMutation,
  useUpdatePOIMutation,
  useDeletePOIMutation,
  useUploadImageMutation,
  useUploadAudioMutation,
  useUploadVideoMutation,
  useUploadVirtualTourMutation,
} = poiApi;

export default poiApi;