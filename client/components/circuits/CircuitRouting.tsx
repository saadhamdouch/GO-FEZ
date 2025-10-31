// client/components/circuits/CircuitRouting.tsx
// Composant pour tracer le circuit COMPLET entre tous les POIs avec OSRM
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface CircuitRoutingProps {
	waypoints: L.LatLng[]; // TOUS les POIs du circuit dans l'ordre
}

const CircuitRouting: React.FC<CircuitRoutingProps> = ({ waypoints }) => {
	const map = useMap();
	const routingControlRef = useRef<L.Routing.Control | null>(null);

	useEffect(() => {
		if (!map || waypoints.length < 2) {
			console.warn('⚠️ CircuitRouting: Pas assez de waypoints pour tracer le circuit complet');
			return;
		}

		console.log('� CircuitRouting: Création du circuit complet avec', waypoints.length, 'POIs');

		// Supprimer l'ancien contrôle s'il existe
		if (routingControlRef.current) {
			try {
				map.removeControl(routingControlRef.current);
			} catch (e) {
				console.warn('⚠️ Erreur lors de la suppression du contrôle de routage:', e);
			}
			routingControlRef.current = null;
		}

		// Créer le routage pour tout le circuit (ligne violette)
		const routingControl = L.Routing.control({
			waypoints: waypoints,
			routeWhileDragging: false,
			show: false, // Masquer le panneau d'instructions
			addWaypoints: false, // Désactiver l'ajout de waypoints
			fitSelectedRoutes: false, // Ne pas auto-zoom
			lineOptions: {
				styles: [
					{ 
						color: '#8b5cf6', // Violet pour le circuit complet
						opacity: 0.7, 
						weight: 6,
						dashArray: '10, 8', // Ligne en pointillés
						className: 'circuit-complete-line'
					}
				],
				extendToWaypoints: true,
				missingRouteTolerance: 0,
			},
			// PAS DE MARQUEURS - Supprimer les marqueurs A/B automatiques
			createMarker: function () {
				return null; // Ne pas créer de marqueurs
			},
			// Router OSRM en mode PIÉTON (walking/foot)
			router: L.Routing.osrmv1({
				serviceUrl: 'https://router.project-osrm.org/route/v1',
				profile: 'foot', // Mode piéton pour chemins optimaux
			}),
		} as any).addTo(map);

		routingControlRef.current = routingControl;

		// Logger les informations du circuit trouvé
		routingControl.on('routesfound', function(e) {
			const routes = e.routes;
			if (routes && routes.length > 0) {
				const route = routes[0];
				console.log('� Circuit complet tracé avec succès:', {
					distance: `${(route.summary.totalDistance / 1000).toFixed(2)} km`,
					durée: `${Math.round(route.summary.totalTime / 60)} min`,
					étapes: waypoints.length,
				});
			}
		});

		// Logger les erreurs de routage
		routingControl.on('routingerror', function(e) {
			console.error('❌ Erreur lors du tracé du circuit complet:', e);
		});

		// Nettoyage lors du démontage
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

export default CircuitRouting;
