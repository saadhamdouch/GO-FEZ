'use client';

import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { FileUpload } from '../shared/FileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { ImageIcon, Video, Map360, Music } from 'lucide-react';

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
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Catégorie" required>
          <select
            value={formData.category}
            onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.fr?.name || cat.fr}
              </option>
            ))}
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

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Latitude" required>
          <input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
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
          />
        </FormField>

        <FormField label="Adresse">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </FormField>
      </div>

      <LocalizedInputs
        localizations={{
          fr: formData.frLocalization,
          ar: formData.arLocalization,
          en: formData.enLocalization,
        }}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      <div className="grid grid-cols-3 gap-4">
        <FileUpload
          label="Image"
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

      <div className="flex items-center space-x-6">
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

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} isEdit={!!selectedPOI} />
    </form>
  );
}