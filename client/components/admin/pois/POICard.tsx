'use client';

import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { Map360 } from 'lucide-react';

interface POICardProps {
  poi: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function POICard({ poi, onEdit, onDelete, isDeleting }: POICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      <ImagePreview
        src={poi.poiFile?.image}
        alt={poi.frLocalization?.name || 'POI'}
        className="w-full h-48"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">
          {poi.frLocalization?.name || 'Sans nom'}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {poi.frLocalization?.description}
        </p>
        <div className="flex items-center justify-between">
          <StatusBadge active={poi.isActive} premium={poi.isPremium} verified={poi.isVerified} />
          <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
        </div>
      </div>
    </div>
  );
}