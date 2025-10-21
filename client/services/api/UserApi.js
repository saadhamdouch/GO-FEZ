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

    // Connexion d'un utilisateur par téléphone
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  // Authentification
  useRegisterUserMutation,
  useLoginUserMutation,
} = userApi;

// Export de l'API pour l'utiliser dans le store
export default userApi;