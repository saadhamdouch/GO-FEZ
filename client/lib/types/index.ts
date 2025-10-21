export interface ExploreCardProps {
  item: any;
  selected: string | null;
  onSelect: (id: string) => void;
  currentLocale: string;
}

export interface LanguageDropdownProps {
  locale: string;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export interface FeatureIconProps {
  icon: string;
  color: string;
}