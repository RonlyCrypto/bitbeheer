import { useState, useEffect } from 'react';
import { Mail, Edit, Trash2, Plus, Save, X, Eye, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  text_content: string;
  description: string;
  variables: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name', { ascending: true });

      if (error) throw error;
      
      // Ensure all templates have properly initialized variables field
      const normalizedTemplates = (data || []).map(template => ({
        ...template,
        variables: template.variables && typeof template.variables === 'object' ? template.variables : {}
      }));
      
      setTemplates(normalizedTemplates);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      alert(`Fout bij laden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    if (!editingTemplate.template_name || !editingTemplate.subject || !editingTemplate.html_content) {
      alert('Vul alle verplichte velden in (naam, onderwerp, HTML content)');
      return;
    }

    try {
      const updateData = {
        template_name: editingTemplate.template_name,
        subject: editingTemplate.subject,
        html_content: editingTemplate.html_content,
        text_content: editingTemplate.text_content || '',
        description: editingTemplate.description || '',
        variables: editingTemplate.variables || {},
        is_active: editingTemplate.is_active,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('email_templates')
        .update(updateData)
        .eq('id', editingTemplate.id);

      if (error) throw error;

      await loadTemplates();
      setEditingTemplate(null);
      alert('Template succesvol bijgewerkt!');
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(`Fout bij opslaan: ${error.message}`);
    }
  };

  const handleCreate = async () => {
    if (!editingTemplate) return;

    if (!editingTemplate.template_name || !editingTemplate.subject || !editingTemplate.html_content) {
      alert('Vul alle verplichte velden in (naam, onderwerp, HTML content)');
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .insert([{
          template_name: editingTemplate.template_name,
          subject: editingTemplate.subject,
          html_content: editingTemplate.html_content,
          text_content: editingTemplate.text_content || '',
          description: editingTemplate.description || '',
          variables: editingTemplate.variables || {},
          is_active: editingTemplate.is_active ?? true
        }]);

      if (error) throw error;

      await loadTemplates();
      setEditingTemplate(null);
      setShowNewTemplate(false);
      alert('Template succesvol aangemaakt!');
    } catch (error: any) {
      console.error('Error creating template:', error);
      alert(`Fout bij aanmaken: ${error.message}`);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Weet je zeker dat je dit template wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      alert('Template succesvol verwijderd!');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      alert(`Fout bij verwijderen: ${error.message}`);
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    setEditingTemplate({
      ...template,
      id: '', // New ID will be generated
      template_name: `${template.template_name}_copy`,
      variables: template.variables && typeof template.variables === 'object' ? template.variables : {},
      text_content: template.text_content || '',
      description: template.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setShowNewTemplate(true);
  };

  const getFilteredTemplates = () => {
    if (!searchQuery) return templates;
    return templates.filter(t => 
      t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const replaceVariables = (content: string) => {
    // Replace common variables with example values
    return content
      .replace(/\{\{name\}\}/g, 'Giovanni')
      .replace(/\{\{email\}\}/g, 'gebruiker@example.com')
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('nl-NL'))
      .replace(/\{\{verification_link\}\}/g, 'https://bitbeheer.nl/verify?token=example')
      .replace(/\{\{teams_link\}\}/g, 'https://teams.microsoft.com/l/meetup-join/...')
      .replace(/\{\{#if teams_link\}\}/g, '')
      .replace(/\{\{\/if\}\}/g, '');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Templates laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Beheer alle email templates die naar klanten worden verstuurd
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate({
              id: '',
              template_name: '',
              subject: '',
              html_content: '',
              text_content: '',
              description: '',
              variables: {},
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            setShowNewTemplate(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuw Template
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Zoek templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredTemplates().map((template) => (
          <div
            key={template.id}
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 ${
              template.is_active
                ? 'border-green-300 dark:border-green-700'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className={`w-5 h-5 ${template.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">{template.template_name}</h3>
              </div>
              {!template.is_active && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  Inactief
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              {template.subject}
            </p>

            {template.description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                {template.description}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingTemplate({
                    ...template,
                    variables: template.variables && typeof template.variables === 'object' ? template.variables : {},
                    text_content: template.text_content || '',
                    description: template.description || ''
                  });
                  setShowNewTemplate(false);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
              >
                <Edit className="w-3 h-3" />
                Bewerken
              </button>
              <button
                onClick={() => {
                  setPreviewTemplate(template);
                  setShowPreview(true);
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDuplicate(template)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {getFilteredTemplates().length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Geen templates</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? 'Geen templates gevonden met deze zoekterm' : 'Maak je eerste email template aan'}
          </p>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {showNewTemplate ? 'Nieuw Template' : 'Template Bewerken'}
              </h3>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setShowNewTemplate(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Naam *
                </label>
                <input
                  type="text"
                  value={editingTemplate.template_name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="bijv. welcome, verification, appointment_confirmed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Onderwerp *
                </label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Email onderwerp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beschrijving
                </label>
                <input
                  type="text"
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Korte beschrijving van dit template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTML Content *
                  <span className="text-xs text-gray-500 ml-2">Gebruik {{variable}} voor variabelen</span>
                </label>
                <textarea
                  value={editingTemplate.html_content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, html_content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="<html>...</html>"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Content (alternatief voor email clients zonder HTML)
                </label>
                <textarea
                  value={editingTemplate.text_content || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, text_content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Plain text versie"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingTemplate.is_active}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template is actief
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Beschikbare variabelen:</p>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{name}}'}</code> - Gebruikersnaam</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{email}}'}</code> - Email adres</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{date}}'}</code> - Huidige datum</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{verification_link}}'}</code> - Email verificatie link</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{teams_link}}'}</code> - Microsoft Teams link (optioneel)</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={showNewTemplate ? handleCreate : handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  {showNewTemplate ? 'Aanmaken' : 'Opslaan'}
                </button>
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setShowNewTemplate(false);
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preview: {previewTemplate.subject}</h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewTemplate(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Onderwerp:</strong></p>
                <p className="text-gray-900 dark:text-white">{replaceVariables(previewTemplate.subject)}</p>
              </div>

              <div 
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: replaceVariables(previewTemplate.html_content) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

