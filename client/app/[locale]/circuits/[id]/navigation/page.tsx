// client/app/[locale]/circuits/[id]/navigation/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { POI } from '@/lib/types';
import { useGPSTracker } from '@/hooks/useGPSTracker';

// Importer les services API
import { useGetCircuitByIdQuery } from '@/services/api/CircuitApi';
import { useGetCustomCircuitByIdQuery } from '@/services/api/CustomCircuitApi';
import {
	useGetCircuitProgressQuery,
	useUpdateCircuitProgressMutation,
} from '@/services/api/CircuitProgressApi';

// Importer les composants
import NavigationControls from '@/components/circuits/NavigationControls';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { toast } from 'sonner';

// Import CircuitMap dynamically with SSR disabled to avoid leaflet window errors
const CircuitMap = dynamic(() => import('@/components/circuits/CircuitMap'), {
	ssr: false,
	loading: () => (
		<div className="flex h-full w-full items-center justify-center bg-gray-100">
			<LoadingState message="Chargement de la carte..." />
		</div>
	),
});

interface NavigationPageProps {
	params: Promise<{
		locale: string;
		id: string;
	}>;
}

export default function NavigationPage({ params }: NavigationPageProps) {
	const { locale, id: circuitId } = use(params);
	const t = useTranslations('Circuits');
	const router = useRouter();

	// États de navigation
	const [currentStep, setCurrentStep] = useState(0);
	const [sortedPois, setSortedPois] = useState<POI[]>([]);
	const [completedPois, setCompletedPois] = useState<string[]>([]);
	const [isGuidingActive, setIsGuidingActive] = useState(false); // État pour le guide GPS

	// Suivi GPS - APPEL DIRECT DU HOOK (pas dans useEffect)
	const { position, error: gpsError, startTracking, stopTracking } = useGPSTracker(true);

	// Récupération des données - Try regular circuit first, then custom
	const {
		data: regularCircuitData,
		isLoading: isLoadingRegular,
		isError: isCircuitError,
	} = useGetCircuitByIdQuery(circuitId);

	// If regular circuit fails, try custom circuit
	const {
		data: customCircuitData,
		isLoading: isLoadingCustom,
		isError: isErrorCustom,
	} = useGetCustomCircuitByIdQuery(circuitId, {
		skip: !isCircuitError, // Only fetch if regular circuit fails
	});

	// Determine which data to use
	const isCustomCircuit = isCircuitError && !isErrorCustom;
	const circuitData = isCustomCircuit ? customCircuitData : regularCircuitData;
	const isLoadingCircuit = isLoadingRegular || (isCircuitError && isLoadingCustom);

	const {
		data: progressData,
		isLoading: isLoadingProgress,
		isError: isProgressError,
	} = useGetCircuitProgressQuery(circuitId, {
		// Ne pas exécuter tant que l'ID n'est pas disponible
		skip: !circuitId, 
	});

	// Mutation pour mettre à jour la progression
	const [updateProgress, { isLoading: isUpdatingProgress }] =
		useUpdateCircuitProgressMutation();

	// Initialiser les POIs et la progression
	useEffect(() => {
		if (circuitData?.data && progressData) {
			const pois = [...(circuitData.data.pois || [])].sort(
				(a, b) => ((a as any).CircuitPOI?.order || 0) - ((b as any).CircuitPOI?.order || 0)
			);
			setSortedPois(pois);
			
			const completed = progressData.completedPOIs || progressData.completedPoiIds || [];
			setCompletedPois(completed);
			
			// Placer l'utilisateur à la bonne étape
			setCurrentStep(progressData.currentPOIIndex || 0);

			// 🐛 DEBUG: Afficher les POIs chargés
			console.log('🗺️ POIs chargés:', pois.length);
			pois.forEach((poi, idx) => {
				console.log(`POI ${idx + 1}:`, {
					id: poi.id,
					name: (poi as any).frLocalization?.name,
					coordinates: (poi as any).coordinates,
					hasCoords: !!(poi as any).coordinates,
				});
			});
		}
	}, [circuitData, progressData]);
	
	// Démarrer le suivi GPS au montage (sans dépendances pour éviter boucle infinie)
	useEffect(() => {
		startTracking();
		// Cleanup sur démontage uniquement
		return () => {
			stopTracking();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Tableau vide = exécution une seule fois

	// --- Logique de navigation ---
	const handleNext = () => {
		if (currentStep < sortedPois.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleMarkAsVisited = async () => {
		const currentPoi = sortedPois[currentStep];
		if (!currentPoi || completedPois.includes(currentPoi.id)) return;

		try {
			const updatedProgress = await updateProgress({
				circuitId: circuitId,
				poiId: currentPoi.id,
			}).unwrap();

			toast.success(t('poiVisitedSuccess'));
			setCompletedPois(updatedProgress.completedPOIs || updatedProgress.completedPoiIds || []);

			// Vérifier si le circuit est terminé
			if (updatedProgress.status === 'COMPLETED') {
				toast.success(t('circuitComplete'));
				// Rediriger vers la page de résumé
				setTimeout(() => {
					router.push(`/circuits/${circuitId}/summary`);
				}, 2000);
			} else {
				// Passer automatiquement à l'étape suivante
				handleNext();
			}
		} catch (err) {
			toast.error(t('poiVisitedError'));
			console.error('Erreur de mise à jour:', err);
		}
	};

	// --- Rendu ---
	if (isLoadingCircuit || isLoadingProgress) {
		return <LoadingState message={t('loading')} />;
	}

	// Check if BOTH circuit fetches failed (not just the regular one)
	const isBothCircuitError = isCircuitError && isErrorCustom;
	
	if (isBothCircuitError || isProgressError || sortedPois.length === 0) {
		return <ErrorState error={isBothCircuitError ? 'Circuit error' : 'Progress error'} onRetry={() => {}} />;
	}

	const currentPoi = sortedPois[currentStep];
	const isPoiCompleted = completedPois.includes(currentPoi.id);

	return (
		<div className="relative h-[100vh] w-full pt-16"> 
{/* Espace pour la carte */}
			<div className="absolute inset-0 h-[calc(100%-160px)] w-full">
				{/* --- REMPLACEMENT --- */}
				<CircuitMap
					pois={sortedPois}
					currentPoiIndex={currentStep}
					completedPoiIds={completedPois}
					userPosition={
						position ? {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
							accuracy: position.coords.accuracy,
						} : null
					}
					locale={locale}
				/>
				{/* AFFICHER ERREUR GPS SI NECESSAIRE */}
				{/* {gpsError && <p className="absolute bottom-2 left-2 z-[1000] bg-red-500 p-2 text-white">GPS Error: {gpsError.message}</p>} */}
			</div>

			{/* Contrôles de navigation en bas */}
			<NavigationControls
				locale={locale}
				currentPoi={currentPoi}
				currentStep={currentStep}
				totalSteps={sortedPois.length}
				isCompleted={isPoiCompleted}
				isLoading={isUpdatingProgress}
				onNext={handleNext}
				onPrev={handlePrev}
				onMarkAsVisited={handleMarkAsVisited}
			/>
		</div>
	);
}