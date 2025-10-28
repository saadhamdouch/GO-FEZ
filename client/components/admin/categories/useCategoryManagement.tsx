'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from '@/services/api/CategoryApi';
import { logError } from "@/lib/logger";
interface CategoryFormData {
  localizations: {
    fr: { name: string; desc: string };
    ar: { name: string; desc: string };
    en: { name: string; desc: string };
  };
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  localizations: {
    fr: { name: '', desc: '' },
    ar: { name: '', desc: '' },
    en: { name: '', desc: '' },
  },
  isActive: true,
};

export function useCategoryManagement() {
  const { data: categoriesData, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  const categories = categoriesData?.data || [];

  // Parser les localisations
const parseLoc = (loc: string | any): { name: string; desc: string } => {
  if (typeof loc === 'string') {
    try {
      const cleaned = loc.replace(/^"+|"+$/g, '');
      const unescaped = cleaned.replace(/\\"/g, '"');
      const parsed = JSON.parse(unescaped);
      return {
        name: parsed.name || '',
        desc: parsed.desc || '',
      };
    } catch (err) {
      console.warn('Failed to parse localization:', loc, err);
      return { name: '', desc: '' };
    }
  }

  return {
    name: loc?.name || '',
    desc: loc?.desc || '',
  };
};

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Au moins un nom requis
    if (
      !formData.localizations.fr.name &&
      !formData.localizations.ar.name &&
      !formData.localizations.en.name
    ) {
      toast.error('Au moins un nom de localisation est requis (FR, AR ou EN)');
      return;
    }

    try {
      const payload = {
        ar: formData.localizations.ar.name ? JSON.stringify(formData.localizations.ar) : JSON.stringify({ name: '', desc: '' }),
        fr: formData.localizations.fr.name ? JSON.stringify(formData.localizations.fr) : JSON.stringify({ name: '', desc: '' }),
        en: formData.localizations.en.name ? JSON.stringify(formData.localizations.en) : JSON.stringify({ name: '', desc: '' }),
        isActive: formData.isActive,
      };

      if (selectedCategory) {
        await updateCategory({ id: selectedCategory.id, data: payload }).unwrap();
        toast.success('Catégorie mise à jour avec succès');
      } else {
        await createCategory(payload).unwrap();
        toast.success('Catégorie créée avec succès');
      }

      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      logError("Failed to save category", error);
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Suppression d'une catégorie
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await deleteCategory(id).unwrap();
      toast.success('Catégorie supprimée avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedCategory(null);
    setFormData(initialFormData);
  };

  // Éditer une catégorie
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      localizations: {
        fr: parseLoc(category.fr),
        ar: parseLoc(category.ar),
        en: parseLoc(category.en),
      },
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  // Filtrer les catégories
  const filteredCategories = categories.filter((category: Category) => {
    if (!searchTerm) return true;

    const frLoc = parseLoc(category.fr);
    const arLoc = parseLoc(category.ar);
    const enLoc = parseLoc(category.en);
    const searchLower = searchTerm.toLowerCase();

    return (
      frLoc.name?.toLowerCase().includes(searchLower) ||
      arLoc.name?.toLowerCase().includes(searchLower) ||
      enLoc.name?.toLowerCase().includes(searchLower) ||
      frLoc.desc?.toLowerCase().includes(searchLower) ||
      arLoc.desc?.toLowerCase().includes(searchLower) ||
      enLoc.desc?.toLowerCase().includes(searchLower)
    );
  });

  return {
    categories: filteredCategories,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    isCreating,
    isUpdating,
    isDeleting,
    parseLoc,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
  };
}