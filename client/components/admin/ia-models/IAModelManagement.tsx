'use client';

import { useState, useEffect } from 'react';
import { Plus, Brain, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { IAModelForm } from './IAModelForm';
import { IAModelTable } from './IAModelTable';

interface IAModel {
  id: number;
  provider: 'gemini' | 'grok' | 'openai';
  api_key: string | null;
  prompt: string;
  is_default: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function IAModelManagement() {
  const [models, setModels] = useState<IAModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<IAModel | null>(null);
  const [formData, setFormData] = useState({
    provider: 'gemini' as 'gemini' | 'grok' | 'openai',
    api_key: '',
    prompt: 'Translate the following text to TARGET_LANG. Provide ONLY the direct translation without any introduction, explanation, quotes, or additional context.',
    is_default: false,
    is_active: true
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ia-models', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setModels(data);
    } catch (error: any) {
      console.error('Error fetching IA models:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de charger les modèles IA'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingModel 
        ? `http://localhost:8080/api/ia-models/${editingModel.id}`
        : 'http://localhost:8080/api/ia-models';
      
      const method = editingModel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save model');
      }

      toast.success(editingModel ? 'Modèle mis à jour' : 'Modèle créé');
      fetchModels();
      resetForm();
    } catch (error: any) {
      console.error('Error saving model:', error);
      toast.error(`Erreur: ${error.message || 'Erreur lors de la sauvegarde'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/ia-models/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete model');
      }

      toast.success('Modèle supprimé');
      fetchModels();
    } catch (error: any) {
      console.error('Error deleting model:', error);
      toast.error(`Erreur: ${error.message || 'Erreur lors de la suppression'}`);
    }
  };

  const handleEdit = (model: IAModel) => {
    setEditingModel(model);
    setFormData({
      provider: model.provider,
      api_key: model.api_key || '',
      prompt: model.prompt || '',
      is_default: model.is_default,
      is_active: model.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      provider: 'gemini',
      api_key: '',
      prompt: 'Translate the following text to TARGET_LANG. Provide ONLY the direct translation without any introduction, explanation, quotes, or additional context.',
      is_default: false,
      is_active: true
    });
    setEditingModel(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Modèles IA</h2>
            <p className="text-sm text-gray-600">Configurez vos fournisseurs d'IA pour les traductions</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau Modèle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {editingModel ? 'Modifier le modèle' : 'Nouveau modèle IA'}
          </h3>
          
          <IAModelForm
            formData={formData}
            editingModel={editingModel}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            onFormDataChange={setFormData}
          />
        </div>
      )}

      {/* Models Table */}
      <IAModelTable
        models={models}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
