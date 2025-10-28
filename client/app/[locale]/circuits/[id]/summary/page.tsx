// client/app/[locale]/circuits/[id]/summary/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Importer les services API
import { useGetCircuitByIdQuery } from '@/services/api/CircuitApi';
import { useGetCircuitProgressQuery } from '@/services/api/CircuitProgressApi';
import { useGetGamificationProfileQuery } from '@/services/api/GamificationApi';

// Importer les composants
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, Clock } from 'lucide-react';

export default function CircuitSummaryPage() {
	const t = useTranslations('CircuitSummary');
	const params = useParams();
	const locale = params.locale as string;
	const circuitId = params.id as string;

	// Récupérer les données du circuit (pour le nom)
	const { data: circuitData } = useGetCircuitByIdQuery(circuitId);

	// Récupérer les données de progression (pour le temps, etc.)
	const { data: progressData, isLoading: isLoadingProgress } =
		useGetCircuitProgressQuery(circuitId, { skip: !circuitId });

	// Récupérer les données de gamification (pour les points)
	const { data: profileData, isLoading: isLoadingProfile } =
		useGetGamificationProfileQuery();

	if (isLoadingProgress || isLoadingProfile) {
		return <LoadingState text={t('loading')} />;
	}

	if (!progressData || !circuitData) {
		return <ErrorState message={t('error')} onRetry={() => {}} />;
	}

	const circuitName =
		circuitData.data[locale as 'fr' | 'en' | 'ar']?.name ||
		circuitData.data.fr.name;
	const progress = progressData;
	const points = profileData?.data?.points?.totalPoints || 0;

	return (
		<div className="container mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
			<CheckCircle className="h-20 w-20 text-green-500" />
			<h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
				{t('title')}
			</h1>
			<p className="mt-2 text-lg text-gray-600">
				{t('subtitle')} "{circuitName}"
			</p>

			{/* Section des statistiques */}
			<div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div className="rounded-lg border bg-white p-6">
					<Clock className="mx-auto h-10 w-10 text-blue-600" />
					<h3 className="mt-3 text-lg font-semibold">{t('totalTime')}</h3>
					<p className="text-3xl font-bold text-gray-900">
						{progress.totalTime || 0}
						<span className="text-xl"> {t('minutes')}</span>
					</p>
				</div>
				<div className="rounded-lg border bg-white p-6">
					<Award className="mx-auto h-10 w-10 text-yellow-500" />
					<h3 className="mt-3 text-lg font-semibold">{t('pointsEarned')}</h3>
					<p className="text-3xl font-bold text-gray-900">{points}</p>
				</div>
			</div>

			{/* Actions */}
			<div className="mt-12 flex flex-col gap-4 sm:flex-row">
				<Link href={`/${locale}/profile/achievements`} legacyBehavior>
					<Button size="lg" variant="outline">
						{t('viewProfile')}
					</Button>
				</Link>
				<Link href={`/${locale}/circuits`} legacyBehavior>
					<Button size="lg">{t('backToCircuits')}</Button>
				</Link>
			</div>
		</div>
	);
}