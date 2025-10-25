'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './shared/Modal';
import ImagePreview from './shared/ImagePreview';
import SearchBar from './shared/SearchBar';
import { 
  useGetAllThemesQuery, 
  useCreateThemeMutation, 
  useUpdateThemeMutation, 
  useDeleteThemeMutation,
  type Theme 
} from '@/services/api/ThemeApi';
import { compressImageByType } from '@/utils/imageCompression';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';

interface FormData {
  localizations: {
    fr: { name: string; desc: string };
    ar: { name: string; desc: string };
    en: { name: string; desc: string };
  };
  color: string;
  isActive: boolean;
}
export default function ThemeManagement() {
  const { data: themesData, isLoading, refetch } = useGetAllThemesQuery();
  const [createTheme, { isLoading: isCreating }] = useCreateThemeMutation();
  const [updateTheme, { isLoading: isUpdating }] = useUpdateThemeMutation();
  const [deleteTheme, { isLoading: isDeleting }] = useDeleteThemeMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    localizations: {
      fr: { name: '', desc: '' },
      ar: { name: '', desc: '' },
      en: { name: '', desc: '' }
    },
    color: '#4f46e5',
    isActive: true
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const themes = themesData?.data || [];

  const parseLoc = (loc: any): { name: string; desc: string } => {
    if (typeof loc === 'string') {
      try {
        return JSON.parse(loc);
      } catch {
        return { name: '', desc: '' };
      }
    }
    return loc || { name: '', desc: '' };
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'icon' | 'image'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageByType(file);
        const previewUrl = URL.createObjectURL(compressed.file);
        
        if (type === 'icon') {
          setIconFile(compressed.file);
          setIconPreview(previewUrl);
        } else {
          setImageFile(compressed.file);
          setImagePreview(previewUrl);
        }
      } catch (error) {
        toast.error('Erreur lors de la compression du fichier');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.localizations.fr.name || !formData.localizations.ar.name || !formData.localizations.en.name) {
      toast.error('Veuillez remplir tous les noms de localisation');
      return;
    }

    if (!iconFile && !selectedTheme) {
      toast.error('L\'icône est requise');
      return;
    }

    if (!imageFile && !selectedTheme) {
      toast.error('L\'image est requise');
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append('data', JSON.stringify(formData));
    if (iconFile) apiFormData.append('icon', iconFile);
    if (imageFile) apiFormData.append('image', imageFile);

    try {
      if (selectedTheme) {
        await updateTheme({ id: selectedTheme.id, formData: apiFormData }).unwrap();
        toast.success('Thème mis à jour avec succès');
      } else {
        await createTheme(apiFormData).unwrap();
        toast.success('Thème créé avec succès');
      }
      
      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving theme:', error);
      toast.error(error?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce thème ?')) return;
    
    try {
      await deleteTheme(id).unwrap();
      toast.success('Thème supprimé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting theme:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setSelectedTheme(null);
    setFormData({
      localizations: {
        fr: { name: '', desc: '' },
        ar: { name: '', desc: '' },
        en: { name: '', desc: '' }
      },
      color: '#4f46e5',
      isActive: true
    });
    setIconFile(null);
    setImageFile(null);
    setIconPreview(null);
    setImagePreview(null);
  };

  const filteredThemes = themes.filter((theme: Theme) => {
    const frLoc = parseLoc(theme.fr);
    return frLoc.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Thèmes</h2>
          <p className="text-gray-600 mt-1">{themes.length} thème(s) au total</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Thème</span>
        </button>
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Rechercher un thème..." 
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun thème trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredThemes.map((theme: Theme) => {
            const frLoc = parseLoc(theme.fr);
            return (
              <div 
                key={theme.id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="relative">
                  <ImagePreview 
                    src={theme.image} 
                    alt={frLoc.name || 'Thème'} 
                    className="w-full h-40" 
                  />
                  <div 
                    className="absolute top-3 left-3 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: theme.color }}
                  >
                    {theme.icon && (
                      <img
                        src={cloudinaryLoader({ 
                          src: theme.icon, 
                          width: 48, 
                          height: 48, 
                          quality: 90 
                        })}
                        alt="icon"
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {frLoc.name || 'Sans nom'}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {frLoc.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {theme.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Actif
                        </span>
                      )}
                      {theme.circuitsCount !== undefined && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {theme.circuitsCount} circuits
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedTheme(theme);
                          setFormData({
                            localizations: {
                              fr: parseLoc(theme.fr),
                              ar: parseLoc(theme.ar),
                              en: parseLoc(theme.en)
                            },
                            color: theme.color || '#4f46e5',
                            isActive: theme.isActive
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(theme.id)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTheme ? 'Modifier le Thème' : 'Nouveau Thème'}
        size="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {(['fr', 'ar', 'en'] as const).map((lang) => (
              <div key={lang} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Français' : lang === 'ar' ? 'Arabe' : 'Anglais'}</span>
                </h4>
                <input
                  type="text"
                  placeholder="Nom *"
                  value={formData.localizations[lang].name}
                  onChange={(e) => setFormData({
                    ...formData,
                    localizations: {
                      ...formData.localizations,
                      [lang]: { ...formData.localizations[lang], name: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.localizations[lang].desc}
                  onChange={(e) => setFormData({
                    ...formData,
                    localizations: {
                      ...formData.localizations,
                      [lang]: { ...formData.localizations[lang], desc: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du thème
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-12 rounded-lg border cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icône *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'icon')}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required={!selectedTheme}
              />
              <div className="mt-3 flex justify-center">
                {iconPreview ? (
                  <img 
                    src={iconPreview} 
                    alt="Icon preview" 
                    className="w-16 h-16 object-contain rounded-lg border" 
                  />
                ) : selectedTheme?.icon ? (
                  <img 
                    src={cloudinaryLoader({ 
                      src: selectedTheme.icon, 
                      width: 64, 
                      height: 64 
                    })} 
                    alt="Existing icon" 
                    className="w-16 h-16 object-contain rounded-lg border" 
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageIcon className="text-gray-400 w-6 h-6" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required={!selectedTheme}
              />
              <div className="mt-3">
                {imagePreview ? (
                  <ImagePreview 
                    src={imagePreview} 
                    alt="Image preview" 
                    className="w-full h-32" 
                  />
                ) : selectedTheme?.image ? (
                  <ImagePreview 
                    src={selectedTheme.image} 
                    alt="Existing image" 
                    className="w-full h-32" 
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageIcon className="text-gray-400 w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Actif</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isCreating || isUpdating ? 'En cours...' : selectedTheme ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}