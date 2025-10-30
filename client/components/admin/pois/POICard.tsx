'use client';

import { useState } from 'react';
import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { MapPin, Calendar, Star, Video, Music, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';

interface POICardProps {
  poi: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  getCategoryName: (categoryId: string) => string;
  getCityName: (cityId: string) => string;
}

export function POICard({ poi, onEdit, onDelete, isDeleting, getCategoryName, getCityName }: POICardProps) {
  const [showModal, setShowModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

  // Parse practical info
  const getPracticalInfo = () => {
    try {
      return JSON.parse(poi.practicalInfo || '{}');
    } catch {
      return {};
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
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
                <span className="w-3 h-3">🌐</span>
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

          {/* Show Details Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Voir tous les détails
          </button>

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <h2 className="text-2xl font-bold">{getName()}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations de base</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Catégorie</label>
                    <p className="text-gray-900">{categoryName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ville</label>
                    <p className="text-gray-900">{getCityName(poi.cityId)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Latitude</label>
                    <p className="text-gray-900">{poi.coordinates?.latitude?.toFixed(6) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Longitude</label>
                    <p className="text-gray-900">{poi.coordinates?.longitude?.toFixed(6) || 'N/A'}</p>
                  </div>
                  {poi.frLocalization?.address && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">Adresse</label>
                      <p className="text-gray-900">{poi.frLocalization.address}</p>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex gap-2">
                  {poi.isActive && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Actif
                    </span>
                  )}
                  {poi.isPremium && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      Premium
                    </span>
                  )}
                  {poi.isVerified && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Vérifié
                    </span>
                  )}
                </div>
              </div>

              {/* Localizations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Localisations</h3>
                
                {/* French */}
                {poi.frLocalization && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      🇫🇷 Français
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Nom:</span>
                        <p className="text-gray-900">{poi.frLocalization.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="text-gray-900">{poi.frLocalization.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Arabic */}
                {poi.arLocalization && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      🇲🇦 العربية
                    </h4>
                    <div className="space-y-2 text-sm" dir="rtl">
                      <div>
                        <span className="font-medium text-gray-700">الاسم:</span>
                        <p className="text-gray-900">{poi.arLocalization.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">الوصف:</span>
                        <p className="text-gray-900">{poi.arLocalization.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* English */}
                {poi.enLocalization && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      🇬🇧 English
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <p className="text-gray-900">{poi.enLocalization.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="text-gray-900">{poi.enLocalization.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Files */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fichiers multimédias</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {poi.poiFile?.image && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                        📷 Images
                      </label>
                      <img
                        src={poi.poiFile.image}
                        alt="POI"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {hasVideo && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4" /> Vidéo
                      </label>
                      <div className="bg-red-50 p-4 rounded-lg text-center text-red-700 text-sm">
                        Vidéo disponible
                      </div>
                    </div>
                  )}
                  
                  {has360Tour && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                        🌐 Visite 360°
                      </label>
                      <div className="bg-blue-50 p-4 rounded-lg text-center text-blue-700 text-sm">
                        Visite virtuelle disponible
                      </div>
                    </div>
                  )}

                  {hasAudio && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                        <Music className="w-4 h-4" /> Guides audio
                      </label>
                      <div className="flex gap-2">
                        {poi.frLocalization?.audioFiles && (
                          <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            🇫🇷 Français
                          </span>
                        )}
                        {poi.arLocalization?.audioFiles && (
                          <span className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs">
                            🇲🇦 العربية
                          </span>
                        )}
                        {poi.enLocalization?.audioFiles && (
                          <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs">
                            🇬🇧 English
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Practical Info */}
              {Object.keys(getPracticalInfo()).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations pratiques</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(getPracticalInfo()).map(([category, fields]) => (
                      <div key={category} className="border border-indigo-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection(category)}
                          className="w-full px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-between text-left"
                        >
                          <span className="font-semibold text-indigo-900 capitalize">{category}</span>
                          {expandedSections[category] ? (
                            <ChevronUp className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                        
                        {expandedSections[category] && (
                          <div className="p-4 bg-white space-y-2">
                            {typeof fields === 'object' &&
                              Object.entries(fields).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 text-sm">
                                  <span className="font-medium text-gray-700 min-w-[120px]">{key}:</span>
                                  <span className="text-gray-900">
                                    {Array.isArray(value) ? value.join(', ') : value || '—'}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dates</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">Créé le</label>
                    <p className="text-gray-900">
                      {new Date(poi.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {poi.updated_at && (
                    <div>
                      <label className="font-medium text-gray-600">Modifié le</label>
                      <p className="text-gray-900">
                        {new Date(poi.updated_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  onEdit();
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}