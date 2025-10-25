'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { CircuitCard } from './circuits/CircuitCard';
import { CircuitForm } from './circuits/CircuitForm';
import { useCircuitManagement } from './circuits/useCircuitManagement';
import { Route } from 'lucide-react';

interface CircuitManagementProps {
  locale?: string;
}

export default function CircuitManagement({ locale = 'fr' }: CircuitManagementProps) {
  const {
    circuits,
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
  } = useCircuitManagement();

  if (isLoading) return <LoadingState message="Chargement des circuits..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circuits"
        count={circuits.length}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouveau Circuit"
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un circuit..." />

      {circuits.length === 0 ? (
        <EmptyState
          icon={<Route className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucun circuit trouvé"
          description={`Total: ${circuits.length} circuits`}
          action={
            !searchTerm
              ? {
                  label: 'Créer le premier circuit',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <CardGrid>
          {circuits.map((circuit) => (
            <CircuitCard
              key={circuit.id}
              circuit={circuit}
              onEdit={() => handleEdit(circuit)}
              onDelete={() => handleDelete(circuit.id)}
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
        title={selectedCircuit ? 'Modifier le Circuit' : 'Nouveau Circuit'}
        size="max-w-5xl"
      >
        <CircuitForm
          formData={formData}
          onFormDataChange={setFormData}
          onImageChange={handleImageChange}
          imagePreview={imagePreview}
          cities={cities}
          themes={themes}
          pois={pois}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
          selectedCircuit={selectedCircuit}
          parseLoc={parseLoc}
        />
      </Modal>
    </div>
  );
}