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
  virtualTourUrl: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  frLocalization: {
    name: string;
    description: string;
    address: string;
  };
  arLocalization: {
    name: string;
    description: string;
    address: string;
  };
  enLocalization: {
    name: string;
    description: string;
    address: string;
  };
  filesToRemove?: string[];
}

const initialFormData: POIFormData = {
  category: '',
  cityId: '',
  latitude: '',
  longitude: '',
  address: '',
  practicalInfo: '{}',
  virtualTourUrl: '',
  isActive: true,
  isVerified: false,
  isPremium: false,
  frLocalization: { name: '', description: '', address: '' },
  arLocalization: { name: '', description: '', address: '' },
  enLocalization: { name: '', description: '', address: '' },
  filesToRemove: [], 
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
  const [files, setFiles] = useState<Record<string, File[]>>({});

  const pois = poisData?.pois || [];
  const categories = categoriesData?.data || [];
  const cities = citiesData?.data || [];

const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c: any) => c.id === categoryId);
    if (!category) return 'Non catégorisé';

    // Helper pour extraire le nom, gère string, {name: string} et JSON stringifié
    const parseCategoryName = (langField: any): string | null => {
      if (!langField) return null;

      // Cas 1: C'est déjà un objet { name: "..." }
      if (typeof langField === 'object' && langField.name) {
        return langField.name;
      }

      // Cas 2: C'est une chaîne de caractères
      if (typeof langField === 'string') {
        try {
          // On tente un premier parse (pour "{\"name\":\"test\"}")
          let parsed = JSON.parse(langField);

          // Cas 3: C'est une chaîne "double-encodée" ("\"{\\\"name\\\":\\\"test\\\"}\"")
          // Le premier parse aura donné une *nouvelle* chaîne : "{\"name\":\"test\"}"
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed); // On parse une deuxième fois
          }
          
          // Si on a un objet avec un 'name', on le retourne
          if (typeof parsed === 'object' && parsed.name) {
            return parsed.name;
          }

        } catch (e) {
          // Si le parsing échoue, c'est une chaîne simple comme "Histoire"
          if (langField.trim()) {
            return langField;
          }
        }
      }
      return null;
    };

    // On essaie le français, puis l'anglais, puis l'arabe
    const frName = parseCategoryName(category.fr);
    if (frName) return frName;

    const enName = parseCategoryName(category.en);
    if (enName) return enName;

    const arName = parseCategoryName(category.ar);
    if (arName) return arName;

    // Fallback
    return 'Sans nom';
  };


  // Helper pour récupérer le nom de ville
  const getCityName = (cityId: string): string => {
    const city = cities.find((c: any) => c.id === cityId);
    return city?.name || 'Inconnue';
  };

  // Gestion des fichiers multiples avec compression
  const handleFileChange = async (file: File, key: string) => {
    try {
      let processedFile = file;
      
      // Compresser les images uniquement
      if (key === 'image' && file.type.startsWith('image/')) {
        const compressed = await compressImageByType(file);
        processedFile = compressed.file;
        toast.success('Image compressée avec succès');
      } else {
        toast.success('Fichier chargé avec succès');
      }

      // Ajouter le fichier au tableau existant ou créer un nouveau tableau
      setFiles((prev) => ({
        ...prev,
        [key]: prev[key] ? [...prev[key], processedFile] : [processedFile],
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement du fichier');
    }
  };

  // Supprimer un fichier spécifique
  const handleRemoveFile = (key: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
    toast.success('Fichier supprimé');
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.category || !formData.cityId || !formData.latitude || !formData.longitude) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation: Au moins un nom de localisation requis
    if (
      !formData.frLocalization.name &&
      !formData.arLocalization.name &&
      !formData.enLocalization.name
    ) {
      toast.error('Au moins un nom de localisation est requis (FR, AR ou EN)');
      return;
    }

    // Valider le JSON practicalInfo
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

      // Coordonnées
      apiFormData.append(
        'coordinates',
        JSON.stringify({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || '',
        })
      );

      // Champs basiques
      apiFormData.append('category', formData.category);
      apiFormData.append('cityId', formData.cityId);

      // Informations pratiques
      if (formData.practicalInfo && formData.practicalInfo !== '{}') {
        apiFormData.append('practicalInfo', formData.practicalInfo);
      }

      // Lien de visite virtuelle
      if (formData.virtualTourUrl) {
        apiFormData.append('virtualTourUrl', formData.virtualTourUrl);
      }

      // Localisations (envoyer même si vides pour que le backend les gère)
      apiFormData.append('arLocalization', JSON.stringify(formData.arLocalization));
      apiFormData.append('frLocalization', JSON.stringify(formData.frLocalization));
      apiFormData.append('enLocalization', JSON.stringify(formData.enLocalization));

      // Status flags
      apiFormData.append('isActive', String(formData.isActive));
      apiFormData.append('isVerified', String(formData.isVerified));
      apiFormData.append('isPremium', String(formData.isPremium));

      // Fichiers multiples
      Object.entries(files).forEach(([key, fileArray]) => {
        fileArray.forEach((file) => {
          apiFormData.append(key, file);
        });
      });

      // Ajoute la liste des fichiers à supprimer (uniquement en mode édition)
      if (selectedPOI && formData.filesToRemove && formData.filesToRemove.length > 0) {
        apiFormData.append('filesToRemove', JSON.stringify(formData.filesToRemove));
      }

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

  // Suppression d'un POI
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

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedPOI(null);
    setFormData(initialFormData);
    setFiles({});
  };

  // Éditer un POI
  const handleEdit = (poi: POI) => {
    setSelectedPOI(poi);
    // Trouver le lien de visite virtuelle dans les fichiers
    const virtualTourFile = poi.files?.find((f: any) => f.type === 'virtualtour');
    const virtualTourUrl = virtualTourFile?.fileUrl || '';

    setFormData({
      category: poi.category,
      cityId: poi.cityId,
      latitude: String(poi.coordinates.latitude),
      longitude: String(poi.coordinates.longitude),
      address: poi.coordinates.address || '',
      practicalInfo: JSON.stringify(poi.practicalInfo || {}, null, 2),
      virtualTourUrl,
      isActive: poi.isActive,
      isVerified: poi.isVerified,
      isPremium: poi.isPremium,
      frLocalization: poi.frLocalization || { name: '', description: '', address: '' },
      arLocalization: poi.arLocalization || { name: '', description: '', address: '' },
      enLocalization: poi.enLocalization || { name: '', description: '', address: '' },
      filesToRemove: [], // Important pour le formulaire
    });
    setFiles({}); 
    setIsModalOpen(true);
  };

  // Filtrer les POIs par terme de recherche
  const filteredPOIs = pois.filter((poi: POI) => {
    const searchLower = searchTerm.toLowerCase();
    const categoryName = getCategoryName(poi.category) || '';
    const cityName = getCityName(poi.cityId) || '';

    return (
      poi.frLocalization?.name?.toLowerCase().includes(searchLower) ||
      poi.arLocalization?.name?.toLowerCase().includes(searchLower) ||
      poi.enLocalization?.name?.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower) ||
      cityName.toLowerCase().includes(searchLower)
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
    handleRemoveFile,
    files,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
    getCategoryName,
    getCityName,
  };
}