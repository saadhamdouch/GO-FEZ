'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, Loader2, AlertCircle } from 'lucide-react';
import Modal from './shared/Modal';
import ImagePreview from './shared/ImagePreview';
import SearchBar from './shared/SearchBar';
import { 
  useGetAllCircuitsQuery, 
  useCreateCircuitMutation, 
  useUpdateCircuitMutation, 
  useDeleteCircuitMutation 
} from '@/services/api/CircuitApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { useGetAllPOIsQuery } from '@/services/api/PoiApi';
import { compressImageByType } from '@/utils/imageCompression';
import { toast } from 'sonner';

interface CircuitManagementProps {
  locale?: string;
}

interface CircuitLocalization {
  name: string;
  description: string;
}

interface Circuit {
  id: string;
  ar: CircuitLocalization | string;
  fr: CircuitLocalization | string;
  en: CircuitLocalization | string;
  image: string;
  imagePublicId: string;
  cityId: string;
  duration: number;
  distance: number;
  isPremium: boolean;
  isActive: boolean;
  themes?: Array<{ id: string }>;
  pois?: Array<{ id: string }>;
}

export default function CircuitManagement({ locale = 'fr' }: CircuitManagementProps) {
  // ✅ API Hooks with detailed debugging
  const { 
    data: circuitsData, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    isSuccess,
    isError
  } = useGetAllCircuitsQuery();
  
  const { data: citiesData } = useGetAllCitiesQuery();
  const { data: themesData } = useGetAllThemesQuery();
  const { data: poisData } = useGetAllPOIsQuery();

  const [createCircuit, { isLoading: isCreating }] = useCreateCircuitMutation();
  const [updateCircuit, { isLoading: isUpdating }] = useUpdateCircuitMutation();
  const [deleteCircuit, { isLoading: isDeleting }] = useDeleteCircuitMutation();

  // ✅ DEBUG: Log everything
  useEffect(() => {
    console.log('🔍 Circuit Management Debug:');
    console.log('  - isLoading:', isLoading);
    console.log('  - isFetching:', isFetching);
    console.log('  - isSuccess:', isSuccess);
    console.log('  - isError:', isError);
    console.log('  - circuitsData:', circuitsData);
    console.log('  - error:', error);
    console.log('  - circuits array:', circuitsData?.data);
    console.log('  - circuits length:', circuitsData?.data?.length);
  }, [circuitsData, isLoading, isFetching, isSuccess, isError, error]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cityId: '',
    duration: '',
    distance: '',
    isPremium: false,
    isActive: true,
    themeIds: [] as string[],
    poiIds: [] as string[],
    localizations: {
      fr: { name: '', description: '' },
      ar: { name: '', description: '' },
      en: { name: '', description: '' }
    }
  });

const circuits: Circuit[] = (() => {
  if (circuitsData?.data && Array.isArray(circuitsData.data)) {
    return circuitsData.data;
  }
  if (Array.isArray(circuitsData)) return circuitsData;
  if (circuitsData?.circuits && Array.isArray(circuitsData.circuits)) return circuitsData.circuits;
  return [];
})();

  const cities = citiesData?.data || [];
  const themes = themesData?.data || [];
  const pois = poisData?.pois || [];

