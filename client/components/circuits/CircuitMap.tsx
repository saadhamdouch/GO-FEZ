// client/components/circuits/CircuitMap.tsx
'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { POI } from '@/lib/types';
import L from 'leaflet';

// Importer Leaflet de manière dynamique pour éviter les problèmes SSR
const MapContainer = dynamic(
	() => import('react-leaflet').then((mod) => mod.MapContainer),
	{ ssr: false }
);
const TileLayer = dynamic(
	() => import('react-leaflet').then((mod) => mod.TileLayer),
	{ ssr: false }
);
const Marker = dynamic(
	() => import('react-leaflet').then((mod) => mod.Marker),
	{ ssr: false }
);
const Popup = dynamic(
	() => import('react-leaflet').then((mod) => mod.Popup),
	{ ssr: false }
);
const Circle = dynamic(
	() => import('react-leaflet').then((mod) => mod.Circle),
	{ ssr: false }
);

// Importer MapRouting et CircuitRouting dynamiquement
const MapRouting = dynamic(() => import('./MapRouting'), { ssr: false });
const CircuitRouting = dynamic(() => import('./CircuitRouting'), { ssr: false });

// Composant MapCenterUpdater chargé dynamiquement
const MapCenterUpdater = dynamic(
	() => import('react-leaflet').then((mod) => {
		const { useMap } = mod;
		
		const Component: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
			const map = useMap();
			
			React.useEffect(() => {
				if (map && center) {
					map.flyTo(center, zoom, {
						animate: true,
						duration: 1.5,
					});
				}
			}, [map, center, zoom]);
			
			return null;
		};
		
		return { default: Component };
	}),
	{ ssr: false }
);

// Icônes personnalisées pour les POIs
const createIcon = (color: string, scale: number = 1) => {
	if (typeof window === 'undefined') return undefined;
	
	const size = 25 * scale;
	const anchorSize = 41 * scale;
	
	return new L.Icon({
		iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
		iconSize: [size, anchorSize],
		iconAnchor: [size / 2, anchorSize],
		popupAnchor: [1, -34 * scale],
		shadowSize: [41 * scale, 41 * scale],
	});
};

// Icône ultra-moderne pour la position de l'utilisateur
const createUserIcon = () => {
	if (typeof window === 'undefined') return undefined;
	
	return new L.DivIcon({
		className: 'custom-user-marker',
		html: `
			<div style="
				position: relative;
				width: 40px;
				height: 40px;
			">
				<!-- Pulse externe -->
				<div style="
					position: absolute;
					width: 40px;
					height: 40px;
					background: rgba(59, 130, 246, 0.3);
					border-radius: 50%;
					animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
				"></div>
				<!-- Cercle principal -->
				<div style="
					position: absolute;
					top: 8px;
					left: 8px;
					width: 24px;
					height: 24px;
					background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
					display: flex;
					align-items: center;
					justify-content: center;
				">
					<div style="
						width: 8px;
						height: 8px;
						background: white;
						border-radius: 50%;
					"></div>
				</div>
			</div>
			<style>
				@keyframes pulse {
					0%, 100% { transform: scale(1); opacity: 1; }
					50% { transform: scale(1.5); opacity: 0; }
				}
			</style>
		`,
		iconSize: [40, 40],
		iconAnchor: [20, 20],
	});
};

// Interface pour les props
interface CircuitMapProps {
	pois: POI[];
	currentPoiIndex: number;
	completedPoiIds: string[];
	userPosition: { latitude: number; longitude: number; accuracy: number } | null;
	locale: string;
}

