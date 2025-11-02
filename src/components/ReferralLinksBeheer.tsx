import { useState, useEffect } from 'react';
import { Link2, Plus, Edit, Trash2, Save, X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReferralLink {
  id: string;
  title: string;
  url: string;
  section_title: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ReferralLinksBeheer() {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<ReferralLink | null>(null);
  const [showNewLink, setShowNewLink] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('Belangrijke Links');

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      setLinks(data || []);
      
      // Get section title from first link (all should have the same)
      if (data && data.length > 0) {
        setSectionTitle(data[0].section_title || 'Belangrijke Links');
      }
    } catch (error: any) {
      console.error('Error loading referral links:', error);
      alert(`Fout bij laden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingLink) return;

    if (!editingLink.title || !editingLink.url) {
      alert('Vul titel en URL in');
      return;
    }

    try {
      const updateData = {
        title: editingLink.title,
        url: editingLink.url,
        section_title: sectionTitle,
        order_index: editingLink.order_index,
        is_active: editingLink.is_active,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('referral_links')
        .update(updateData)
        .eq('id', editingLink.id);

      if (error) throw error;

      await loadLinks();
      setEditingLink(null);
      alert('Link succesvol bijgewerkt!');
    } catch (error: any) {
      console.error('Error saving link:', error);
      alert(`Fout bij opslaan: ${error.message}`);
    }
  };

  const handleCreate = async () => {
    if (!editingLink) return;

    if (!editingLink.title || !editingLink.url) {
      alert('Vul titel en URL in');
      return;
    }

    try {
      // Get max order_index and add 1
      const maxOrder = links.length > 0 
        ? Math.max(...links.map(l => l.order_index || 0)) 
        : 0;

      const { error } = await supabase
        .from('referral_links')
        .insert([{
          title: editingLink.title,
          url: editingLink.url,
          section_title: sectionTitle,
          order_index: maxOrder + 1,
          is_active: editingLink.is_active ?? true
        }]);

      if (error) throw error;

      await loadLinks();
      setEditingLink(null);
      setShowNewLink(false);
      alert('Link succesvol aangemaakt!');
    } catch (error: any) {
      console.error('Error creating link:', error);
      alert(`Fout bij aanmaken: ${error.message}`);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Weet je zeker dat je deze link wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('referral_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      await loadLinks();
      alert('Link succesvol verwijderd!');
    } catch (error: any) {
      console.error('Error deleting link:', error);
      alert(`Fout bij verwijderen: ${error.message}`);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const link = links[index];
    const prevLink = links[index - 1];

    try {
      // Swap order_index
      await supabase
        .from('referral_links')
        .update({ order_index: prevLink.order_index })
        .eq('id', link.id);

      await supabase
        .from('referral_links')
        .update({ order_index: link.order_index })
        .eq('id', prevLink.id);

      await loadLinks();
    } catch (error: any) {
      console.error('Error moving link:', error);
      alert(`Fout bij verplaatsen: ${error.message}`);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === links.length - 1) return;

    const link = links[index];
    const nextLink = links[index + 1];

    try {
      // Swap order_index
      await supabase
        .from('referral_links')
        .update({ order_index: nextLink.order_index })
        .eq('id', link.id);

      await supabase
        .from('referral_links')
        .update({ order_index: link.order_index })
        .eq('id', nextLink.id);

      await loadLinks();
    } catch (error: any) {
      console.error('Error moving link:', error);
      alert(`Fout bij verplaatsen: ${error.message}`);
    }
  };

  const updateSectionTitle = async (newTitle: string) => {
    setSectionTitle(newTitle);
    
    // Update all links with new section_title
    try {
      const { error } = await supabase
        .from('referral_links')
        .update({ section_title: newTitle })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;
      
      await loadLinks();
    } catch (error: any) {
      console.error('Error updating section title:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Links laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referral Links Beheer</h2>
          <p className="text-gray-600 mt-1">
            Beheer de belangrijke links die in de footer worden weergegeven
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLink({
              id: '',
              title: '',
              url: '',
              section_title: sectionTitle,
              order_index: links.length + 1,
              is_active: true
            });
            setShowNewLink(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuwe Link
        </button>
      </div>

      {/* Section Title */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titel van het Link Blok
        </label>
        <input
          type="text"
          value={sectionTitle}
          onChange={(e) => updateSectionTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Bijv. Belangrijke Links, Partners, etc."
        />
      </div>

      {/* Links List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {links.length === 0 ? (
          <div className="p-12 text-center">
            <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen links</h3>
            <p className="text-gray-600 mb-6">Voeg je eerste referral link toe</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {links.map((link, index) => (
              <div
                key={link.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !link.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === links.length - 1}
                      className={`p-1 rounded ${index === links.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link2 className="w-4 h-4 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">{link.title}</h3>
                      {!link.is_active && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          Inactief
                        </span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-orange-600 transition-colors break-all"
                    >
                      {link.url}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingLink(link);
                        setShowNewLink(false);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {(editingLink || showNewLink) && editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {showNewLink ? 'Nieuwe Link' : 'Link Bewerken'}
              </h3>
              <button
                onClick={() => {
                  setEditingLink(null);
                  setShowNewLink(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Bijv. Bitcoin.org - Officiële Site"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL (met referral code) *
                </label>
                <input
                  type="url"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder="https://example.com/?ref=YOURCODE"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plak hier de volledige URL inclusief je referral code
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingLink.is_active}
                  onChange={(e) => setEditingLink({ ...editingLink, is_active: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Link is actief
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={showNewLink ? handleCreate : handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  {showNewLink ? 'Aanmaken' : 'Opslaan'}
                </button>
                <button
                  onClick={() => {
                    setEditingLink(null);
                    setShowNewLink(false);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

