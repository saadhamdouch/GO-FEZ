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
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900">{frLoc.name || 'Sans nom'}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{frLoc.description}</p>
        
        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <strong>Ville:</strong> 
            <span>{circuit.city?.name || '—'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>⏱</span>
            <strong>Durée:</strong> 
            <span>{circuit.duration}h</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>🛣️</span>
            <strong>Distance:</strong> 
            <span>{circuit.distance} km</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <strong>Note:</strong> 
            <span>{circuit.rating ?? '—'} ({circuit.reviewCount ?? 0} avis)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>📍</span>
            <strong>POIs:</strong> 
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
              {circuit.pois?.length || 0}
            </span>
          </div>
          
          {circuit.price && (
            <div className="flex items-center gap-2">
              <span>💰</span>
              <strong>Prix:</strong> 
              <span>{circuit.price} MAD</span>
            </div>
          )}
          
          {(circuit.startPoint || circuit.endPoint) && (
            <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
              {circuit.startPoint && (
                <div><strong>Départ:</strong> {circuit.startPoint}</div>
              )}
              {circuit.endPoint && (
                <div><strong>Arrivée:</strong> {circuit.endPoint}</div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {circuit.themes?.map((theme: any) => {
            const themeFr = parseLoc(theme.fr);
            return (
              <span key={theme.id} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                {themeFr.name || 'Thème'}
              </span>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <StatusBadge active={circuit.isActive} premium={circuit.isPremium} />
          <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
        </div>
      </div>
    </div>
  );
}