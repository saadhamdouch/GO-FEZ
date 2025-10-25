'use client';

import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';

interface CircuitCardProps {
  circuit: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  parseLoc: (loc: any) => { name: string; description: string };
}

export function CircuitCard({ circuit, onEdit, onDelete, isDeleting, parseLoc }: CircuitCardProps) {
  const frLoc = parseLoc(circuit.fr);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
      <ImagePreview src={circuit.image} alt={frLoc.name || 'Circuit'} className="w-full h-48" />
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg text-gray-900">{frLoc.name || 'Sans nom'}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{frLoc.description}</p>
        <div className="text-sm text-gray-500 space-y-1">
          <div>📍 <strong>Ville:</strong> {circuit.city?.name || '—'}</div>
          <div>⏱ <strong>Durée:</strong> {circuit.duration}h</div>
          <div>🛣️ <strong>Distance:</strong> {circuit.distance} km</div>
          <div>⭐ <strong>Note:</strong> {circuit.rating ?? '—'} ({circuit.reviewCount ?? 0} avis)</div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {circuit.themes?.map((theme: any) => {
            const themeFr = parseLoc(theme.fr);
            return (
              <span key={theme.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {themeFr.name || 'Thème'}
              </span>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-3">
          <StatusBadge active={circuit.isActive} premium={circuit.isPremium} />
          <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
        </div>
      </div>
    </div>
  );
}