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

  const handleFileChange = async (file: File, key: string) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      apiFormData.append(
        'coordinates',
        JSON.stringify({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || '',
        })
      );
      apiFormData.append('category', formData.category);
      apiFormData.append('cityId', formData.cityId);

      if (formData.practicalInfo && formData.practicalInfo !== '{}') {
        apiFormData.append('practicalInfo', formData.practicalInfo);
      }

      apiFormData.append('arLocalization', JSON.stringify(formData.arLocalization));
      apiFormData.append('frLocalization', JSON.stringify(formData.frLocalization));
      apiFormData.append('enLocalization', JSON.stringify(formData.enLocalization));

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
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
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
      practicalInfo: JSON.stringify(poi.practicalInfo || {}),
      isActive: poi.isActive,
      isVerified: poi.isVerified,
      isPremium: poi.isPremium,
      frLocalization: poi.frLocalization || { name: '', description: '', address: '' },
      arLocalization: poi.arLocalization || { name: '', description: '', address: '' },
      enLocalization: poi.enLocalization || { name: '', description: '', address: '' },
    });
    setIsModalOpen(true);
  };

  const filteredPOIs = pois.filter((poi: POI) =>
    poi.frLocalization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  };
}