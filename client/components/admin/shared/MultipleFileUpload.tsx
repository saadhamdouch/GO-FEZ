'use client';

import { useRef, useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';

interface MultipleFileUploadProps {
  label: string;
  accept?: string;
  files: File[];
  onChange: (file: File) => void;
  onRemove: (index: number) => void;
  icon?: React.ReactNode;
  maxFiles?: number;
}

export function MultipleFileUpload({
  label,
  accept = 'image/*',
  files,
  onChange,
  onRemove,
  icon,
  maxFiles = 10,
}: MultipleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && files.length < maxFiles) {
      onChange(file);
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
        {icon || <Upload className="w-4 h-4" />}
        <span>{label}</span>
        <span className="text-xs text-gray-500">
          ({files.length}/{maxFiles})
        </span>
      </label>

      {/* Zone d'upload */}
      <button
        type="button"
        onClick={handleClick}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
        disabled={files.length >= maxFiles}
      >
        <Plus className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          {files.length >= maxFiles ? 'Limite atteinte' : 'Ajouter un fichier'}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={files.length >= maxFiles}
      />

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

