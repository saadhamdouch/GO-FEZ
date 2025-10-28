// client/app/[locale]/pois/[id]/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useGetPOIByIdQuery } from '@/services/api/PoiApi';

// Importer les composants
import POIDetailView from '@/components/pois/POIDetailView';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';

interface PoiDetailPageProps {
	params: {
		locale: string;
		id: string; // L'ID du POI vient de l'URL
	};
}

export default function PoiDetailPage({
	params: { locale, id },
}: PoiDetailPageProps) {
	const t = useTranslations('PoiDetailPage');

	// Récupérer les données du POI spécifique
	const { data, isLoading, isError, error } = useGetPOIByIdQuery(id);

	if (isLoading) {
		return <LoadingState text={t('loading')} />;
	}

	if (isError) {
		console.error('Erreur de chargement du POI:', error);
		return <ErrorState message={t('error')} onRetry={() => {}} />;
	}

	if (!data || !data.poi) {
		return <ErrorState message={t('notFound')} onRetry={() => {}} />;
	}

	return <POIDetailView poi={data.poi} locale={locale} />;
}