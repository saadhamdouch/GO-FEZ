// client/app/[locale]/circuits/[id]/navigation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { POI } from '@/lib/types';
import { useGPSTracker } from '@/hooks/useGPSTracker';

// Importer les services API
import { useGetCircuitByIdQuery } from '@/services/api/CircuitApi';
import {
	useGetCircuitProgressQuery,
	useUpdateCircuitProgressMutation,
} from '@/services/api/CircuitProgressApi';

// Importer les composants
import NavigationControls from '@/components/circuits/NavigationControls';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { toast } from 'sonner';
import CircuitMap from '@/components/circuits/CircuitMap'; // NOUVEL IMPORT

// Composant de carte factice
const CircuitMapPlaceholder: React.FC = () => (
	<div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
		(CircuitMap.tsx - Intégration Mapbox/Leaflet)
	</div>
);

export default function NavigationPage() {
	const t = useTranslations('CircuitNavigation');
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string;
	const circuitId = params.id as string;

	// États de navigation
	const [currentStep, setCurrentStep] = useState(0);
	const [sortedPois, setSortedPois] = useState<POI[]>([]);
	const [completedPois, setCompletedPois] = useState<string[]>([]);

	// Suivi GPS
const { position, error: gpsError, startTracking, stopTracking } = useGPSTracker(true); // Ajout start/stop	
	// Récupération des données
	const {
		data: circuitData,
		isLoading: isLoadingCircuit,
		isError: isCircuitError,
	} = useGetCircuitByIdQuery(circuitId);

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
			const pois = [...circuitData.data.pois].sort(
				(a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0)
			);
			setSortedPois(pois);
			
			const completed = progressData.completedPOIs || [];
			setCompletedPois(completed);
			
			// Placer l'utilisateur à la bonne étape
			setCurrentStep(progressData.currentPOIIndex || 0);
		}
	}, [circuitData, progressData]);
	
	// Démarrer le suivi GPS au montage
	useEffect(() => {
		const { startTracking, stopTracking } = useGPSTracker(true);
		startTracking();
		return () => stopTracking();
	}, []);

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
			setCompletedPois(updatedProgress.completedPOIs || []);

			// Vérifier si le circuit est terminé
			if (updatedProgress.status === 'COMPLETED') {
				toast.success(t('circuitComplete'));
				// Rediriger vers la page de résumé
				setTimeout(() => {
					router.push(`/${locale}/circuits/${circuitId}/summary`);
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
		return <LoadingState text={t('loading')} />;
	}

	if (isCircuitError || isProgressError || sortedPois.length === 0) {
		return <ErrorState message={t('error')} onRetry={() => {}} />;
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
}// client/app/[locale]/circuits/[id]/navigation/page.tsx
// ... (imports)
import CircuitMap from '@/components/circuits/CircuitMap';
// ...

export default function NavigationPage() {
	// ... (t, router, params, locale, circuitId)
	// ... (états: currentStep, sortedPois, completedPois)
	const [currentStep, setCurrentStep] = useState(0);
	const [sortedPois, setSortedPois] = useState<POI[]>([]);
	const [completedPois, setCompletedPois] = useState<string[]>([]); // Déjà présent

	// ... (useGPSTracker)
	const { position, error: gpsError, startTracking, stopTracking } = useGPSTracker(true); // Ajout start/stop

	// ... (API Queries: circuitData, progressData)
	// ... (Mutation: updateProgress)

	// ... (useEffect pour initialiser pois et progression)
	useEffect(() => {
		// ... (logique existante)
	}, [circuitData, progressData]);

	// Démarrer et arrêter le suivi GPS
	useEffect(() => {
		startTracking(); // Démarrer le suivi au montage
		return () => stopTracking(); // Arrêter au démontage
	}, [startTracking, stopTracking]); // Dépendances pour ESLint

	// --- NOUVEAU: Logique de Proximité ---
	useEffect(() => {
		if (!position || sortedPois.length === 0 || currentStep >= sortedPois.length) {
			return; // Pas de position, pas de POIs, ou étape invalide
		}

		const currentPoi = sortedPois[currentStep];
		if (!currentPoi || !currentPoi.coordinates || completedPois.includes(currentPoi.id)) {
			// Pas de coordonnées pour le POI actuel ou déjà visité
			return;
		}

		const poiLat = currentPoi.coordinates.coordinates[1];
		const poiLng = currentPoi.coordinates.coordinates[0];
		const userLat = position.coords.latitude;
		const userLng = position.coords.longitude;

		// Calcul de distance (Haversine simplifié)
		const R = 6371e3; // Rayon de la Terre en mètres
		const φ1 = userLat * Math.PI/180;
		const φ2 = poiLat * Math.PI/180;
		const Δφ = (poiLat-userLat) * Math.PI/180;
		const Δλ = (poiLng-userLng) * Math.PI/180;

		const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
				  Math.cos(φ1) * Math.cos(φ2) *
				  Math.sin(Δλ/2) * Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		const distance = R * c; // Distance en mètres

		const PROXIMITY_THRESHOLD = 50; // Mètres

		// console.log(`Distance to ${currentPoi.frLocalization?.name}: ${distance.toFixed(0)}m`);

		if (distance < PROXIMITY_THRESHOLD) {
			console.log(`[Proximity] Proche de ${currentPoi.frLocalization?.name}!`);
			// Déclencher une action: notification, vibration, ou auto-validation?
			// Pour l'instant, juste une notification suggérant de valider
			// Éviter les toasts répétitifs si l'utilisateur reste proche
			const suggestionKey = `suggest-visit-${currentPoi.id}`;
			if (!sessionStorage.getItem(suggestionKey)) {
				toast.info(`Vous êtes proche de ${currentPoi.frLocalization?.name}.`, {
					description: "Marquez cette étape comme visitée ?",
					action: {
						label: "Visité",
						onClick: () => handleMarkAsVisited(),
					},
					duration: 10000, // 10 secondes
				});
				sessionStorage.setItem(suggestionKey, 'true'); // Marquer comme suggéré
			}
		} else {
			// Si l'utilisateur s'éloigne, permettre une nouvelle suggestion
			sessionStorage.removeItem(`suggest-visit-${currentPoi.id}`);
		}

	}, [position, currentStep, sortedPois, completedPois]); // Dépendances pour l'effet

	// ... (handleNext, handlePrev, handleMarkAsVisited inchangés)
	// Dans handleMarkAsVisited, s'assurer de nettoyer la suggestion de sessionStorage
	const handleMarkAsVisited = async () => {
		const currentPoi = sortedPois[currentStep];
		if (!currentPoi || completedPois.includes(currentPoi.id)) return;

		// --- Nettoyer suggestion ---
		sessionStorage.removeItem(`suggest-visit-${currentPoi.id}`);
		// --- Fin nettoyage ---

		try {
			// ... (logique existante d'updateProgress et redirection)
		} catch (err) {
			// ...
		}
	};

	// --- Rendu ---
	if (isLoadingCircuit || isLoadingProgress) {
		// ...
	}
	if (isCircuitError || isProgressError || sortedPois.length === 0) {
		// ...
	}

	const currentPoi = sortedPois[currentStep];
	const isPoiCompleted = completedPois.includes(currentPoi.id);

	return (
		<div className="relative h-[100vh] w-full pt-16">
			<div className="absolute inset-0 h-[calc(100%-160px)] w-full">
				<CircuitMap
					pois={sortedPois}
					currentPoiIndex={currentStep}
					completedPoiIds={completedPois} // --- PROP AJOUTÉE ---
					userPosition={
						position ? {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
							accuracy: position.coords.accuracy,
						} : null
					}
					locale={locale}
				/>
			</div>
			<NavigationControls
				// ... (props inchangées)
			/>
		</div>
	);
}