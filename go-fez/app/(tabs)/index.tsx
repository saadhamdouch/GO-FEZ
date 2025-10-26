import BottomSheetContent from '@/components/BottomSheetContent';
import BottomSheet from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';

const { height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 34.0626,
  longitude: -5.0077,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LOCATIONS = [
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

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [100, 300, height * 0.8], [height]);
  const [selectedLocation, setSelectedLocation] = useState<
    (typeof LOCATIONS)[0] | null
  >(null);

  const handleMarkerPress = useCallback((location: (typeof LOCATIONS)[0]) => {
    setSelectedLocation(location);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mapContainer}>
        {/* <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton
        >
          {LOCATIONS.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.title}
              onPress={() => handleMarkerPress(location)}
            />
          ))}
        </MapView> */}
        <Image
          style={styles.map}
          source={{
            uri: 'https://media.istockphoto.com/id/153899589/fr/vectoriel/fiction-plan-de-la-ville.jpg?s=1024x1024&w=is&k=20&c=L8r6LEJfMemcffuHVIsDPGGbQAWK87vrilLdDpvNXnA=',
          }}
        />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        enableOverDrag={false}
      >
        <BottomSheetContent selectedLocation={selectedLocation} />
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