const parseLoc = (loc: string | CircuitLocalization): CircuitLocalization => {
  if (typeof loc === 'string') {
    try {
      const cleaned = loc.replace(/^"+|"+$/g, ''); // remove leading/trailing quotes
      const unescaped = cleaned.replace(/\\"/g, '"'); // unescape inner quotes
      return JSON.parse(unescaped);
    } catch (err) {
      console.warn('Failed to parse localization:', loc, err);
      return { name: '', description: '' };
    }
  }
  return loc || { name: '', description: '' };
};



  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageByType(file);
        setImageFile(compressed.file);
        const previewUrl = URL.createObjectURL(compressed.file);
        setImagePreview(previewUrl);
      } catch (error) {
        toast.error('Erreur lors de la compression de l\'image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cityId || !formData.duration || !formData.distance) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!selectedCircuit && !imageFile) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append('data', JSON.stringify(formData));
    if (imageFile) {
      apiFormData.append('image', imageFile);
    }

    try {
      if (selectedCircuit) {
        await updateCircuit({ id: selectedCircuit.id, formData: apiFormData }).unwrap();
        toast.success('Circuit mis à jour avec succès');
      } else {
        await createCircuit(apiFormData).unwrap();
        toast.success('Circuit créé avec succès');
      }
      
      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving circuit:', error);
      toast.error(error?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce circuit ?')) return;

    try {
      await deleteCircuit(id).unwrap();
      toast.success('Circuit supprimé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting circuit:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setSelectedCircuit(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      cityId: '',
      duration: '',
      distance: '',
      isPremium: false,
      isActive: true,
      themeIds: [],
      poiIds: [],
      localizations: {
        fr: { name: '', description: '' },
        ar: { name: '', description: '' },
        en: { name: '', description: '' }
      }
    });
  };

  const handleEdit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setImagePreview(circuit.image);
    setFormData({
      cityId: circuit.cityId,
      duration: String(circuit.duration),
      distance: String(circuit.distance),
      isPremium: circuit.isPremium,
      isActive: circuit.isActive,
      themeIds: circuit.themes?.map((t: any) => t.id) || [],
      poiIds: circuit.pois?.map((p: any) => p.id) || [],
      localizations: {
        fr: parseLoc(circuit.fr),
        ar: parseLoc(circuit.ar),
        en: parseLoc(circuit.en)
      }
    });
    setIsModalOpen(true);
  };

const filteredCircuits = circuits.filter((circuit: Circuit) => {
  if (!searchTerm) return true;
  const frLoc = parseLoc(circuit.fr);
  return frLoc.name?.toLowerCase().includes(searchTerm.toLowerCase());
});

  console.log('🔍 Filtered circuits:', filteredCircuits.length);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Chargement des circuits...</span>
      </div>
    );
  }

  // ✅ Error state with details
  if (error) {
    console.error('❌ Full error object:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-600 font-medium mb-2">Erreur lors du chargement des circuits</p>
            <pre className="text-xs text-red-800 bg-red-100 p-3 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
            <button 
              onClick={() => refetch()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h3 className="font-bold text-blue-900 mb-2">🔍 Debug Info:</h3>
        <div className="grid grid-cols-2 gap-2 text-blue-800">
          <div>Total circuits: <strong>{circuits.length}</strong></div>
          <div>Filtered: <strong>{filteredCircuits.length}</strong></div>
          <div>Loading: <strong>{isLoading ? 'Yes' : 'No'}</strong></div>
          <div>Success: <strong>{isSuccess ? 'Yes' : 'No'}</strong></div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Circuits</h2>
          <p className="text-gray-600 mt-1">{circuits.length} circuit(s) au total</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Circuit</span>
        </button>
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Rechercher un circuit..." 
      />

      {/* Show raw data for debugging */}
      {circuits.length > 0 && (
        <details className="bg-gray-50 border rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            📋 Raw Circuit Data (Click to expand)
          </summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(circuits, null, 2)}
          </pre>
        </details>
      )}

      {filteredCircuits.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">
            {searchTerm ? 'Aucun circuit trouvé' : 'Aucun circuit disponible'}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Raw circuits: {circuits.length} | Filtered: {filteredCircuits.length}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Créer le premier circuit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircuits.map((circuit: Circuit, index: number) => {
            console.log(`🔍 Rendering circuit ${index}:`, circuit);
            const frLoc = parseLoc(circuit.fr);
            return (
<div 
  key={circuit.id} 
  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
>
  <ImagePreview 
    src={circuit.image} 
    alt={frLoc.name || 'Circuit'} 
    className="w-full h-48" 
  />
  <div className="p-4 space-y-2">
    <h3 className="font-bold text-lg text-gray-900">
      {frLoc.name || 'Sans nom'}
    </h3>
    <p className="text-sm text-gray-600 line-clamp-2">
      {frLoc.description}
    </p>

    <div className="text-sm text-gray-500 space-y-1">
      <div>📍 <strong>Ville:</strong> {circuit.city?.name || '—'}</div>
      <div>⏱ <strong>Durée:</strong> {circuit.duration}h</div>
      <div>🛣️ <strong>Distance:</strong> {circuit.distance} km</div>
      <div>⭐ <strong>Note:</strong> {circuit.rating ?? '—'} ({circuit.reviewCount ?? 0} avis)</div>
    </div>

    <div className="flex flex-wrap gap-2 pt-2">
      {circuit.themes?.map((theme, i) => {
        const themeFr = parseLoc(theme.fr);
        return (
          <span 
            key={theme.id} 
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {themeFr.name || 'Thème'}
          </span>
        );
      })}
    </div>

    <div className="flex items-center justify-between pt-3">
      <div className="flex space-x-2">
        {circuit.isActive && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Actif
          </span>
        )}
        {circuit.isPremium && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            Premium
          </span>
        )}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => handleEdit(circuit)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(circuit.id)}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</div>

            );
          })}
        </div>
      )}

      {/* Modal remains the same as before */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCircuit ? 'Modifier le Circuit' : 'Nouveau Circuit'}
        size="max-w-5xl"
      >
        {/* Form content same as before - truncated for brevity */}
        <p className="text-gray-500 p-8 text-center"><form onSubmit={handleSubmit} className="space-y-6"> 
          <div className="grid grid-cols-2 gap-6"> 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label> 
              <select 
                value={formData.cityId} 
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                required 
              > 
                <option value="">Sélectionner une ville</option> 
                {cities.map((city: any) => ( 
                  <option key={city.id} value={city.id}>{city.name}</option> 
                ))} 
              </select> 
            </div> 
 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label> 
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700" 
                required={!selectedCircuit} 
              /> 
              {imagePreview && ( 
                <div className="mt-3"> 
                  <ImagePreview src={imagePreview} alt="Preview" className="w-full h-32" /> 
                </div> 
              )} 
            </div> 
          </div> 
 
          <div className="grid grid-cols-2 gap-6"> 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (heures) *</label> 
              <input 
                type="number" 
                step="0.1" 
                value={formData.duration} 
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                required 
              /> 
            </div> 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km) *</label> 
              <input 
                type="number" 
                step="0.1" 
                value={formData.distance} 
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                required 
              /> 
            </div> 
          </div> 
 
          <div className="grid grid-cols-3 gap-4"> 
            {(['fr', 'ar', 'en'] as const).map((lang) => ( 
              <div key={lang} className="space-y-3 p-4 bg-gray-50 rounded-lg"> 
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2"> 
                  <Globe className="w-4 h-4" /> 
                  <span>{lang === 'fr' ? 'Français' : lang === 'ar' ? 'Arabe' : 'Anglais'}</span> 
                </h4> 
                <input 
                  type="text" 
                  placeholder="Nom *" 
                  value={formData.localizations[lang].name} 
                  onChange={(e) => 
                    setFormData({ 
                      ...formData, 
                      localizations: { 
                        ...formData.localizations, 
                        [lang]: { ...formData.localizations[lang], name: e.target.value } 
                      } 
                    }) 
                  } 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  required 
                /> 
                <textarea 
                  placeholder="Description" 
                  value={formData.localizations[lang].description} 
                  onChange={(e) => 
                    setFormData({ 
                      ...formData, 
                      localizations: { 
                        ...formData.localizations, 
                        [lang]: { ...formData.localizations[lang], description: e.target.value } 
                      } 
                    }) 
                  } 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  rows={3} 
                /> 
              </div> 
            ))} 
          </div> 
 
          <div className="grid grid-cols-2 gap-6"> 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2">Thèmes *</label> 
              <select 
                multiple 
                value={formData.themeIds} 
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    themeIds: Array.from(e.target.selectedOptions, (o) => o.value) 
                  }) 
                } 
                className="w-full px-4 py-2 border rounded-lg h-32" 
                required 
              > 
                {themes.map((theme: any) => ( 
                  <option key={theme.id} value={theme.id}> 
                    {parseLoc(theme.fr).name || 'Sans nom'} 
                  </option> 
                ))} 
              </select> 
            </div> 
 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2">POIs *</label> 
              <select 
                multiple 
                value={formData.poiIds} 
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    poiIds: Array.from(e.target.selectedOptions, (o) => o.value) 
                  }) 
                } 
                className="w-full px-4 py-2 border rounded-lg h-32" 
                required 
              > 
                {pois.map((poi: any) => ( 
                  <option key={poi.id} value={poi.id}> 
                    {poi.frLocalization?.name || `POI ${poi.id.substring(0, 8)}`} 
                  </option> 

                ))} 
              </select> 
            </div> 
          </div> 
 
          <div className="flex items-center space-x-6"> 
            <label className="flex items-center space-x-2 cursor-pointer"> 
              <input 
                type="checkbox" 
                checked={formData.isActive} 
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                className="w-4 h-4 text-indigo-600 rounded" 
              /> 
              <span className="text-sm text-gray-700">Actif</span> 
            </label> 
            <label className="flex items-center space-x-2 cursor-pointer"> 
              <input 
                type="checkbox" 
                checked={formData.isPremium} 
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })} 
                className="w-4 h-4 text-indigo-600 rounded" 
              /> 
              <span className="text-sm text-gray-700">Premium</span> 
            </label> 
          </div> 
 
          <div className="flex justify-end space-x-3 pt-4 border-t"> 
            <button 
              type="button" 
              onClick={() => { 
                setIsModalOpen(false); 
                resetForm(); 
              }} 
              className="px-6 py-2 border rounded-lg hover:bg-gray-50" 
            > 
              Annuler 
            </button> 
            <button 
              type="submit" 
              disabled={isCreating || isUpdating} 
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center space-x-2" 
            > 
              {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />} 
              <span>{selectedCircuit ? 'Mettre à jour' : 'Créer'}</span> 
            </button> 
          </div> 
        </form> </p>
      </Modal>
    </div>
  );
}