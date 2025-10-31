// client/hooks/useGPSTracker.ts
'use client';

import { useState, useEffect } from 'react';

interface GeolocationPosition {
	coords: {
		latitude: number;
		longitude: number;
		accuracy: number;
	};
}

interface GeolocationError {
	code: number;
	message: string;
}

interface GPSTrackerResult {
	position: GeolocationPosition | null;
	error: GeolocationError | null;
	startTracking: () => void;
	stopTracking: () => void;
}

/**
 * Hook pour suivre la position GPS de l'utilisateur en temps réel.
 * @param {boolean} highAccuracy - Demander une haute précision (coûte plus de batterie)
 */
export function useGPSTracker(
	highAccuracy: boolean = true
): GPSTrackerResult {
	const [position, setPosition] = useState<GeolocationPosition | null>(null);
	const [error, setError] = useState<GeolocationError | null>(null);
	const [watchId, setWatchId] = useState<number | null>(null);

	const options = {
		enableHighAccuracy: highAccuracy,
		timeout: 10000, // 10 secondes
		maximumAge: 0,
	};

	const onSuccess = (pos: GeolocationPosition) => {
		setPosition(pos);
		setError(null);
	};

	const onError = (err: GeolocationError) => {
		console.warn(`[GPS] Erreur (${err.code}): ${err.message}`);
		setError(err);
	};

	const startTracking = () => {
		if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
			if (watchId !== null) {
				navigator.geolocation.clearWatch(watchId); // Arrêter l'ancien suivi
			}
			const id = navigator.geolocation.watchPosition(
				onSuccess,
				onError,
				options
			);
			setWatchId(id);
		} else {
			setError({ code: 0, message: 'La géolocalisation n-est pas supportée.' });
		}
	};

	const stopTracking = () => {
		if (watchId !== null && typeof navigator !== 'undefined') {
			navigator.geolocation.clearWatch(watchId);
			setWatchId(null);
			setPosition(null); // Optionnel: réinitialiser la position
		}
	};

	// Nettoyage automatique lorsque le composant est démonté
	useEffect(() => {
		return () => {
			if (watchId !== null && typeof navigator !== 'undefined') {
				navigator.geolocation.clearWatch(watchId);
			}
		};
	}, [watchId]);

	return { position, error, startTracking, stopTracking };
}