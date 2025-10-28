// client/app/[locale]/circuits/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useGetPublicCircuitsQuery } from '@/services/api/CircuitApi';
import CircuitCard from '@/components/circuits/CircuitCard';

// Importer les composants de chargement/erreur
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { EmptyState } from '@/components/admin/shared/EmptyState';

interface CircuitsPageProps {
	params: {
		locale: string;
	};
}

export default function CircuitsPage({ params: { locale } }: CircuitsPageProps) {
	const t = useTranslations('CircuitsPage');

	// Appel RTK Query pour récupérer les circuits publics
	const { data, isLoading, isError, error } = useGetPublicCircuitsQuery();

	const renderContent = () => {
		if (isLoading) {
			return <LoadingState text={t('loading')} />;
		}

		if (isError) {
			console.error('Erreur de chargement des circuits:', error);
			return <ErrorState message={t('error')} onRetry={() => {}} />;
		}

		if (!data || data.data.length === 0) {
			return <EmptyState message={t('noResults')} />;
		}

		return (
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{data.data.map((circuit) => (
					<CircuitCard key={circuit.id} circuit={circuit} locale={locale} />
				))}
			</div>
		);
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					{t('title')}
				</h1>
				<p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
			</header>

			{/* TODO: Filtres pour les circuits (par Thème, durée, etc.) */}

			<section>{renderContent()}</section>
		</div>
	);
}