'use client';

import { useState, useEffect } from 'react';
import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { MultipleFileUpload } from '../shared/MultipleFileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import MapSelector from './MapSelector';
import { ImageIcon, Video, Map as Map360, Music, Info, MapPin, Plus, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';

interface POIFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  onFileChange: (file: File, key: string) => void;
  onRemoveFile?: (key: string, index: number) => void;
  files?: Record<string, File[]>;
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
  onRemoveFile,
  files = {},
  categories,
  cities,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedPOI,
}: POIFormProps) {
  const [showMap, setShowMap] = useState(true);
  const [showPracticalInfo, setShowPracticalInfo] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const practicalInfoTemplate = {
    horaires: { checkin: '', checkout: '', reception: '' },
    prix: { chambre_simple: '', chambre_double: '', suite: '', petit_dejeuner: '' },
    services: [''],
    contact: { telephone: '', email: '', site_web: '' },
    equipements: [''],
    politiques: { annulation: '', animaux: '', fumeurs: '' },
    localisation: { proche: [''] },
    langues: [''],
    paiement: [''],
    capacite: { chambres: '', personnes_max: '' },
  };

  const categoriesKeys = Object.keys(practicalInfoTemplate);
  const getCurrentCategoryKey = () => categoriesKeys[currentCategoryIndex];
  const getCurrentFields = () => {
    const parsed = getParsedPracticalInfo();
    const categoryKey = getCurrentCategoryKey();
    return parsed[categoryKey] || practicalInfoTemplate[categoryKey];
  };

  const getParsedPracticalInfo = () => {
    try {
      const parsed = JSON.parse(formData.practicalInfo || '{}');
      return typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };

  const handleFieldChange = (categoryKey: string, fieldKey: string, value: any, index?: number) => {
    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) parsed[categoryKey] = practicalInfoTemplate[categoryKey] || {};

    if (Array.isArray(parsed[categoryKey][fieldKey])) {
      if (index !== undefined) {
        parsed[categoryKey][fieldKey][index] = value;
      }
    } else {
      parsed[categoryKey][fieldKey] = value;
    }

    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
  };

  const handleFieldKeyRename = (categoryKey: string, oldKey: string, newKey: string) => {
    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) return;

    const categoryData = parsed[categoryKey];
    if (!newKey.trim() || newKey === oldKey || categoryData[newKey]) return;

    categoryData[newKey] = categoryData[oldKey];
    delete categoryData[oldKey];

    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
  };

  const handleAddCustomField = (categoryKey: string, key: string, value: string) => {
    if (!key.trim()) return;

    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) parsed[categoryKey] = {};

    if (parsed[categoryKey][key]) {
      alert(`La clé "${key}" existe déjà dans ${categoryKey}`);
      return;
    }

    parsed[categoryKey][key] = value;
    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveField = (categoryKey: string, fieldKey: string) => {
    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) return;

    delete parsed[categoryKey][fieldKey];
    
    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
  };

  const addNextField = () => {
    const fields = Object.keys(getCurrentFields());
    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else if (currentCategoryIndex < categoriesKeys.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentFieldIndex(0);
    }
  };

  const goBackField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else if (currentCategoryIndex > 0) {
      const parsed = getParsedPracticalInfo();
      const prevCategoryKey = categoriesKeys[currentCategoryIndex - 1];
      const prevFields = Object.keys(parsed[prevCategoryKey] || practicalInfoTemplate[prevCategoryKey]);
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      setCurrentFieldIndex(prevFields.length - 1);
    }
  };

  const handleLocalizationChange = (lang: 'fr' | 'ar' | 'en', field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [`${lang}Localization`]: {
        ...formData[`${lang}Localization`],
        [field]: value,
      },
    });
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    onFormDataChange({
      ...formData,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: location.address || formData.address,
    });
  };

  const currentLocation = formData.latitude && formData.longitude
    ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
    : null;

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
              let categoryName = 'Sans nom';
              try {
                if (typeof cat.fr === 'string') {
                  const parsed = JSON.parse(cat.fr);
                  categoryName = parsed.name || categoryName;
                } else if (cat.fr?.name) {
                  categoryName = cat.fr.name;
                }
              } catch {
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Position (Latitude, Longitude)
            <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? 'Masquer la carte' : 'Afficher la carte'}
          </button>
        </div>

        {showMap && (
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <MapSelector
              onLocationSelect={handleLocationSelect}
              selectedLocation={currentLocation}
              height="400px"
            />
          </div>
        )}

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
              readOnly={showMap}
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
              readOnly={showMap}
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
          <MultipleFileUpload
            label="Images"
            accept="image/*"
            files={files.image || []}
            onChange={(file) => onFileChange(file, 'image')}
            onRemove={(index) => onRemoveFile && onRemoveFile('image', index)}
            icon={<ImageIcon className="w-4 h-4" />}
          />
          <MultipleFileUpload
            label="Vidéos"
            accept="video/*"
            files={files.video || []}
            onChange={(file) => onFileChange(file, 'video')}
            onRemove={(index) => onRemoveFile && onRemoveFile('video', index)}
            icon={<Video className="w-4 h-4" />}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Map360 className="w-4 h-4" />
              <span>Lien Visite 360°</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/360tour"
              value={formData.virtualTourUrl || ''}
              onChange={(e) => onFormDataChange({ ...formData, virtualTourUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Entrez un lien vers une visite virtuelle 360° (iframe)
            </p>
          </div>
        </div>
      </div>

      {/* Audio Files */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Guides audio (optionnel)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <MultipleFileUpload
            label="Audio Français"
            accept="audio/*"
            files={files.fr_audio || []}
            onChange={(file) => onFileChange(file, 'fr_audio')}
            onRemove={(index) => onRemoveFile && onRemoveFile('fr_audio', index)}
            icon={<Music className="w-4 h-4" />}
            maxFiles={1}
          />
          <MultipleFileUpload
            label="Audio Arabe"
            accept="audio/*"
            files={files.ar_audio || []}
            onChange={(file) => onFileChange(file, 'ar_audio')}
            onRemove={(index) => onRemoveFile && onRemoveFile('ar_audio', index)}
            icon={<Music className="w-4 h-4" />}
            maxFiles={1}
          />
          <MultipleFileUpload
            label="Audio Anglais"
            accept="audio/*"
            files={files.en_audio || []}
            onChange={(file) => onFileChange(file, 'en_audio')}
            onRemove={(index) => onRemoveFile && onRemoveFile('en_audio', index)}
            icon={<Music className="w-4 h-4" />}
            maxFiles={1}
          />
        </div>
      </div>

      {/* Practical Info Progressive */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowPracticalInfo(!showPracticalInfo)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg flex items-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          {showPracticalInfo ? 'Masquer Infos pratiques' : 'Ajouter Infos pratiques'}
        </button>

        {showPracticalInfo && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-bold text-sm uppercase text-indigo-700">{getCurrentCategoryKey()}</h4>

            {Object.keys(getCurrentFields()).map((fieldKey, idx) => {
              if (idx > currentFieldIndex) return null;
              const parsed = getParsedPracticalInfo();
              const value = parsed?.[getCurrentCategoryKey()]?.[fieldKey] || '';

              return (
                <div key={fieldKey} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fieldKey}
                    onChange={(e) =>
                      handleFieldKeyRename(getCurrentCategoryKey(), fieldKey, e.target.value)
                    }
                    className="w-32 px-2 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleFieldChange(getCurrentCategoryKey(), fieldKey, e.target.value)
                    }
                    className="flex-1 px-2 py-1 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(getCurrentCategoryKey(), fieldKey)}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Add Custom Field */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                placeholder="Nouvelle clé"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                className="w-32 px-2 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-indigo-400 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Nouvelle valeur"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="flex-1 px-2 py-1 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleAddCustomField(getCurrentCategoryKey(), newFieldKey, newFieldValue)}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={goBackField}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-300"
                disabled={currentCategoryIndex === 0 && currentFieldIndex === 0}
              >
                <ChevronLeft className="w-3 h-3" /> Retour
              </button>
              <button
                type="button"
                onClick={addNextField}
                className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-indigo-600"
              >
                Suivant <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary of Practical Info */}
      {showPracticalInfo && Object.keys(getParsedPracticalInfo()).length > 0 && (
        <div className="mt-6 border border-indigo-200 rounded-lg bg-indigo-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSummary(!showSummary)}
            className="w-full px-4 py-3 text-left font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center justify-between"
          >
            <span className="text-sm">Résumé des infos pratiques</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showSummary ? 'rotate-90' : ''}`} />
          </button>
          
          {showSummary && (
            <div className="px-4 pb-4 text-sm text-gray-800 space-y-3">
              {Object.entries(getParsedPracticalInfo()).map(([category, fields]) => (
                <div key={category} className="bg-white p-3 rounded-lg">
                  <p className="font-medium text-indigo-600 mb-2">{category}</p>
                  <ul className="ml-4 space-y-1">
                    {typeof fields === 'object' &&
                      Object.entries(fields).map(([key, value]) => (
                        <li key={key} className="text-xs">
                          <span className="font-semibold">{key}:</span>{' '}
                          {Array.isArray(value) ? value.join(', ') : value || '—'}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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