// Helper pour extraire les coordonnées - GÈRE TOUS LES FORMATS POSSIBLES
// Helper pour extraire les coordonnées - GÈRE TOUS LES FORMATS POSSIBLES
// Helper pour extraire les coordonnées - GÈRE TOUS LES FORMATS POSSIBLES
const getCoordinates = (poi: POI): [number, number] | null => {
	let rawCoords = poi.coordinates; // 'let' car nous allons peut-être le parser
	if (!rawCoords) return null;

	let coords: any = rawCoords;

	// **LA CORRECTION EST ICI**
	// 1. Vérifier si c'est un string, si oui, le parser en objet
	if (typeof coords === 'string') {
		try {
			// Le 'in' operator a crashé, prouvant que 'coords' est un string JSON
			coords = JSON.parse(coords);
		} catch (e) {
			console.error('Failed to parse coordinates string:', coords, e);
			return null; // Données corrompues
		}
	}
	// 'coords' est maintenant un objet ou un tableau, on peut le vérifier en toute sécurité.

	// Cas 1: Format tableau direct [lng, lat] ou [lat, lng]
	if (Array.isArray(coords)) {
		if (coords.length === 2) {
			const [first, second] = coords;
			// Détection: latitude est généralement entre -90 et 90
			if (Math.abs(first) <= 90 && Math.abs(second) > 90) {
				return [first, second]; // [lat, lng]
			}
			return [second, first]; // [lng, lat] -> convertir en [lat, lng]
		}
		return null; // Tableau malformé
	}

	// Si ce n'est pas un tableau, c'est un objet.

	// Cas 2: Format objet {latitude, longitude} (Le format de votre erreur)
	if (coords && typeof coords === 'object' && 'latitude' in coords && 'longitude' in coords) {
		return [coords.latitude, coords.longitude];
	}

	// Cas 3: Format GeoJSON {type: 'Point', coordinates: [lng, lat]}
	if (coords && typeof coords === 'object' && 'type' in coords && coords.type === 'Point' && 'coordinates' in coords) {
		const [lng, lat] = coords.coordinates;
		return [lat, lng]; // Leaflet utilise [lat, lng]
	}

	// Cas 4: Format objet {lat, lng} (Le format de l'admin)
	if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
		return [coords.lat, coords.lng];
	}

	console.warn(
		'⚠️ Format de coordonnées non reconnu pour le POI:',
		poi.id,
		coords
	);
	return null;
};

