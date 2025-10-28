// client/services/api/ShareApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../BaseQuery';
import { Share } from '@/lib/types'; // Assurez-vous que le type Share existe

// Interface pour les arguments de l'enregistrement
export interface RegisterShareArgs {
	resourceType: 'poi' | 'circuit';
	resourceId: string;
	platform: 'facebook' | 'twitter' | 'whatsapp' | 'link';
}

export const shareApi = createApi({
	reducerPath: 'shareApi',
	baseQuery: baseQuery,
	tagTypes: ['Share'],
	endpoints: (builder) => ({
		// Enregistrer une action de partage
		registerShare: builder.mutation<Share, RegisterShareArgs>({
			query: (body) => ({
				url: '/shares/register',
				method: 'POST',
				body: body,
			}),
			// Invalider les tags n'est pas critique ici, mais on peut
			// le lier au profil de gamification si on veut
			invalidatesTags: [],
		}),
	}),
});

export const { useRegisterShareMutation } = shareApi;