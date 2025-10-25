'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, ImageIcon, Video, Map as Map360, Music } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './shared/Modal';
import ImagePreview from './shared/ImagePreview';
import SearchBar from './shared/SearchBar';
import { useGetAllPOIsQuery, useCreatePOIWithFilesMutation, useUpdatePOIMutation, useDeletePOIMutation, type POI } from '@/services/api/PoiApi';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';
import { compressImageByType } from '@/utils/imageCompression';

interface FormData {
  category: string;
  cityId: string;
  latitude: string;
  longitude: string;
  address: string;
  practicalInfo: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  frLocalization: { name: string; description: string; address: string };
  arLocalization: { name: string; description: string; address: string };
  enLocalization: { name: string; description: string; address: string };
}

export default function POIManagement() {
  const { data: poisData, isLoading, refetch } = useGetAllPOIsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();
  const [createPOIWithFiles, { isLoading: isCreating }] = useCreatePOIWithFilesMutation();
  const [updatePOI, { isLoading: isUpdating }] = useUpdatePOIMutation();
  const [deletePOI, { isLoading: isDeleting }] = useDeletePOIMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    category: '',
    cityId: '',
    latitude: '',
    longitude: '',
    address: '',
    practicalInfo: '{}',
    isActive: true,
    isVerified: false,
    isPremium: false,
    frLocalization: { name: '', description: '', address: '' },
    arLocalization: { name: '', description: '', address: '' },
    enLocalization: { name: '', description: '', address: '' }
  });
  const [files, setFiles] = useState<Record<string, File>>({});

  const pois = poisData?.pois || [];
  const categories = categoriesData?.data || [];
  const cities = citiesData?.data || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (key === 'image' && file.type.startsWith('image/')) {
          const compressed = await compressImageByType(file);
          setFiles((prev) => ({ ...prev, [key]: compressed.file }));
        } else {
          setFiles((prev) => ({ ...prev, [key]: file }));
        }
        toast.success('Fichier chargé avec succès');
      } catch (error) {
        toast.error('Erreur lors du chargement du fichier');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.category || !formData.cityId || !formData.latitude || !formData.longitude) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.frLocalization.name || !formData.arLocalization.name || !formData.enLocalization.name) {
      toast.error('Les noms de localisation sont requis');
      return;
    }

    try {
      const apiFormData = new FormData();

      // Coordinates as JSON string
      apiFormData.append(
        "coordinates",
        JSON.stringify({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || ""
        })
      );

      // Category and City
      apiFormData.append("category", formData.category);
      apiFormData.append("cityId", formData.cityId);

      // Optional practicalInfo as JSON string
      if (formData.practicalInfo && formData.practicalInfo !== '{}') {
        apiFormData.append("practicalInfo", formData.practicalInfo);
      }

      // Localizations as JSON strings
      apiFormData.append("arLocalization", JSON.stringify(formData.arLocalization));
      apiFormData.append("frLocalization", JSON.stringify(formData.frLocalization));
      apiFormData.append("enLocalization", JSON.stringify(formData.enLocalization));

      // Files
      if (files.image) apiFormData.append("image", files.image);
      if (files.video) apiFormData.append("video", files.video);
      if (files.virtualTour360) apiFormData.append("virtualTour360", files.virtualTour360);
      if (files.fr_audio) apiFormData.append("fr_audio", files.fr_audio);
      if (files.ar_audio) apiFormData.append("ar_audio", files.ar_audio);
      if (files.en_audio) apiFormData.append("en_audio", files.en_audio);



      if (selectedPOI) {
        await updatePOI({ id: selectedPOI.id, data: apiFormData }).unwrap();
        toast.success('POI mis à jour avec succès');
      } else {
        await createPOIWithFiles(apiFormData).unwrap();
        toast.success('POI créé avec succès');
      }

      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving POI:", error);
      
      if (error?.data?.errors) {
        console.error("Validation errors:", error.data.errors);
        error.data.errors.forEach((err: any) => {
          console.error(`Field: ${err.path || err.param}, Message: ${err.msg}`);
          toast.error(`${err.path || err.param}: ${err.msg}`);
        });
      } else {
        toast.error(error?.data?.message || 'Erreur lors de l\'enregistrement');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce POI ?')) return;

    try {
      await deletePOI(id).unwrap();
      toast.success('POI supprimé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting POI:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setSelectedPOI(null);
    setFormData({
      category: '',
      cityId: '',
      latitude: '',
      longitude: '',
      address: '',
      practicalInfo: '{}',
      isActive: true,
      isVerified: false,
      isPremium: false,
      frLocalization: { name: '', description: '', address: '' },
      arLocalization: { name: '', description: '', address: '' },
      enLocalization: { name: '', description: '', address: '' }
    });
    setFiles({});
  };

  const filteredPOIs = pois.filter((poi: POI) =>
    poi.frLocalization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Points d'Intérêt</h2>
          <p className="text-gray-600 mt-1">{pois.length} POI(s) au total</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau POI</span>
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher un POI..."
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      ) : filteredPOIs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Map360 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun POI trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPOIs.map((poi: POI) => (
            <div
              key={poi.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
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
                  <div className="flex space-x-2">
                    {poi.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Actif
                      </span>
                    )}
                    {poi.isPremium && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedPOI(poi);
                        setFormData({
                          category: poi.category,
                          cityId: poi.cityId,
                          latitude: String(poi.coordinates.latitude),
                          longitude: String(poi.coordinates.longitude),
                          address: poi.coordinates.address || '',
                          practicalInfo: JSON.stringify(poi.practicalInfo || {}),
                          isActive: poi.isActive,
                          isVerified: poi.isVerified,
                          isPremium: poi.isPremium,
                          frLocalization: poi.frLocalization || { name: '', description: '', address: '' },
                          arLocalization: poi.arLocalization || { name: '', description: '', address: '' },
                          enLocalization: poi.enLocalization || { name: '', description: '', address: '' }
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(poi.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPOI ? 'Modifier le POI' : 'Nouveau POI'}
        size="max-w-6xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner</option>
                {cities.map((city: any) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  value={formData[`${lang}Localization`].name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`${lang}Localization`]: {
                        ...formData[`${lang}Localization`],
                        name: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData[`${lang}Localization`].description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`${lang}Localization`]: {
                        ...formData[`${lang}Localization`],
                        description: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-gray-400" />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, `${lang}_audio`)}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Vidéo</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Map360 className="w-4 h-4" />
                <span>Visite 360°</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'virtualTour360')}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Actif</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Vérifié</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Premium</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isCreating || isUpdating ? 'En cours...' : selectedPOI ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}