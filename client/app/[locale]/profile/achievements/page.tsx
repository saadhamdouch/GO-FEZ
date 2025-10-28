// client/app/[locale]/profile/achievements/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useGetGamificationProfileQuery } from '@/services/api/GamificationApi';

// Importer les composants
import PointsDisplay from '@/components/gamification/PointsDisplay';
import LevelProgress from '@/components/gamification/LevelProgress';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';

interface AchievementsPageProps {
	params: {
		locale: string;
	};
}

export default function AchievementsPage({
	params: { locale },
}: AchievementsPageProps) {
	const t = useTranslations('GamificationProfile');

	// Récupérer les données du profil de gamification
	const { data, isLoading, isError, error }_ =
		useGetGamificationProfileQuery();

	if (isLoading) {
		return <LoadingState text={t('loading')} />;
	}

	if (isError || !data?.data) {
		console.error('Erreur chargement profil gamification:', error);
		return <ErrorState message={t('error')} onRetry={() => {}} />;
	}

	const { points, badges }_ = data.data;

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					{t('title')}
				</h1>
				<p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
			</header>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Colonne Points */}
				<div className="lg:col-span-1">
					<PointsDisplay totalPoints={points?.totalPoints || 0} />
				</div>

				{/* Colonne Niveau */}
				<div className="lg:col-span-2">
					<LevelProgress
						level={points?.level || 1}
						totalPoints={points?.totalPoints || 0}
					/>
				</div>
			</div>

			{/* Section Badges */}
			<div className="mt-8">
				<BadgeGrid badges={badges || []} locale={locale} />
			</div>
		</div>
	);
}