'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { ThemeCard } from './themes/ThemeCard';
import { ThemeForm } from './themes/ThemeForm';
import { useThemeManagement } from './themes/useThemeManagement';
import { ImageIcon } from 'lucide-react';

export default function ThemeManagement() {
  const {
    themes,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedTheme,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    iconPreview,
    imagePreview,
    isCreating,
    isUpdating,
    isDeleting,
    parseLoc,
    handleFileChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
  } = useThemeManagement();

  if (isLoading) return <LoadingState message="Chargement des thèmes..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thèmes"
        count={themes.length}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouveau Thème"
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un thème..." />

      {themes.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucun thème trouvé"
          action={
            !searchTerm
              ? {
                  label: 'Créer le premier thème',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <CardGrid columns={4}>
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onEdit={() => handleEdit(theme)}
              onDelete={() => handleDelete(theme.id)}
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
        title={selectedTheme ? 'Modifier le Thème' : 'Nouveau Thème'}
        size="max-w-4xl"
      >
        <ThemeForm
          formData={formData}
          onFormDataChange={setFormData}
          onIconChange={(file) => handleFileChange(file, 'icon')}
          onImageChange={(file) => handleFileChange(file, 'image')}
          iconPreview={iconPreview}
          imagePreview={imagePreview}
          selectedTheme={selectedTheme}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
}
