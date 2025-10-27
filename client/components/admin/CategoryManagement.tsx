'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { CategoryCard } from './categories/CategoryCard';
import { CategoryForm } from './categories/CategoryForm';
import { useCategoryManagement } from './categories/useCategoryManagement';
import { Folder } from 'lucide-react';

export default function CategoryManagement() {
  const {
    categories,
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
  } = useCategoryManagement();

  if (isLoading) return <LoadingState message="Chargement des catégories..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catégories"
        count={categories.length}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouvelle Catégorie"
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher une catégorie..."
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucune catégorie trouvée"
          description={`Total: ${categories.length} catégories`}
          action={
            !searchTerm
              ? {
                  label: 'Créer la première catégorie',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <CardGrid columns={4}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category.id)}
              isDeleting={isDeleting}
              parseLoc={parseLoc}
            />
          ))}
        </CardGrid>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
        size="max-w-3xl"
      >
        <CategoryForm
          formData={formData}
          onFormDataChange={setFormData}
          selectedCategory={selectedCategory}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
          parseLoc={parseLoc}
        />
      </Modal>
    </div>
  );
}