// client/services/api/ReviewApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../BaseQuery';
import { Review } from '@/lib/types'; // Assurez-vous que le type Review existe

// Interface pour la réponse paginée des avis
export interface PaginatedReviewResponse {
	success: boolean;
	data: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		reviews: Review[];
	};
}

// Interface pour les arguments de la pagination
export interface GetReviewsParams {
	poiId: string;
	page?: number;
	limit?: number;
}

// Interface pour la création d'un avis
export interface CreateReviewArgs {
	poiId: string;
	rating: number;
	comment?: string;
	photos?: File[]; // Pour une implémentation future
}

export const reviewApi = createApi({
	reducerPath: 'reviewApi',
	baseQuery: baseQuery,
	tagTypes: ['Review', 'POI'], // Nous taguons aussi POI car la note du POI change
	endpoints: (builder) => ({
		// Récupérer les avis pour un POI
		getReviewsForPOI: builder.query<
			PaginatedReviewResponse,
			GetReviewsParams
		>({
			query: ({ poiId, page = 1, limit = 5 }) => ({
				url: `/reviews/poi/${poiId}`,
				params: { page, limit },
			}),
			providesTags: (result, error, { poiId }) => [
				{ type: 'Review', id: poiId },
			],
		}),

		// Créer un nouvel avis
		createReview: builder.mutation<Review, CreateReviewArgs>({
			query: ({ poiId, rating, comment, photos }) => {
				// Utiliser FormData si des photos sont incluses (non implémenté
				// mais préparé)
				const formData = new FormData();
				formData.append('poiId', poiId);
				formData.append('rating', rating.toString());
				if (comment) {
					formData.append('comment', comment);
				}
				// if (photos) {
				//   photos.forEach(photo => formData.append('photos', photo));
				// }

				return {
					url: '/reviews',
					method: 'POST',
					body: formData, // Le backend (ReviewController) gère FormData
				};
			},
			invalidatesTags: (result, error, { poiId }) => [
				{ type: 'Review', id: poiId },
				{ type: 'POI', id: poiId }, // Invalider le POI pour rafraîchir la note
				{ type: 'POI', id: 'LIST' }, // Invalider la liste des POIs
			],
		}),

		// TODO: Ajouter deleteReview si nécessaire
	}),
});

export const { useGetReviewsForPOIQuery, useCreateReviewMutation } = reviewApi;