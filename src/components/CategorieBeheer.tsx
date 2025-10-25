import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Settings, Mail } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string;
  tag: string;
  is_active: boolean;
  email_notifications: boolean;
  notification_email: string;
  created_at: string;
  form_fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'textarea' | 'number' | 'select';
  required: boolean;
  placeholder: string;
  options?: string[];
  order: number;
}

export default function CategorieBeheer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for creating/editing categories
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tag: '',
    is_active: true,
    email_notifications: true,
    notification_email: 'update@bitbeheer.nl',
    form_fields: [] as FormField[]
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await getCategories();
      
      if (error) {
        console.error('Failed to load categories:', error);
        // Fallback to default categories
        setCategories([
          {
            id: '1',
            name: 'Livegang Notificaties',
            description: 'Notificaties voor wanneer de website live gaat',
            tag: 'livegang',
            is_active: true,
            email_notifications: true,
            notification_email: 'update@bitbeheer.nl',
            created_at: new Date().toISOString(),
            form_fields: [
              { id: '1', name: 'Naam', type: 'text', required: false, placeholder: 'Je naam (optioneel)', order: 1 },
              { id: '2', name: 'E-mail', type: 'email', required: true, placeholder: 'Je e-mailadres *', order: 2 },
              { id: '3', name: 'Bericht', type: 'textarea', required: false, placeholder: 'Extra bericht (optioneel)', order: 3 }
            ]
          },
          {
            id: '2',
            name: 'Opening Website',
            description: 'Formulier voor opening van de website',
            tag: 'opening_website',
            is_active: true,
            email_notifications: true,
            notification_email: 'update@bitbeheer.nl',
            created_at: new Date().toISOString(),
            form_fields: [
              { id: '1', name: 'Naam', type: 'text', required: false, placeholder: 'Je naam (optioneel)', order: 1 },
              { id: '2', name: 'E-mail', type: 'email', required: true, placeholder: 'Je e-mailadres *', order: 2 },
              { id: '3', name: 'Bericht', type: 'textarea', required: false, placeholder: 'Extra bericht (optioneel)', order: 3 }
            ]
          }
        ]);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const { data, error } = await createCategory(formData);
      
      if (error) {
        console.error('Error creating category:', error);
        alert('Fout bij aanmaken categorie');
      } else {
        await loadCategories();
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Fout bij aanmaken categorie');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { data, error } = await updateCategory(editingCategory.id, formData);
      
      if (error) {
        console.error('Error updating category:', error);
        alert('Fout bij bijwerken categorie');
      } else {
        await loadCategories();
        setEditingCategory(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Fout bij bijwerken categorie');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) return;

    try {
      const { error } = await deleteCategory(categoryId);
      
      if (error) {
        console.error('Error deleting category:', error);
        alert('Fout bij verwijderen categorie');
      } else {
        await loadCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Fout bij verwijderen categorie');
    }
  };

  const toggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const { data, error } = await updateCategory(categoryId, { is_active: !isActive });
      
      if (error) {
        console.error('Error toggling category status:', error);
        alert('Fout bij bijwerken status');
      } else {
        await loadCategories();
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Fout bij bijwerken status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tag: '',
      is_active: true,
      email_notifications: true,
      notification_email: 'update@bitbeheer.nl',
      form_fields: []
    });
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      tag: category.tag,
      is_active: category.is_active,
      email_notifications: category.email_notifications,
      notification_email: category.notification_email,
      form_fields: category.form_fields
    });
  };

  const addFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false,
      placeholder: '',
      order: formData.form_fields.length + 1
    };
    setFormData({
      ...formData,
      form_fields: [...formData.form_fields, newField]
    });
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData({
      ...formData,
      form_fields: formData.form_fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const removeFormField = (fieldId: string) => {
    setFormData({
      ...formData,
      form_fields: formData.form_fields.filter(field => field.id !== fieldId)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorie Beheer</h2>
          <p className="text-gray-600">Beheer formulieren en categorieën</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuwe Categorie
        </button>
      </div>

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Actief' : 'Inactief'}
                  </span>
                  {category.email_notifications && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{category.description}</p>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Tag:</span> {category.tag} | 
                  <span className="font-medium ml-2">Email:</span> {category.notification_email} |
                  <span className="font-medium ml-2">Velden:</span> {category.form_fields.length}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    category.is_active 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={category.is_active ? 'Deactiveren' : 'Activeren'}
                >
                  {category.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => startEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Bewerken"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Verwijderen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Fields Preview */}
            {category.form_fields.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Formulier Velden:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.form_fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                    <div key={field.id} className="text-sm">
                      <span className="font-medium">{field.name}</span>
                      <span className="text-gray-500 ml-2">({field.type})</span>
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Categorie Bewerken' : 'Nieuwe Categorie'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Naam</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bijv. Contact Formulier"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bijv. contact_form"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="Beschrijving van deze categorie..."
                />
              </div>

              {/* Email Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notificatie Email</label>
                  <input
                    type="email"
                    value={formData.notification_email}
                    onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="update@bitbeheer.nl"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    Actief
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.email_notifications}
                      onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                      className="mr-2"
                    />
                    Email Notificaties
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Formulier Velden</h4>
                  <button
                    onClick={addFormField}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Veld Toevoegen
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.form_fields
                    .sort((a, b) => a.order - b.order)
                    .map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Veld Naam</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateFormField(field.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Bijv. Naam"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateFormField(field.id, { type: e.target.value as FormField['type'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="text">Tekst</option>
                            <option value="email">Email</option>
                            <option value="textarea">Tekstgebied</option>
                            <option value="number">Nummer</option>
                            <option value="select">Selectie</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Bijv. Je naam"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                              className="mr-1"
                            />
                            Verplicht
                          </label>
                          <button
                            onClick={() => removeFormField(field.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Veld verwijderen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingCategory ? 'Bijwerken' : 'Aanmaken'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
