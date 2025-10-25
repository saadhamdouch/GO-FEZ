'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetAllPOIsQuery,
  useCreatePOIWithFilesMutation,
  useUpdatePOIMutation,
  useDeletePOIMutation,
  type POI,
} from '@/services/api/PoiApi';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';
import { compressImageByType } from '@/utils/imageCompression';

interface POIFormData {
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

const initialFormData: POIFormData = {
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
  enLocalization: { name: '', description: '', address: '' },
};

export function usePOIManagement() {
  const { data: poisData, isLoading, error, refetch } = useGetAllPOIsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();
  const [createPOIWithFiles, { isLoading: isCreating }] = useCreatePOIWithFilesMutation();
  const [updatePOI, { isLoading: isUpdating }] = useUpdatePOIMutation();
  const [deletePOI, { isLoading: isDeleting }] = useDeletePOIMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<POIFormData>(initialFormData);
  const [files, setFiles] = useState<Record<string, File>>({});

  const pois = poisData?.pois || [];
  const categories = categoriesData?.data || [];
  const cities = citiesData?.data || [];

  // Helper functions
// Helper functions
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c: any) => c.id === categoryId);
    if (!category) return 'Non catégorisé';
    
    try {
      // Try to parse the fr field if it's a string
      if (typeof category.fr === 'string') {
        const parsed = JSON.parse(category.fr);
        return parsed.name || 'Sans nom';
      }
      // If it's already an object
      if (category.fr && typeof category.fr === 'object') {
        return category.fr.name || 'Sans nom';
      }
      // Fallback to other languages
      if (category.en && typeof category.en === 'object') {
        return category.en.name || 'Sans nom';
      }
      if (category.ar && typeof category.ar === 'object') {
        return category.ar.name || 'Sans nom';
      }
      return 'Sans nom';
    } catch (e) {
      console.error('Error parsing category name:', e);
      return category.fr || category.en || category.ar || 'Sans nom';
    }
  };

  const getCityName = (cityId: string): string => {
    const city = cities.find((c: any) => c.id === cityId);
    return city?.name || 'Inconnue';
  };

  const handleFileChange = async (file: File, key: string) => {
    try {
      if (key === 'image' && file.type.startsWith('image/')) {
        const compressed = await compressImageByType(file);
        setFiles((prev) => ({ ...prev, [key]: compressed.file }));
        toast.success('Image compressée avec succès');
      } else {
        setFiles((prev) => ({ ...prev, [key]: file }));
        toast.success('Fichier chargé avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du fichier');
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
      toast.error('Les noms de localisation sont requis dans les trois langues');
      return;
    }

    // Validate JSON for practicalInfo
    if (formData.practicalInfo && formData.practicalInfo !== '{}') {
      try {
        JSON.parse(formData.practicalInfo);
      } catch (e) {
        toast.error('Format JSON invalide pour les informations pratiques');
        return;
      }
    }

    try {
      const apiFormData = new FormData();
      
      // Coordinates
      apiFormData.append(
        'coordinates',
        JSON.stringify({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || '',
        })
      );

      // Basic fields
      apiFormData.append('category', formData.category);
      apiFormData.append('cityId', formData.cityId);

      // Practical info
      if (formData.practicalInfo && formData.practicalInfo !== '{}') {
        apiFormData.append('practicalInfo', formData.practicalInfo);
      }

      // Localizations
      apiFormData.append('arLocalization', JSON.stringify(formData.arLocalization));
      apiFormData.append('frLocalization', JSON.stringify(formData.frLocalization));
      apiFormData.append('enLocalization', JSON.stringify(formData.enLocalization));

      // Files
      Object.entries(files).forEach(([key, file]) => {
        apiFormData.append(key, file);
      });

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
      console.error('Error saving POI:', error);
      
      if (error?.data?.errors) {
        console.error('Validation errors:', error.data.errors);
        error.data.errors.forEach((err: any) => {
          toast.error(`${err.path || err.param}: ${err.msg}`);
        });
      } else {
        toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
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
    setFormData(initialFormData);
    setFiles({});
  };

  const handleEdit = (poi: POI) => {
    setSelectedPOI(poi);
    setFormData({
      category: poi.category,
      cityId: poi.cityId,
      latitude: String(poi.coordinates.latitude),
      longitude: String(poi.coordinates.longitude),
      address: poi.coordinates.address || '',
      practicalInfo: JSON.stringify(poi.practicalInfo || {}, null, 2),
      isActive: poi.isActive,
      isVerified: poi.isVerified,
      isPremium: poi.isPremium,
      frLocalization: poi.frLocalization || { name: '', description: '', address: '' },
      arLocalization: poi.arLocalization || { name: '', description: '', address: '' },
      enLocalization: poi.enLocalization || { name: '', description: '', address: '' },
    });
    setIsModalOpen(true);
  };

  const filteredPOIs = pois.filter((poi: POI) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      poi.frLocalization?.name?.toLowerCase().includes(searchLower) ||
      poi.arLocalization?.name?.toLowerCase().includes(searchLower) ||
      poi.enLocalization?.name?.toLowerCase().includes(searchLower) ||
      getCategoryName(poi.category).toLowerCase().includes(searchLower) ||
      getCityName(poi.cityId).toLowerCase().includes(searchLower)
    );
  });

  return {
    pois: filteredPOIs,
    categories,
    cities,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedPOI,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    isCreating,
    isUpdating,
    isDeleting,
    handleFileChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
    getCategoryName,
    getCityName,
  };
}