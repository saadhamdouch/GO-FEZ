

import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { useState } from "react"
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")

const FILTER_TABS = ["Restaurant", "Museums", "Coffee", "Shopping"]

const CATEGORIES = [
  { id: 1, name: "History", image: "/historical-monument.jpg" },
  { id: 2, name: "Traditional", image: "/traditional-craft.jpg" },
  { id: 3, name: "Gastronomy", image: "/moroccan-food.jpg" },
  { id: 4, name: "Spiritual", image: "/mosque-architecture.jpg" },
  { id: 5, name: "Architecture", image: "/islamic-architecture.jpg" },
]

const NEARBY_PLACES = [
  { id: 1, name: "War Museum", location: "Burj al-Shamal", image: "/museum-interior.png" },
  { id: 2, name: "Dar Moussa", location: "Burj al-Shamal", image: "/traditional-house.jpg" },
  { id: 3, name: "War Museum", location: "Burj al-Shamal", image: "/museum-interior.jpg" },
]

interface BottomSheetContentProps {
  selectedLocation: any
}

export default function BottomSheetContent({ selectedLocation }: BottomSheetContentProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <BottomSheetScrollView style={styles.container} scrollEnabled={true}>
      {/* Handle Bar */}
      <View style={styles.handleBar} />

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {FILTER_TABS.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchPlaceholder}>🔍 Search for restaurant, coffee...</Text>
      </View>

      {/* Explore by Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore by category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryImagePlaceholder}>
                <Text style={styles.categoryImageText}>📸</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Places */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby places</Text>
        {NEARBY_PLACES.map((place) => (
          <TouchableOpacity key={place.id} style={styles.placeCard}>
            <View style={styles.placeImagePlaceholder}>
              <Text style={styles.placeImageText}>🏛️</Text>
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeLocation}>{place.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </BottomSheetScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    marginVertical: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeTab: {
    backgroundColor: "#333",
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  searchContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoriesContent: {
    gap: 12,
  },
  categoryCard: {
    width: 100,
    alignItems: "center",
  },
  categoryImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryImageText: {
    fontSize: 40,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
  placeCard: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  placeImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeImageText: {
    fontSize: 32,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  placeLocation: {
    fontSize: 12,
    color: "#999",
  },
  bottomPadding: {
    height: 40,
  },
})
