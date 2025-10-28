export interface ExploreCardProps {
  item: any;
  selected: string | null;
  onSelect: (id: string) => void;
  currentLocale: string;
}

export interface LanguageSelectorProps {
  locale: string;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export interface FeatureIconProps {
  icon: string;
  color: string;
}
// client/lib/types/index.ts

// --- Existing Types ---

export interface ExploreCardProps {
  item: any;
  selected: string | null;
  onSelect: (id: string) => void;
  currentLocale: string;
}

export interface LanguageSelectorProps {
  locale: string;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export interface FeatureIconProps {
  icon: string;
  color: string;
}

// --- Added Missing Types ---

// Basic localization object
export interface Localization {
  name: string;
  description: string;
  address: string;
}

// Defines a file attached to a POI
export interface POIFile {
  id: string;
  fileUrl: string;
  type: 'image' | 'video' | 'virtualtour';
}

// Defines a POI Category
export interface POICategory {
  id: string;
  fr: string;
  ar: string;
  en: string;
}

// Defines the main POI (Point of Interest) type
export interface POI {
  id: string;
  frLocalization?: Localization;
  arLocalization?: Localization;
  enLocalization?: Localization;
  // Direct access for localized fields (used in POITimeline)
  fr?: Localization;
  ar?: Localization;
  en?: Localization;
  files?: POIFile[];
  categoryPOI?: POICategory;
  isPremium?: boolean;
  // Includes data from the circuit join table
  CircuitPOI?: {
    order: number;
  };
}

// Defines the Circuit type (inferred from circuit page)
export interface Circuit {
  id: string;
  fr: Localization;
  ar: Localization;
  en: Localization;
  image: string;
  themes?: Array<{ id: string; fr: string | Localization }>;
  pois?: POI[];
  durationMinutes: number; // Used in theme detail page
  difficulty: string; // Used in theme detail page
  isActive: boolean;
}

// Defines the Circuit Progress type
export interface CircuitProgress {
  id: string;
  userId: string;
  circuitId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedPoiIds: string[];
  createdAt: string;
  updatedAt: string;
}