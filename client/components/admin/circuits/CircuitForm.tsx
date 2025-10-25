'use client';

import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { FileUpload } from '../shared/FileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { ImageIcon } from 'lucide-react';

interface CircuitFormProps {
  formData: {
    cityId: string;
    duration: string;
    distance: string;
    isPremium: boolean;
    isActive: boolean;
    themeIds: string[];
    poiIds: string[];
    localizations: {
      fr: { name: string; description: string };
      ar: { name: string; description: string };
      en: { name: string; description: string };
    };
  };
  onFormDataChange: (data: any) => void;
  onImageChange: (file: File) => void;
  imagePreview: string | null;
  cities: any[];
  themes: any[];
  pois: any[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedCircuit: any;
  parseLoc: (loc: any) => { name: string; description: string };
}

export function CircuitForm({
  formData,
  onFormDataChange,
  onImageChange,
  imagePreview,
  cities,
  themes,
  pois,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedCircuit,
  parseLoc,
}: CircuitFormProps) {
  const handleLocalizationChange = (
    lang: 'fr' | 'ar' | 'en',
    field: string,
    value: string
  ) => {
    onFormDataChange({
      ...formData,
      localizations: {
        ...formData.localizations,
        [lang]: {
          ...formData.localizations[lang],
          [field]: value,
        },
      },
    });
  };

  const localizationFields = [
    { key: 'name', label: 'Nom', type: 'input' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* City and Image Section */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Ville" required>
          <select
            value={formData.cityId}
            onChange={(e) => onFormDataChange({ ...formData, cityId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner une ville</option>
            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </FormField>

        <FileUpload
          label="Image"
          accept="image/*"
          preview={imagePreview || selectedCircuit?.image}
          required={!selectedCircuit}
          onChange={onImageChange}
          icon={<ImageIcon className="w-4 h-4" />}
        />
      </div>

      {/* Duration and Distance Section */}
{/* Duration, Distance, Price Section */}
      <div className="grid grid-cols-3 gap-6">
        <FormField label="Durée (heures)" required>
          <input
            type="number"
            step="0.1"
            value={formData.duration}
            onChange={(e) => onFormDataChange({ ...formData, duration: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            placeholder="Ex: 2.5"
          />
        </FormField>
        <FormField label="Distance (km)" required>
          <input
            type="number"
            step="0.1"
            value={formData.distance}
            onChange={(e) => onFormDataChange({ ...formData, distance: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            placeholder="Ex: 5.3"
          />
        </FormField>
        <FormField label="Prix (MAD)">
          <input
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ex: 150.00"
          />
        </FormField>
      </div>

      {/* Start/End Points Section */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Point de départ">
          <select
            value={formData.startPoint || ''}
            onChange={(e) => onFormDataChange({ ...formData, startPoint: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Sélectionner un POI</option>
            {pois.map((poi: any) => (
              <option key={poi.id} value={poi.id}>
                {poi.frLocalization?.name || `POI ${poi.id.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Point d'arrivée">
          <select
            value={formData.endPoint || ''}
            onChange={(e) => onFormDataChange({ ...formData, endPoint: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Sélectionner un POI</option>
            {pois.map((poi: any) => (
              <option key={poi.id} value={poi.id}>
                {poi.frLocalization?.name || `POI ${poi.id.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Localized Inputs Section */}
      <LocalizedInputs
        localizations={formData.localizations}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      {/* Themes and POIs Selection Section */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Thèmes" required>
          <select
            multiple
            value={formData.themeIds}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                themeIds: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
            className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            {themes.map((theme: any) => (
              <option key={theme.id} value={theme.id}>
                {parseLoc(theme.fr).name || 'Sans nom'}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs thèmes
          </p>
        </FormField>

        <FormField label="POIs" required>
          <select
            multiple
            value={formData.poiIds}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                poiIds: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
            className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            {pois.map((poi: any) => (
              <option key={poi.id} value={poi.id}>
                {poi.frLocalization?.name || `POI ${poi.id.substring(0, 8)}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs POIs
          </p>
        </FormField>
      </div>

      {/* Selected Items Display */}
      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Thèmes sélectionnés ({formData.themeIds.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.themeIds.map((themeId) => {
              const theme = themes.find((t) => t.id === themeId);
              if (!theme) return null;
              return (
                <span
                  key={themeId}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                >
                  {parseLoc(theme.fr).name || 'Sans nom'}
                </span>
              );
            })}
            {formData.themeIds.length === 0 && (
              <span className="text-xs text-gray-400">Aucun thème sélectionné</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            POIs sélectionnés ({formData.poiIds.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.poiIds.map((poiId) => {
              const poi = pois.find((p) => p.id === poiId);
              if (!poi) return null;
              return (
                <span
                  key={poiId}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {poi.frLocalization?.name || `POI ${poiId.substring(0, 8)}`}
                </span>
              );
            })}
            {formData.poiIds.length === 0 && (
              <span className="text-xs text-gray-400">Aucun POI sélectionné</span>
            )}
          </div>
        </div>
      </div>

      {/* Checkboxes Section */}
      <div className="flex items-center space-x-6">
        <Checkbox
          label="Actif"
          checked={formData.isActive}
          onChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
        />
        <Checkbox
          label="Premium"
          checked={formData.isPremium}
          onChange={(checked) => onFormDataChange({ ...formData, isPremium: checked })}
        />
      </div>

      {/* Form Actions */}
      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} isEdit={!!selectedCircuit} />
    </form>
  );
}