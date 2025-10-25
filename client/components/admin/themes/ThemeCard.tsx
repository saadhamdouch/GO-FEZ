'use client';

import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';

interface ThemeCardProps {
  theme: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  parseLoc: (loc: any) => { name: string; desc: string };
}

export function ThemeCard({ theme, onEdit, onDelete, isDeleting, parseLoc }: ThemeCardProps) {
  const frLoc = parseLoc(theme.fr);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="relative">
        <ImagePreview src={theme.image} alt={frLoc.name || 'Thème'} className="w-full h-40" />
        <div
          className="absolute top-3 left-3 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center"
          style={{ backgroundColor: theme.color }}
        >
          {theme.icon && (
            <img
              src={cloudinaryLoader({ src: theme.icon, width: 48, height: 48, quality: 90 })}
              alt="icon"
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{frLoc.name || 'Sans nom'}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{frLoc.desc}</p>
        <div className="flex items-center justify-between">
          <StatusBadge
            active={theme.isActive}
            count={theme.circuitsCount}
            countLabel="circuits"
          />
          <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
        </div>
      </div>
    </div>
  );
}