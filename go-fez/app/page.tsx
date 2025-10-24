import BottomSheet from "@/components/bottom-sheet"
import FilterTabs from "@/components/filter-tabs"
import MapScreen from "@/components/map-screen"
import SearchBar from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, User } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <main className="w-full h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">Discover</h1>
              <p className="text-xs opacity-90">Find amazing locations near you</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Filter Tabs */}
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <MapScreen selectedPlace={selectedPlace} filter={activeFilter} onPlaceSelect={setSelectedPlace} />
      </div>

      {/* Bottom Sheet */}
      <BottomSheet place={selectedPlace} onPlaceSelect={setSelectedPlace} />
    </main>
  )
}
