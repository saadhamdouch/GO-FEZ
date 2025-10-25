'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetAllCircuitsQuery,
  useCreateCircuitMutation,
  useUpdateCircuitMutation,
  useDeleteCircuitMutation,
  type Circuit,
} from '@/services/api/CircuitApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { useGetAllPOIsQuery } from '@/services/api/PoiApi';
import { compressImageByType } from '@/utils/imageCompression';

interface CircuitFormData {
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
}

const initialFormData: CircuitFormData = {
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
    en: { name: '', description: '' },
  },
};

export function useCircuitManagement() {
  const { data: circuitsData, isLoading, error, refetch } = useGetAllCircuitsQuery();
  const { data: citiesData } = useGetAllCitiesQuery();
  const { data: themesData } = useGetAllThemesQuery();
  const { data: poisData } = useGetAllPOIsQuery();
  const [createCircuit, { isLoading: isCreating }] = useCreateCircuitMutation();
  const [updateCircuit, { isLoading: isUpdating }] = useUpdateCircuitMutation();
  const [deleteCircuit, { isLoading: isDeleting }] = useDeleteCircuitMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CircuitFormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const circuits = circuitsData?.data || [];
  const cities = citiesData?.data || [];
  const themes = themesData?.data || [];
  const pois = poisData?.pois || [];

  const parseLoc = (loc: string | any): { name: string; description: string } => {
    if (typeof loc === 'string') {
      try {
        const cleaned = loc.replace(/^"+|"+$/g, '');
        const unescaped = cleaned.replace(/\\"/g, '"');
        return JSON.parse(unescaped);
      } catch (err) {
        console.warn('Failed to parse localization:', loc, err);
        return { name: '', description: '' };
      }
    }
    return loc || { name: '', description: '' };
  };

  const handleImageChange = async (file: File) => {
    try {
      const compressed = await compressImageByType(file);
      setImageFile(compressed.file);
      const previewUrl = URL.createObjectURL(compressed.file);
      setImagePreview(previewUrl);
    } catch (error) {
      toast.error("Erreur lors de la compression de l'image");
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
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
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
    setFormData(initialFormData);
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
        en: parseLoc(circuit.en),
      },
    });
    setIsModalOpen(true);
  };

  const filteredCircuits = circuits.filter((circuit: Circuit) => {
    if (!searchTerm) return true;
    const frLoc = parseLoc(circuit.fr);
    return frLoc.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return {
    circuits: filteredCircuits,
    cities,
    themes,
    pois,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCircuit,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    imagePreview,
    isCreating,
    isUpdating,
    isDeleting,
    parseLoc,
    handleImageChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
  };
}