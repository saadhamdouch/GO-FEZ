'use client';

import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { FileUpload } from '../shared/FileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { ImageIcon, Video,  Map as Map360, Music, Info } from 'lucide-react';

interface POIFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  onFileChange: (file: File, key: string) => void;
  categories: any[];
  cities: any[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedPOI: any;
}

export function POIForm({
  formData,
  onFormDataChange,
  onFileChange,
  categories,
  cities,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedPOI,
}: POIFormProps) {
  const handleLocalizationChange = (lang: 'fr' | 'ar' | 'en', field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [`${lang}Localization`]: {
        ...formData[`${lang}Localization`],
        [field]: value,
      },
    });
  };

  const localizationFields = [
    { key: 'name', label: 'Nom', type: 'input' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
    { key: 'address', label: 'Adresse', type: 'input' as const },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Information importante:</p>
          <p>Les localisations seront gérées directement par le backend. Remplissez tous les champs requis pour créer un POI complet.</p>
        </div>
      </div>

      {/* Category and City */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Catégorie" required>
          <select
            value={formData.category}
            onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner</option>
            {categories.map((cat: any) => {
              // Parse category localization
              let categoryName = 'Sans nom';
              try {
                if (typeof cat.fr === 'string') {
                  const parsed = JSON.parse(cat.fr);
                  categoryName = parsed.name || categoryName;
                } else if (cat.fr?.name) {
                  categoryName = cat.fr.name;
                }
              } catch (e) {
                categoryName = cat.fr || 'Sans nom';
              }
              
              return (
                <option key={cat.id} value={cat.id}>
                  {categoryName}
                </option>
              );
            })}
          </select>
        </FormField>

        <FormField label="Ville" required>
          <select
            value={formData.cityId}
            onChange={(e) => onFormDataChange({ ...formData, cityId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner</option>
            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Latitude" required>
          <input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            placeholder="34.0626"
          />
        </FormField>

        <FormField label="Longitude" required>
          <input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => onFormDataChange({ ...formData, longitude: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            placeholder="-5.0077"
          />
        </FormField>

        <FormField label="Adresse">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Rue principale"
          />
        </FormField>
      </div>

      {/* Localized Inputs */}
      <LocalizedInputs
        localizations={{
          fr: formData.frLocalization,
          ar: formData.arLocalization,
          en: formData.enLocalization,
        }}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      {/* Media Files */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Fichiers multimédias</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <FileUpload
            label="Image principale"
            accept="image/*"
            onChange={(file) => onFileChange(file, 'image')}
            icon={<ImageIcon className="w-4 h-4" />}
          />

          <FileUpload
            label="Vidéo"
            accept="video/*"
            onChange={(file) => onFileChange(file, 'video')}
            icon={<Video className="w-4 h-4" />}
          />

          <FileUpload
            label="Visite 360°"
            accept="video/*"
            onChange={(file) => onFileChange(file, 'virtualTour360')}
            icon={<Map360 className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Audio Files */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Guides audio (optionnel)
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <FileUpload
            label="Audio Français"
            accept="audio/*"
            onChange={(file) => onFileChange(file, 'fr_audio')}
            icon={<Music className="w-4 h-4" />}
          />

          <FileUpload
            label="Audio Arabe"
            accept="audio/*"
            onChange={(file) => onFileChange(file, 'ar_audio')}
            icon={<Music className="w-4 h-4" />}
          />

          <FileUpload
            label="Audio Anglais"
            accept="audio/*"
            onChange={(file) => onFileChange(file, 'en_audio')}
            icon={<Music className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Practical Info (Optional) */}
      <FormField label="Informations pratiques (JSON)">
        <textarea
          value={formData.practicalInfo}
          onChange={(e) => onFormDataChange({ ...formData, practicalInfo: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
          rows={3}
          placeholder='{"horaires": "9h-18h", "tarif": "50 MAD"}'
        />
        <p className="text-xs text-gray-500 mt-1">Format JSON - Exemple: {`{"horaires": "9h-18h", "prix": "gratuit"}`}</p>
      </FormField>

      {/* Status Checkboxes */}
      <div className="flex items-center space-x-6 pt-4 border-t">
        <Checkbox
          label="Actif"
          checked={formData.isActive}
          onChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
        />
        <Checkbox
          label="Vérifié"
          checked={formData.isVerified}
          onChange={(checked) => onFormDataChange({ ...formData, isVerified: checked })}
        />
        <Checkbox
          label="Premium"
          checked={formData.isPremium}
          onChange={(checked) => onFormDataChange({ ...formData, isPremium: checked })}
        />
      </div>

      {/* Form Actions */}
      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} isEdit={!!selectedPOI} />
    </form>
  );
}