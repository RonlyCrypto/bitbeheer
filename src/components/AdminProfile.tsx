import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Edit, X } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export default function AdminProfile() {
  const { user } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    bio: user?.user_metadata?.bio || 'Administrator van BitBeheer platform',
    role: 'Administrator',
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
    lastLogin: new Date().toLocaleDateString('nl-NL')
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would update the user profile in Supabase
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      console.log('Profile saved:', profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      location: user?.user_metadata?.location || '',
      bio: user?.user_metadata?.bio || 'Administrator van BitBeheer platform',
      role: 'Administrator',
      joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
      lastLogin: new Date().toLocaleDateString('nl-NL')
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mijn Profiel</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Bewerken
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Naam
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefoon
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.phone || 'Niet opgegeven'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Over mij
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.bio}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{profileData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Locatie
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.location || 'Niet opgegeven'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol
              </label>
              <p className="text-gray-900 dark:text-white">{profileData.role}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lid sinds
              </label>
              <p className="text-gray-900 dark:text-white">{profileData.joinDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Laatste login
              </label>
              <p className="text-gray-900 dark:text-white">{profileData.lastLogin}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
