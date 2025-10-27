import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from './ui/text';

interface Monument {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  type: string;
}

interface MapViewerProps {
  monuments?: Monument[];
}

const { height } = Dimensions.get('window');

const LOCATIONS: Monument[] = [
  {
    id: 1,
    latitude: 34.0626,
    longitude: -5.0077,
    title: 'Fez Medina',
    type: 'landmark',
  },
  {
    id: 2,
    latitude: 34.0656,
    longitude: -5.0087,
    title: 'Restaurant',
    type: 'restaurant',
  },
  {
    id: 3,
    latitude: 34.0596,
    longitude: -5.0067,
    title: 'Museum',
    type: 'museum',
  },
  {
    id: 4,
    latitude: 34.0646,
    longitude: -5.0047,
    title: 'Café',
    type: 'coffee',
  },
  { id: 5, latitude: 34.0616, longitude: -5.0107, title: 'Shop', type: 'shop' },
];

export default function MonumentsMapViewer({
  monuments = LOCATIONS,
}: MapViewerProps) {
  const webViewRef = useRef<WebView>(null);

  const defaultCoordinates = {
    latitude: 34.0626,
    longitude: -5.0077,
  };

  // Generate monument markers data for the map
  const monumentsData = JSON.stringify(monuments);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
            }
            #map { 
                width: 100%; 
                height: 100vh; 
            }
            .custom-marker {
                background: none;
                border: none;
            }
            .monument-popup {
                font-family: Arial, sans-serif;
            }
            .monument-popup .title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
                color: #1e293b;
            }
            .monument-popup .type {
                font-size: 12px;
                color: #64748b;
                text-transform: capitalize;
            }
            .user-pin {
                width: 30px;
                height: 30px;
                background: #ef4444;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .user-pin-inner {
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .path-info {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                display: none;
            }
            .path-info.active {
                display: block;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="pathInfo" class="path-info"></div>
        <script>
            const map = L.map('map').setView([${defaultCoordinates.latitude}, ${defaultCoordinates.longitude}], 14);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            const monuments = ${monumentsData};
            
            // Icon mapping for different monument types
            const iconMap = {
                'landmark': '🏛️',
                'restaurant': '🍽️',
                'museum': '🏛️',
                'coffee': '☕',
                'shop': '🛍️',
                'default': '📍'
            };
            
            // Add monument markers
            monuments.forEach(monument => {
                const icon = iconMap[monument.type] || iconMap['default'];
                const marker = L.marker([monument.latitude, monument.longitude], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="font-size: 32px;">' + icon + '</div>',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    })
                }).addTo(map);
                
                marker.bindPopup(
                    '<div class="monument-popup">' +
                    '<div class="title">' + monument.title + '</div>' +
                    '<div class="type">' + monument.type + '</div>' +
                    '</div>'
                );
            });
            
            // User pins and path functionality
            let userPins = [];
            let userMarkers = [];
            let pathPolyline = null;
            
            // Handle map clicks for pinning
            map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                // Add user pin
                const pinMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div class="user-pin"><div class="user-pin-inner"></div></div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                }).addTo(map);
                
                userPins.push({ lat, lng });
                userMarkers.push(pinMarker);
                
                // If we have 2 pins, create a path
                if (userPins.length === 2) {
                    // Remove old polyline if exists
                    if (pathPolyline) {
                        map.removeLayer(pathPolyline);
                    }
                    
                    // Create new polyline
                    pathPolyline = L.polyline(
                        [[userPins[0].lat, userPins[0].lng], [userPins[1].lat, userPins[1].lng]],
                        {
                            color: '#3b82f6',
                            weight: 4,
                            opacity: 0.7,
                            dashArray: '10, 10'
                        }
                    ).addTo(map);
                    
                    // Calculate distance
                    const from = L.latLng(userPins[0].lat, userPins[0].lng);
                    const to = L.latLng(userPins[1].lat, userPins[1].lng);
                    const distance = (from.distanceTo(to) / 1000).toFixed(2);
                    
                    // Show path info
                    const pathInfo = document.getElementById('pathInfo');
                    pathInfo.innerHTML = '📍 Path created: ' + distance + ' km';
                    pathInfo.className = 'path-info active';
                    
                    // Fit bounds to show the path
                    map.fitBounds(pathPolyline.getBounds(), { padding: [50, 50] });
                }
                
                // If we have more than 2 pins, reset
                if (userPins.length > 2) {
                    // Clear all user markers and path
                    userMarkers.forEach(marker => map.removeLayer(marker));
                    if (pathPolyline) {
                        map.removeLayer(pathPolyline);
                    }
                    userPins = [];
                    userMarkers = [];
                    pathPolyline = null;
                    
                    // Hide path info
                    const pathInfo = document.getElementById('pathInfo');
                    pathInfo.className = 'path-info';
                    
                    // Add the current pin as the first one
                    const newPinMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div class="user-pin"><div class="user-pin-inner"></div></div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    }).addTo(map);
                    
                    userPins.push({ lat, lng });
                    userMarkers.push(newPinMarker);
                }
                
                // Send message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'pin_added',
                    latitude: lat,
                    longitude: lng,
                    totalPins: userPins.length
                }));
            });
            
            // Add current location if available
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="font-size: 24px;">📍</div>',
                            iconSize: [24, 24]
                        })
                    }).addTo(map).bindPopup('Your Location');
                }, function(error) {
                    console.log('Geolocation error:', error);
                });
            }
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.mapLoading}>
              <ActivityIndicator size='large' color='#22c55e' />
              <Text style={styles.mapLoadingText}>Loading map...</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
});
