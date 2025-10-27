'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { CityCard } from './cities/CityCard';
import { CityForm } from './cities/CityForm';
import { useCityManagement } from './cities/useCityManagement';
import { MapPin } from 'lucide-react';

interface CitiesPageProps {
  locale?: string;
}
export default function CityManagement({ locale = 'fr' }: CitiesPageProps) {
  const {
    cities,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCity,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    imagePreview,
    isCreating,
    isUpdating,
    isDeleting,
    handleImageChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleLocationSelect,
    resetForm,
    refetch,
  } = useCityManagement();

  if (isLoading) return <LoadingState message="Chargement des villes..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Villes"
        count={cities.length}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouvelle Ville"
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher une ville..."
      />

      {cities.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucune ville trouvée"
          description={`Total: ${cities.length} villes`}
          action={
            !searchTerm
              ? {
                  label: 'Créer la première ville',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <CardGrid columns={3}>
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              onEdit={() => handleEdit(city)}
              onDelete={() => handleDelete(city.id)}
              isDeleting={isDeleting}
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
        title={selectedCity ? 'Modifier la Ville' : 'Nouvelle Ville'}
        size="max-w-5xl"
      >
        <CityForm
          formData={formData}
          onFormDataChange={setFormData}
          onImageChange={handleImageChange}
          onLocationSelect={handleLocationSelect}
          imagePreview={imagePreview}
          selectedCity={selectedCity}
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