// client/components/circuits/MapRouting.tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface MapRoutingProps {
	waypoints: L.LatLng[]; // [Position utilisateur, POI actuel]
}

const MapRouting: React.FC<MapRoutingProps> = ({ waypoints }) => {
	const map = useMap();
	const routingControlRef = useRef<L.Routing.Control | null>(null);

	useEffect(() => {
		if (!map || waypoints.length !== 2) {
			console.warn('⚠️ MapRouting: Nécessite exactement 2 waypoints (utilisateur → POI actuel)');
			return;
		}

		console.log('🔵 MapRouting: Création de la route utilisateur → POI actuel');

		// Supprimer l'ancien contrôle de routage s'il existe
		if (routingControlRef.current) {
			try {
				map.removeControl(routingControlRef.current);
			} catch (e) {
				console.warn('⚠️ Erreur lors de la suppression du contrôle de routage:', e);
			}
			routingControlRef.current = null;
		}

		// Créer l'instance de routage avec LIGNE BLEUE ÉPAISSE
		const routingControl = L.Routing.control({
			waypoints: waypoints,
			routeWhileDragging: false,
			show: false, // Masquer le panneau d'instructions
			addWaypoints: false, // Désactiver l'ajout de waypoints
			fitSelectedRoutes: false, // Ne pas auto-zoom sur la route
			lineOptions: {
				styles: [
					{ 
						color: '#3b82f6', // Bleu vif pour la route utilisateur → POI actuel
						opacity: 0.9, 
						weight: 8, // Ligne épaisse pour bien la voir
						className: 'route-line-user-to-poi'
					}
				],
				extendToWaypoints: true,
				missingRouteTolerance: 0,
			},
			// PAS DE MARQUEURS - Supprimer les marqueurs A/B automatiques
			createMarker: function () {
				return null; // Ne pas créer de marqueurs
			},
			// Router OSRM
			router: L.Routing.osrmv1({
				serviceUrl: 'https://router.project-osrm.org/route/v1',
				
				// --- DÉBUT DE LA CORRECTION ---
				// Revenir à 'foot' car 'walking' n'est pas supporté par le serveur public
				profile: 'foot', 
				// --- FIN DE LA CORRECTION ---
			}),
		} as any).addTo(map);

		routingControlRef.current = routingControl;

		// Écouter l'événement de routage trouvé
		routingControl.on('routesfound', function(e) {
			const routes = e.routes;
			if (routes && routes.length > 0) {
				const route = routes[0];
				console.log('🗺️ Route utilisateur → POI trouvée (OSRM foot):', {
					distance: `${(route.summary.totalDistance / 1000).toFixed(2)} km`,
					durée: `${Math.round(route.summary.totalTime / 60)} min`,
					étapes: route.coordinates?.length || 0,
				});
			}
		});

		// Écouter les erreurs de routage
		routingControl.on('routingerror', function(e) {
			console.error('❌ Erreur lors du tracé de la route utilisateur → POI (OSRM foot):', e);
		});

		// Nettoyage lors du démontage du composant
		return () => {
			if (map && routingControlRef.current) {
				try {
					map.removeControl(routingControlRef.current);
				} catch (e) {
					console.warn('⚠️ Erreur lors du nettoyage du contrôle de routage:', e);
				}
				routingControlRef.current = null;
			}
		};
	}, [map, waypoints]);

	return null; // Ce composant ne rend rien visuellement
};

export default MapRouting;