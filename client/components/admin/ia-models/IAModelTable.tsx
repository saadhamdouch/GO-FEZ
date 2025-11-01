'use client';

import { Edit2, Trash2 } from 'lucide-react';

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

interface IAModelTableProps {
  models: IAModel[];
  onEdit: (model: IAModel) => void;
  onDelete: (id: number) => void;
}

const getProviderColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini':
      return 'bg-blue-100 text-blue-800';
    case 'grok':
      return 'bg-purple-100 text-purple-800';
    case 'openai':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini':
      return '✨';
    case 'grok':
      return '🚀';
    case 'openai':
      return '🤖';
    default:
      return '🔮';
  }
};

export function IAModelTable({ models, onEdit, onDelete }: IAModelTableProps) {
  if (models.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Aucun modèle IA configuré. Cliquez sur "Nouveau Modèle" pour commencer.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fournisseur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.map((model) => (
              <tr key={model.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getProviderIcon(model.provider)}</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProviderColor(model.provider)}`}>
                        {model.provider.toUpperCase()}
                      </span>
                      {model.is_default && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          ⭐ Par défaut
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-md truncate" title={model.prompt}>
                    {model.prompt.substring(0, 80)}{model.prompt.length > 80 ? '...' : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      model.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {model.is_active ? '✅ Actif' : '❌ Inactif'}
                    </span>
                    {model.api_key ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        🔑 API configurée
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        ⚠️ API manquante
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(model)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(model.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
