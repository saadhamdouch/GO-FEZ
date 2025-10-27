'use client';

import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { MapPin, Globe } from 'lucide-react';

interface CityCardProps {
  city: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function CityCard({ city, onEdit, onDelete, isDeleting }: CityCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
      <ImagePreview 
        src={city.image} 
        alt={city.name || 'Ville'} 
        className="w-full h-48" 
      />
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{city.name || 'Sans nom'}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>{city.country}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          {/* Noms multilingues */}
          <div className="bg-gray-50 p-2 rounded">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <strong className="text-gray-700">FR:</strong>
                <p className="truncate">{city.name}</p>
              </div>
              <div>
                <strong className="text-gray-700">AR:</strong>
                <p className="truncate">{city.nameAr}</p>
              </div>
              <div>
                <strong className="text-gray-700">EN:</strong>
                <p className="truncate">{city.nameEn}</p>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          {city.coordinates && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                  <strong>Lat:</strong> {city.coordinates.latitude?.toFixed(4)}{' '}
                  <strong>Lng:</strong> {city.coordinates.longitude?.toFixed(4)}
                </div>
                {city.coordinates.address && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {city.coordinates.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rayon */}
          <div className="flex items-center gap-2">
            <span>📍</span>
            <strong>Rayon:</strong>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
              {city.radius} km
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <StatusBadge active={city.isActive} />
          <ActionButtons 
            onEdit={onEdit} 
            onDelete={onDelete} 
            isDeleting={isDeleting} 
          />
        </div>
      </div>
    </div>
  );
}