const CircuitMap: React.FC<CircuitMapProps> = ({
	pois,
	currentPoiIndex,
	completedPoiIds,
	userPosition,
	locale,
}) => {
	const sortedPois = [...pois].sort(
		(a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0)
	);

	// Utiliser la fonction helper pour obtenir les coordonnées
	const firstPoiCoords = sortedPois.length > 0 ? getCoordinates(sortedPois[0]) : null;
	const initialCenter: [number, number] = firstPoiCoords || [34.0333, -5.0000]; // Fès par défaut

	const currentPoi = sortedPois[currentPoiIndex];
	const currentPoiCenter: [number, number] | null = currentPoi ? getCoordinates(currentPoi) : null;

	// Calculer le centre de la carte - PRIORISER LE POI ACTUEL
	let mapCenter: [number, number] = initialCenter;
	let mapZoom = 15;

	if (currentPoiCenter) {
		// Centrer sur le POI actuel
		mapCenter = currentPoiCenter;
		mapZoom = 17;
	} else if (userPosition) {
		// Fallback: centrer sur l'utilisateur
		mapCenter = [userPosition.latitude, userPosition.longitude];
		mapZoom = 16;
	}

	// Préparer les waypoints pour le routage utilisateur -> POI actuel (LIGNE BLEUE)
	const userToPoiWaypoints: L.LatLng[] = [];
	
	if (userPosition && currentPoiCenter) {
		userToPoiWaypoints.push(
			new L.LatLng(userPosition.latitude, userPosition.longitude),
			new L.LatLng(currentPoiCenter[0], currentPoiCenter[1])
		);
	}

	// Préparer les waypoints pour le circuit COMPLET (TOUS les POIs) - LIGNE VIOLETTE
	const circuitWaypoints: L.LatLng[] = sortedPois
		.map((poi) => {
			const coords = getCoordinates(poi);
			return coords ? new L.LatLng(coords[0], coords[1]) : null;
		})
		.filter((wp): wp is L.LatLng => wp !== null);

	return (
		<MapContainer
			center={initialCenter}
			zoom={15}
			scrollWheelZoom={true}
			zoomControl={true}
			style={{ height: '100%', width: '100%' }}
			className="rounded-lg overflow-hidden"
		>
			{/* Carte OpenStreetMap détaillée */}
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				maxZoom={19}
				minZoom={3}
			/>

			{/* Composant pour mettre à jour le centre automatiquement */}
			<MapCenterUpdater center={mapCenter} zoom={mapZoom} />

			{/* CIRCUIT COMPLET - Ligne VIOLETTE entre TOUS les POIs */}
			{circuitWaypoints.length >= 2 && (
				<CircuitRouting 
					waypoints={circuitWaypoints}
					key={`circuit-complete-${circuitWaypoints.length}`}
				/>
			)}

			{/* Route utilisateur → POI actuel - Ligne BLEUE ÉPAISSE */}
			{userToPoiWaypoints.length === 2 && (
				<MapRouting 
					waypoints={userToPoiWaypoints} 
					key={`user-to-poi-${currentPoiIndex}-${userPosition?.latitude || 0}`} 
				/>
			)}

			{/* Marqueurs pour TOUS les POIs avec états */}
			{sortedPois.map((poi, index) => {
				const position = getCoordinates(poi);
				if (!position) return null;
				
				const name =
					(poi[locale as 'fr' | 'en' | 'ar'] as any)?.name || 
					poi.frLocalization?.name || 
					'POI sans nom';
				
				const isCurrent = index === currentPoiIndex;
				const isVisited = completedPoiIds.includes(poi.id);

				// Sélectionner l'icône et la taille selon l'état
				let iconColor = 'grey';
				let iconScale = 1;
				
				if (isCurrent) {
					iconColor = 'red';
					iconScale = 1.4; // Plus grand pour le POI actuel
				} else if (isVisited) {
					iconColor = 'green';
					iconScale = 1;
				} else {
					iconColor = 'grey';
					iconScale = 0.9;
				}
				
				const icon = createIcon(iconColor, iconScale);

				return (
					<Marker
						key={poi.id}
						position={position}
						icon={icon}
						zIndexOffset={isCurrent ? 1000 : isVisited ? 500 : 0}
					>
						<Popup maxWidth={250} className="custom-popup">
							<div className="min-w-[200px] p-2">
								<div className="flex items-center gap-2 mb-2">
									{isCurrent && (
										<span className="flex h-2 w-2 relative">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
										</span>
									)}
									<p className="font-bold text-base text-gray-900">{name}</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs text-gray-600 font-medium">
										Étape {index + 1} / {sortedPois.length}
									</p>
									{isVisited && (
										<div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>✓ Visité</span>
										</div>
									)}
									{isCurrent && (
										<div className="flex items-center gap-1.5 text-red-600 text-sm font-bold">
											<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
												<circle cx="12" cy="12" r="8" />
											</svg>
											<span>Destination actuelle</span>
										</div>
									)}
								</div>
							</div>
						</Popup>
					</Marker>
				);
			})}

			{/* Position de l'utilisateur avec icône moderne et cercle de précision */}
			{userPosition && (
				<>
					{/* Cercle de précision */}
					<Circle
						center={[userPosition.latitude, userPosition.longitude]}
						radius={userPosition.accuracy}
						pathOptions={{ 
							color: '#3b82f6', 
							fillColor: '#93c5fd', 
							fillOpacity: 0.15,
							weight: 2,
							opacity: 0.5,
							dashArray: '5, 5'
						}}
					/>
					
					{/* Marqueur de position utilisateur */}
					<Marker
						position={[userPosition.latitude, userPosition.longitude]}
						icon={createUserIcon()}
						zIndexOffset={2000}
					>
						<Popup>
							<div className="text-center p-1">
								<p className="font-bold text-sm mb-1">📍 Vous êtes ici</p>
								<p className="text-xs text-gray-600">
									Précision: ±{Math.round(userPosition.accuracy)}m
								</p>
							</div>
						</Popup>
					</Marker>
				</>
			)}
		</MapContainer>
	);
};

export default CircuitMap;