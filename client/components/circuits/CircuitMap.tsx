// client/components/circuits/CircuitMap.tsx
'use client';

import React, { useEffect } from 'react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	CircleMarker,
	Tooltip,
} from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { POI } from '@/lib/types';
import { defaultIcon, currentIcon, visitedIcon } from '@/lib/mapIcons'; // NOUVEAU
import MapRouting from './MapRouting'; // NOUVEAU

// Interface pour les props (ajout de completedPoiIds)
interface CircuitMapProps {
	pois: POI[];
	currentPoiIndex: number;
	completedPoiIds: string[]; // NOUVEAU
	userPosition: { latitude: number; longitude: number; accuracy: number } | null;
	locale: string;
}

// Composant pour recentrer la carte
const RecenterMap: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
	const map = useMap();
	useEffect(() => {
		// Utiliser flyTo pour une transition douce
		map.flyTo(center, zoom, { duration: 1 });
	}, [center, zoom, map]);
	return null;
};

const CircuitMap: React.FC<CircuitMapProps> = ({
	pois,
	currentPoiIndex,
	completedPoiIds, // NOUVEAU
	userPosition,
	locale,
}) => {
	// ... (tri des POIs, initialCenter, currentPoi, currentPoiCenter inchangés)
	const sortedPois = [...pois].sort(
		(a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0)
	);

	const initialCenter: LatLngExpression =
		sortedPois.length > 0 && sortedPois[0].coordinates
			? [
					sortedPois[0].coordinates.coordinates[1],
					sortedPois[0].coordinates.coordinates[0],
			  ]
			: [34.0333, -5.0000];

	const currentPoi = sortedPois[currentPoiIndex];
	const currentPoiCenter: LatLngExpression | null = currentPoi?.coordinates
		? [
				currentPoi.coordinates.coordinates[1],
				currentPoi.coordinates.coordinates[0],
		  ]
		: null;

	let mapCenter = currentPoiCenter || initialCenter;
	let mapZoom = 15;

	if (userPosition) {
		mapCenter = [userPosition.latitude, userPosition.longitude];
		mapZoom = 16;
	}

	// Préparer les waypoints pour le routage
	const waypoints = sortedPois
		.filter((poi) => poi.coordinates)
		.map((poi) =>
			L.latLng(
				poi.coordinates!.coordinates[1],
				poi.coordinates!.coordinates[0]
			)
		);

	return (
		<MapContainer
			center={mapCenter}
			zoom={mapZoom}
			scrollWheelZoom={true}
			style={{ height: '100%', width: '100%' }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{/* Marqueurs pour tous les POIs avec icônes personnalisées */}
			{sortedPois.map((poi, index) => {
				if (!poi.coordinates) return null;
				const position: LatLngExpression = [
					poi.coordinates.coordinates[1],
					poi.coordinates.coordinates[0],
				];
				const name =
					poi[locale as 'fr' | 'en' | 'ar']?.name || poi.frLocalization?.name;
				const isCurrent = index === currentPoiIndex;
				const isVisited = completedPoiIds.includes(poi.id);

				let icon = defaultIcon;
				if (isCurrent) {
					icon = currentIcon;
				} else if (isVisited) {
					icon = visitedIcon;
				}

				return (
					<Marker
						key={poi.id}
						position={position}
						icon={icon} // Utiliser l'icône personnalisée
						opacity={isCurrent ? 1 : isVisited ? 0.7 : 0.5} // Adapter l'opacité
						zIndexOffset={isCurrent ? 1000 : isVisited ? 500 : 0} // Mettre le courant au premier plan
					>
						<Popup>{name}</Popup>
					</Marker>
				);
			})}

			{/* Marqueur pour la position de l'utilisateur */}
			{userPosition && (
				<CircleMarker
					center={[userPosition.latitude, userPosition.longitude]}
					radius={8}
					pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.8 }}
				>
					<Tooltip>Vous êtes ici</Tooltip>
				</CircleMarker>
			)}

			{/* Composant pour recentrer */}
			<RecenterMap center={mapCenter} zoom={mapZoom} />

			{/* Composant pour le routage */}
			{waypoints.length > 1 && <MapRouting waypoints={waypoints} />}
		</MapContainer>
	);
};

export default CircuitMap;