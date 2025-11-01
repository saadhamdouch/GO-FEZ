'use client';

import { useState } from 'react';
import { Languages, Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { IAModelApi } from '@/services/api/IAModelApi';

interface TranslationSuggestion {
  fr: string;
  ar: string;
  en: string;
}

interface IaNameTraductionProps {
  localizations: {
    fr: { name: string; description?: string; address?: string };
    ar: { name: string; description?: string; address?: string };
    en: { name: string; description?: string; address?: string };
  };
  onChange: (lang: 'fr' | 'ar' | 'en', field: string, value: string) => void;
  fieldName?: string; // 'name', 'description', or 'address'
}

export function IaNameTraduction({
  localizations,
  onChange,
  fieldName = 'name'
}: IaNameTraductionProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [suggestions, setSuggestions] = useState<TranslationSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTranslateAll = async () => {
    // Find the first non-empty field
    const frValue = localizations.fr[fieldName] || '';
    const arValue = localizations.ar[fieldName] || '';
    const enValue = localizations.en[fieldName] || '';

    const sourceText = frValue || arValue || enValue;
    
    if (!sourceText || sourceText.trim() === '') {
      toast.error('Veuillez remplir au moins un champ avant de traduire');
      return;
    }

    setIsTranslating(true);
    
    try {
      console.log('[Translation] Starting translation for:', sourceText);
      
      // Always translate to all 3 languages
      const data = await IAModelApi.translate({
        text: sourceText,
        targetLanguages: ['fr', 'ar', 'en']
      });

      console.log('[Translation] Response from API:', data);

      // Create suggestion object with all translations
      const newSuggestions: TranslationSuggestion = {
        fr: data.translations.fr || sourceText,
        ar: data.translations.ar || sourceText,
        en: data.translations.en || sourceText
      };

      console.log('[Translation] Suggestions created:', newSuggestions);

      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      toast.success(`Traductions générées avec ${data.provider}`);
    } catch (error: any) {
      console.error('[Translation] Error:', error);
      toast.error(`Erreur: ${error.message || 'Vérifiez la configuration des modèles IA'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const applySuggestion = (lang: 'fr' | 'ar' | 'en') => {
    if (suggestions && suggestions[lang]) {
      onChange(lang, fieldName, suggestions[lang]);
      toast.success(`Traduction ${lang.toUpperCase()} appliquée`);
    }
  };

  const applyAllSuggestions = () => {
    if (suggestions) {
      if (suggestions.fr) onChange('fr', fieldName, suggestions.fr);
      if (suggestions.ar) onChange('ar', fieldName, suggestions.ar);
      if (suggestions.en) onChange('en', fieldName, suggestions.en);
      setShowSuggestions(false);
      toast.success('Toutes les traductions ont été appliquées');
    }
  };

  const dismissSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions(null);
  };

  return (
    <div className="space-y-3">
      {/* Translate Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleTranslateAll}
          disabled={isTranslating}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traduction en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <Languages className="w-4 h-4" />
              Traduire
            </>
          )}
        </button>

        {showSuggestions && (
          <span className="text-xs text-gray-500">
            💡 Cliquez sur les traductions pour les appliquer
          </span>
        )}
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions && (
        <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-indigo-50 space-y-3 animate-in slide-in-from-top shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Suggestions de traduction IA</h4>
            </div>
            <button
              type="button"
              onClick={dismissSuggestions}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-white rounded transition-colors"
              title="Fermer les suggestions"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* French Suggestion */}
            {suggestions.fr && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm border border-purple-100">
                <div className="flex-1">
                  <div className="text-xs font-medium text-purple-600 mb-1">🇫🇷 Français</div>
                  <div className="text-sm text-gray-900 font-medium">{suggestions.fr}</div>
                </div>
                <button
                  type="button"
                  onClick={() => applySuggestion('fr')}
                  className="ml-3 p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Appliquer cette traduction"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Arabic Suggestion */}
            {suggestions.ar && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm border border-purple-100">
                <div className="flex-1 text-right" dir="rtl">
                  <div className="text-xs font-medium text-purple-600 mb-1">🇲🇦 العربية</div>
                  <div className="text-sm text-gray-900 font-medium">{suggestions.ar}</div>
                </div>
                <button
                  type="button"
                  onClick={() => applySuggestion('ar')}
                  className="mr-3 p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Appliquer cette traduction"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* English Suggestion */}
            {suggestions.en && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm border border-purple-100">
                <div className="flex-1">
                  <div className="text-xs font-medium text-purple-600 mb-1">🇬🇧 English</div>
                  <div className="text-sm text-gray-900 font-medium">{suggestions.en}</div>
                </div>
                <button
                  type="button"
                  onClick={() => applySuggestion('en')}
                  className="ml-3 p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Appliquer cette traduction"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={applyAllSuggestions}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Check className="w-4 h-4" />
            Appliquer toutes les traductions
          </button>

          <p className="text-xs text-center text-gray-600">
            💡 Vous pouvez aussi écrire manuellement dans les champs ci-dessous
          </p>
        </div>
      )}
    </div>
  );
}
