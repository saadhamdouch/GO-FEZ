'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { POICard } from './pois/POICard';
import { POIForm } from './pois/POIForm';
import { usePOIManagement } from './pois/usePOIManagement';
import { Map360 } from 'lucide-react';

export default function POIManagement() {
  const {
    pois,
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
  } = usePOIManagement();

  if (isLoading) return <LoadingState message="Chargement des POIs..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Points d'Intérêt"
        count={pois.length}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouveau POI"
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un POI..." />

      {pois.length === 0 ? (
        <EmptyState
          icon={<Map360 className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucun POI trouvé"
          action={
            !searchTerm
              ? {
                  label: 'Créer le premier POI',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <CardGrid>
          {pois.map((poi) => (
            <POICard
              key={poi.id}
              poi={poi}
              onEdit={() => handleEdit(poi)}
              onDelete={() => handleDelete(poi.id)}
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
        title={selectedPOI ? 'Modifier le POI' : 'Nouveau POI'}
        size="max-w-6xl"
      >
        <POIForm
          formData={formData}
          onFormDataChange={setFormData}
          onFileChange={handleFileChange}
          categories={categories}
          cities={cities}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
          selectedPOI={selectedPOI}
        />
      </Modal>
    </div>
  );
}