import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    // Inscription d'un nouvel utilisateur
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
providerRegister: builder.mutation({
  query: (providerData) => ({
    url: "/api/auth/provider-register",
    method: "POST",
    body: providerData,
  }),
  invalidatesTags: ['Users'],
}),

    // Connexion d'un utilisateur par téléphone
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Récupérer le profil de l'utilisateur connecté
    getUserProfile: builder.query({
      query: () => ({
        url: "/api/users/profile",
        method: "GET",
      }),
      providesTags: ['User'],
      transformResponse: (response) => {
        // Handle both response formats: { user: ... } or { data: ... }
        return response.data || response.user || response;
      },
    }),

    // Mettre à jour le profil de l'utilisateur
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  // Authentification
  useRegisterUserMutation,
  useLoginUserMutation,
  useProviderRegisterMutation,
  // Profil utilisateur
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = userApi;

// Export de l'API pour l'utiliser dans le store
export default userApi;