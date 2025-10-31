// client/app/[locale]/circuits/[id]/page.tsx
'use client';

import React, { use } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGetCircuitByIdQuery } from '@/services/api/CircuitApi';
import { useStartCircuitMutation } from '@/services/api/CircuitProgressApi';
import { useRouter } from '@/i18n/navigation'; // FIX: Utiliser la navigation i18n

// Importer les composants
import POITimeline from '@/components/circuits/POITimeline';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { Button } from '@/components/ui/button';
import { Map, Clock, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CircuitDetailPageProps {
	params: Promise<{
		locale: string;
		id: string; // L'ID du circuit
	}>;
}

export default function CircuitDetailPage({
	params,
}: CircuitDetailPageProps) {
	const { locale, id } = use(params);
	const t = useTranslations('CircuitDetailPage');
	const router = useRouter();

	// Récupérer les données du circuit
	const { data, isLoading, isError, error } = useGetCircuitByIdQuery(id);
	// Mutation pour démarrer le circuit
	const [startCircuit, { isLoading: isStarting }] = useStartCircuitMutation();

	const circuit = data?.data;

	// Gérer le clic sur "Démarrer"
	const handleStartCircuit = async () => {
		if (!circuit) return;

		try {
			// L'appel est correct et correspond à votre CircuitProgressApi
			await startCircuit({ circuitId: circuit.id }).unwrap();
			toast.success(t('startSuccess'));
			// Rediriger vers la page de navigation
			router.push(`/circuits/${circuit.id}/navigation`);
		} catch (err) {
			toast.error(t('startError'));
			console.error('Erreur lors du démarrage du circuit:', err);
		}
	};

	if (isLoading) {
		return <LoadingState message={t('loading')} />;
	}

	if (isError || !circuit) {
		console.error('Erreur de chargement du circuit:', error);
		return <ErrorState error={error} onRetry={() => {}} />;
	}

	// Logique de localisation
	const localeData = circuit[locale as 'fr' | 'en' | 'ar'];
	const frData = circuit.fr;
	
	const name = (typeof localeData === 'object' && localeData?.name)
		? localeData.name 
		: (typeof frData === 'object' && frData?.name)
			? frData.name
			: 'Circuit';
			
	const description = (typeof localeData === 'object' && localeData?.description)
		? localeData.description 
		: (typeof frData === 'object' && frData?.description)
			? frData.description
			: '';
	const imageUrl = circuit.image || '/images/hero.jpg';

	return (
		<div className="pb-16">
			{/* En-tête avec Image */}
			<header className="relative h-[40vh] w-full">
				<Image
					loader={cloudinaryLoader}
					src={imageUrl}
					layout="fill"
					objectFit="cover"
					priority
					alt={name || t('circuitImageAlt')} // FIX: Ajout d'un fallback pour 'alt'
				/>
				<div className="absolute inset-0 bg-black/50" />
				<div className="container absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-4 py-8 text-white">
					<h1 className="text-4xl font-bold">{name}</h1>
					<div className="mt-4 flex flex-wrap items-center gap-4">
						{circuit.themes?.map((theme) => {
							const themeLocale = theme[locale as 'fr' | 'en' | 'ar'];
							const themeName = typeof themeLocale === 'string' 
								? themeLocale 
								: typeof theme.fr === 'string' 
									? theme.fr 
									: '';
							return (
								<Badge key={theme.id} variant="secondary">
									{themeName}
								</Badge>
							);
						})}
					</div>
				</div>
			</header>

			{/* Contenu principal */}
			<div className="container mx-auto mt-8 max-w-7xl px-4">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
					{/* Colonne de Gauche (Infos + Timeline) */}
					<div className="lg:col-span-8">
						<h2 className="text-2xl font-semibold">{t('aboutTitle')}</h2>
						<p className="prose prose-lg mt-4 max-w-none text-gray-700">
							{description}
						</p>

						<h2 className="mt-10 text-2xl font-semibold">
							{t('stopsTitle')}
						</h2>
						<div className="mt-6">
							<POITimeline pois={circuit.pois || []} locale={locale} />
						</div>
					</div>

					{/* Colonne de Droite (Box Infos + Bouton Démarrer) */}
					<aside className="lg:col-span-4">
						<div className="sticky top-24 rounded-lg border bg-white p-6 shadow-sm">
							<h3 className="text-xl font-semibold">{t('infoTitle')}</h3>
							<ul className="mt-4 space-y-3">
								<li className="flex items-center gap-3">
									<Map className="h-5 w-5 text-blue-600" />
									<span className="font-medium">
										{circuit.distance} {t('km')}
									</span>
								</li>
								<li className="flex items-center gap-3">
									<Clock className="h-5 w-5 text-blue-600" />
									<span className="font-medium">
										{circuit.duration} {t('min')}
									</span>
								</li>
								<li className="flex items-center gap-3">
									<Zap className="h-5 w-5 text-blue-600" />
									<span className="font-medium">
										{circuit.pois?.length || 0} {t('stops')}
									</span>
								</li>
								{circuit.isPremium && (
									<li className="flex items-center gap-3">
										<Star className="h-5 w-5 text-yellow-500" />
										<span className="font-medium">{t('premium')}</span>
									</li>
								)}
							</ul>
							<Button
								size="lg"
								className="mt-6 w-full"
								onClick={handleStartCircuit}
								disabled={isStarting}
							>
								{isStarting ? t('starting') : t('startButton')}
							</Button>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}