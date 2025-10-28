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

    // OTP - envoyer un code (email ou téléphone)
    sendOTP: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/otp/send",
        method: "POST",
        body: payload, // { email? phone? country?, purpose }
      }),
    }),

    // OTP - vérifier le code
    verifyOTP: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/otp/verify",
        method: "POST",
        body: payload, // { email? phone? country?, otpCode, purpose }
      }),
    }),

    // Mettre à jour la vérification de l'utilisateur
    updateVerificationStatus: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/verify",
        method: "POST",
        body: payload, // { email? phone? country?, isVerified }
      }),
      invalidatesTags: ['User'],
    }),

    // Mot de passe oublié - démarrer (envoi OTP)
    forgotPasswordStart: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot/start",
        method: "POST",
        body: payload, // { email }
      }),
    }),

    // Mot de passe oublié - vérifier OTP
    forgotPasswordVerify: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot/verify",
        method: "POST",
        body: payload, // { email, otpCode }
      }),
    }),

    // Mot de passe oublié - réinitialiser
    resetPassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot/reset",
        method: "POST",
        body: payload, // { email, newPassword }
      }),
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  // Authentification
  useRegisterUserMutation,
  useLoginUserMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useUpdateVerificationStatusMutation,
  useForgotPasswordStartMutation,
  useForgotPasswordVerifyMutation,
  useResetPasswordMutation,
} = userApi;

// Export de l'API pour l'utiliser dans le store
export default userApi;