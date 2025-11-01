'use client';

import { Key, MessageSquare, Check, X } from 'lucide-react';

interface IAModelFormProps {
  formData: {
    provider: 'gemini' | 'grok' | 'openai';
    api_key: string;
    prompt: string;
    is_default: boolean;
    is_active: boolean;
  };
  editingModel: any | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormDataChange: (data: any) => void;
}

export function IAModelForm({
  formData,
  editingModel,
  onSubmit,
  onCancel,
  onFormDataChange
}: IAModelFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fournisseur *
        </label>
        <select
          value={formData.provider}
          onChange={(e) => onFormDataChange({ ...formData, provider: e.target.value as 'gemini' | 'grok' | 'openai' })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
          disabled={!!editingModel} // Can't change provider when editing
        >
          <option value="gemini">✨ Gemini (Google AI)</option>
          <option value="grok">🚀 Grok (X.AI)</option>
          <option value="openai">🤖 OpenAI (ChatGPT)</option>
        </select>
        {editingModel && (
          <p className="text-xs text-gray-500 mt-1">
            ℹ️ Le fournisseur ne peut pas être modifié après la création
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Key className="w-4 h-4" />
          Clé API
        </label>
        <input
          type="password"
          value={formData.api_key}
          onChange={(e) => onFormDataChange({ ...formData, api_key: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Votre clé API"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.provider === 'gemini' && '🔗 Obtenez votre clé sur ai.google.dev'}
          {formData.provider === 'grok' && '🔗 Obtenez votre clé sur x.ai/api'}
          {formData.provider === 'openai' && '🔗 Obtenez votre clé sur platform.openai.com'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Prompt de traduction personnalisé
        </label>
        <textarea
          value={formData.prompt}
          onChange={(e) => onFormDataChange({ ...formData, prompt: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={4}
          placeholder="Vous êtes un traducteur professionnel..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Use <code className="bg-gray-100 px-1 rounded">TARGET_LANG</code> as placeholder for target language. The backend will replace it with the actual language name and append the text to translate.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_default}
            onChange={(e) => onFormDataChange({ ...formData, is_default: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700"> Par défaut</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700"> Actif</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {editingModel ? 'Mettre à jour' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  );
}
