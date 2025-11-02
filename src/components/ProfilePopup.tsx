import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, User, Save, Edit3 } from 'lucide-react';
import { getDisplayEmail } from '../utils/emailUtils';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  user: any;
  isImpersonating: boolean;
  impersonatedUser: string | null;
}

export default function ProfilePopup({ 
  isOpen, 
  onClose, 
  userProfile, 
  setUserProfile, 
  user, 
  isImpersonating, 
  impersonatedUser 
}: ProfilePopupProps) {
  // ProfilePopup logging removed (no sensitive data in console)
  const [isEditing, setIsEditing] = useState(false);

  // Block body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Load fresh profile data from Supabase when opening, if fields are empty
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const targetEmail = isImpersonating && impersonatedUser ? impersonatedUser : (user?.email || '');
        if (!targetEmail) return;

        const needsFetch = !userProfile?.first_name || !userProfile?.location || !userProfile?.company;
        if (!needsFetch) return;

        // First try to get from accounts table (where registration data is stored)
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('email', targetEmail)
          .limit(1);

        // Also try to get from users table (fallback)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', targetEmail)
          .limit(1);

        // Prefer accounts table, but fall back to users table
        const sourceData = accountData && accountData.length > 0 ? accountData[0] : (userData && userData.length > 0 ? userData[0] : null);

        if (sourceData) {
          const acc: any = sourceData;
          // Get first_name and last_name from accounts (registration data)
          // If not in accounts, try to parse from name in users table
          let firstName = acc.first_name;
          let lastName = acc.last_name;
          
          // If not found in accounts, try to parse from name field
          if (!firstName && !lastName && acc.name) {
            const nameParts = acc.name.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          setUserProfile({
            ...userProfile,
            id: acc.id || userProfile?.id,
            email: acc.email || targetEmail,
            name: acc.name || `${firstName} ${lastName}`.trim() || userProfile?.name || targetEmail.split('@')[0],
            first_name: firstName || userProfile?.first_name || '',
            last_name: lastName || userProfile?.last_name || '',
            phone: acc.phone ?? userProfile?.phone,
            location: acc.location ?? acc.locatie ?? userProfile?.location,
            company: acc.company ?? acc.bedrijf ?? userProfile?.company,
            investmentGoal: acc.investment_goal ?? acc.investeringsdoel ?? userProfile?.investmentGoal,
            preferredContact: acc.preferred_contact ?? acc.voorkeurContact ?? userProfile?.preferredContact,
            newsletterSubscription: acc.newsletter_subscription ?? acc.nieuwsbrief ?? userProfile?.newsletterSubscription,
            marketingConsent: acc.marketing_consent ?? acc.marketingToestemming ?? userProfile?.marketingConsent,
            joinDate: (acc.created_at ? new Date(acc.created_at).toISOString().split('T')[0] : userProfile?.joinDate) || new Date().toISOString().split('T')[0],
            lastLogin: acc.last_login ? new Date(acc.last_login).toISOString() : (userProfile?.lastLogin || new Date().toISOString()),
            totalSessions: acc.login_count ?? (userProfile?.totalSessions || 0)
          });
        }
      } catch (err) {
        console.error('ProfilePopup Supabase load error:', err);
      }
    };

    if (isOpen) {
      loadFromSupabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const [formData, setFormData] = useState({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    company: userProfile?.company || '',
    bio: userProfile?.bio || '',
    investmentGoal: userProfile?.investmentGoal || '',
    preferredContact: userProfile?.preferredContact || 'email',
    newsletterSubscription: userProfile?.newsletterSubscription || false,
    marketingConsent: userProfile?.marketingConsent || false
  });

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        company: userProfile.company || '',
        bio: userProfile.bio || '',
        investmentGoal: userProfile.investmentGoal || '',
        preferredContact: userProfile.preferredContact || 'email',
        newsletterSubscription: userProfile.newsletterSubscription || false,
        marketingConsent: userProfile.marketingConsent || false
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      const targetEmail = (userProfile?.email) || (isImpersonating && impersonatedUser) || user?.email;
      if (!targetEmail) throw new Error('Geen e-mailadres beschikbaar om profiel te updaten');

      const updatePayload: any = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        phone: formData.phone || null,
        location: formData.location || null,
        company: formData.company || null,
        investment_goal: formData.investmentGoal || null,
        preferred_contact: formData.preferredContact || null,
        newsletter_subscription: !!formData.newsletterSubscription,
        marketing_consent: !!formData.marketingConsent,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('accounts')
        .update(updatePayload)
        .eq('email', targetEmail)
        .select('*')
        .limit(1);

      if (error) throw error;

      const updated = data && data[0] ? data[0] : null;
      setUserProfile({
        ...userProfile,
        ...formData,
        email: targetEmail,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        location: formData.location,
        company: formData.company,
        investmentGoal: formData.investmentGoal,
        preferredContact: formData.preferredContact,
        newsletterSubscription: formData.newsletterSubscription,
        marketingConsent: formData.marketingConsent,
        lastLogin: updated?.last_login || userProfile?.lastLogin,
        totalSessions: updated?.login_count ?? userProfile?.totalSessions
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Fout bij het opslaan van profiel');
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      company: userProfile?.company || '',
      bio: userProfile?.bio || '',
      investmentGoal: userProfile?.investmentGoal || '',
      preferredContact: userProfile?.preferredContact || 'email',
      newsletterSubscription: userProfile?.newsletterSubscription || false,
      marketingConsent: userProfile?.marketingConsent || false
    });
    setIsEditing(false);
  };

  const handleClose = () => {
    if (isEditing) {
      handleCancel();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 border-2 border-orange-200 dark:border-orange-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
              <User className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mijn Profiel</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Beheer je persoonlijke informatie</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Bewerken
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Opslaan
                </button>
              </div>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voornaam *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || userProfile?.email || (isImpersonating && impersonatedUser) || user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Achternaam</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefoon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locatie</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!isEditing}
                list="nl-cities"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bedrijf/Organisatie</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Over mij</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Investeringsdoel</label>
              <select
                value={formData.investmentGoal}
                onChange={(e) => setFormData({ ...formData, investmentGoal: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Selecteer je investeringsdoel</option>
                <option value="short_term">Korte termijn (1-2 jaar)</option>
                <option value="medium_term">Middellange termijn (3-5 jaar)</option>
                <option value="long_term">Lange termijn (5+ jaar)</option>
                <option value="retirement">Pensioen</option>
                <option value="wealth_building">Vermogensopbouw</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voorkeur Contact</label>
              <select
                value={formData.preferredContact}
                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="email">Email</option>
                <option value="phone">Telefoon</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nieuwsbrief</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ontvang updates over Bitcoin en investeringen</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.newsletterSubscription}
                    onChange={(e) => setFormData({ ...formData, newsletterSubscription: e.target.checked })}
                    disabled={!isEditing}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Toestemming</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ontvang informatie over nieuwe producten en diensten</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    disabled={!isEditing}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* NL cities datalist for location autocomplete */}
        <datalist id="nl-cities">
          <option value="Amsterdam" />
          <option value="Rotterdam" />
          <option value="Den Haag" />
          <option value="Utrecht" />
          <option value="Groningen" />
          <option value="Eindhoven" />
          <option value="Tilburg" />
          <option value="Almere" />
          <option value="Breda" />
          <option value="Nijmegen" />
          <option value="Apeldoorn" />
          <option value="Haarlem" />
          <option value="Enschede" />
          <option value="Amersfoort" />
          <option value="Zaanstad" />
          <option value="'s-Hertogenbosch" />
          <option value="Zwolle" />
          <option value="Zoetermeer" />
          <option value="Leiden" />
          <option value="Dordrecht" />
          <option value="Ede" />
          <option value="Leeuwarden" />
          <option value="Maastricht" />
          <option value="Arnhem" />
          <option value="Gouda" />
          <option value="Goes" />
          <option value="Gorinchem" />
          <option value="Geleen" />
        </datalist>
      </div>
    </div>
  );
}
