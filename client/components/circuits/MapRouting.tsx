// client/components/circuits/MapRouting.tsx
import { useEffect } from 'react';
import L, { LatLng } from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface MapRoutingProps {
	waypoints: L.LatLng[];
}

const MapRouting: React.FC<MapRoutingProps> = ({ waypoints }) => {
	const map = useMap();

	useEffect(() => {
		if (!map || waypoints.length < 2) return;

		// Créer l'instance de routage
		const routingControl = L.Routing.control({
			waypoints: waypoints,
			routeWhileDragging: false,
			show: false, // Masquer l'itinéraire textuel par défaut
			addWaypoints: false, // Empêcher l'ajout manuel de points
			draggableWaypoints: false,
			fitSelectedRoutes: true,
			lineOptions: {
				styles: [{ color: '#007bff', opacity: 0.8, weight: 6 }], // Style de la ligne
			},
			// Utiliser des marqueurs vides pour ne pas afficher les A/B par défaut
			createMarker: function () {
				return null;
			},
		}).addTo(map);

		// Nettoyage lors du démontage du composant
		return () => {
			if (map && routingControl) {
				map.removeControl(routingControl);
			}
		};
	}, [map, waypoints]); // Recalculer si la carte ou les points changent

	return null; // Ce composant ne rend rien visuellement lui-même
};

export default MapRouting;