'use client';

import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { MapPin, Calendar, Star, Video, Map as Map360Icon, Music } from 'lucide-react';

interface POICardProps {
  poi: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  getCategoryName: (categoryId: string) => string;
  getCityName: (cityId: string) => string;
}

export function POICard({ poi, onEdit, onDelete, isDeleting, getCategoryName, getCityName }: POICardProps) {
  // Get localized name with fallback
  const getName = () => {
    if (poi.frLocalization?.name) return poi.frLocalization.name;
    if (poi.arLocalization?.name) return poi.arLocalization.name;
    if (poi.enLocalization?.name) return poi.enLocalization.name;
    return 'Sans nom';
  };

  // Get localized description with fallback
  const getDescription = () => {
    if (poi.frLocalization?.description) return poi.frLocalization.description;
    if (poi.arLocalization?.description) return poi.arLocalization.description;
    if (poi.enLocalization?.description) return poi.enLocalization.description;
    return 'Aucune description';
  };

  // Get category name from the relation
  const categoryName = poi.categoryPOI ? getCategoryName(poi.category) : 'Non catégorisé';

  // Check available media
  const hasVideo = poi.poiFile?.video;
  const has360Tour = poi.poiFile?.virtualTour360;
  const hasAudio = poi.frLocalization?.audioFiles || poi.arLocalization?.audioFiles || poi.enLocalization?.audioFiles;
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
      {/* Image with Media Badges */}
      <div className="relative">
        <ImagePreview
          src={poi.poiFile?.image}
          alt={getName()}
          className="w-full h-48"
        />
        {/* Media Indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {hasVideo && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
              <Video className="w-3 h-3" />
              Vidéo
            </span>
          )}
          {has360Tour && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
              <Map360Icon className="w-3 h-3" />
              360°
            </span>
          )}
          {hasAudio && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
              <Music className="w-3 h-3" />
              Audio
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
          {getName()}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {getDescription()}
        </p>

        {/* Location Info */}
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-indigo-600" />
            <span className="font-medium">Ville:</span>
            <span>{getCityName(poi.cityId)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 text-purple-600">📂</span>
            <span className="font-medium">Catégorie:</span>
            <span>{categoryName}</span>
          </div>
          {poi.coordinates && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3">🌍</span>
              <span className="font-medium">Coordonnées:</span>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">
                {poi.coordinates.latitude?.toFixed(4)}, {poi.coordinates.longitude?.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* Rating Info */}
        {(poi.rating || poi.reviewCount) && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{poi.rating || 0}</span>
            <span className="text-xs text-gray-500">({poi.reviewCount || 0} avis)</span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Créé: {new Date(poi.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <StatusBadge
            active={poi.isActive}
            premium={poi.isPremium}
            verified={poi.isVerified}
          />
          <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
        </div>
      </div>
    </div>
  );
}