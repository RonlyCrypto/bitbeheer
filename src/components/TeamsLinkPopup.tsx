import { useState } from 'react';
import { X, Video } from 'lucide-react';

interface TeamsLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (teamsLink: string) => void;
  appointmentDate: string;
  appointmentTime: string;
}

export default function TeamsLinkPopup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  appointmentDate, 
  appointmentTime 
}: TeamsLinkPopupProps) {
  const [teamsLink, setTeamsLink] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!teamsLink.trim()) {
      setError('Voer een Teams link in');
      return;
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(teamsLink)) {
      setError('Voer een geldige URL in');
      return;
    }

    onConfirm(teamsLink.trim());
    setTeamsLink('');
    setError('');
  };

  const handleSkip = () => {
    onConfirm('');
    setTeamsLink('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6" />
              <h2 className="text-xl font-bold">Teams Link Toevoegen</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-700 mb-2">
              Afspraak bevestigd voor:
            </p>
            <p className="font-semibold text-gray-900">
              {new Date(appointmentDate).toLocaleDateString('nl-NL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} om {appointmentTime}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Microsoft Teams Link (optioneel)
            </label>
            <input
              type="url"
              value={teamsLink}
              onChange={(e) => {
                setTeamsLink(e.target.value);
                setError('');
              }}
              placeholder="https://teams.microsoft.com/l/meetup-join/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Voeg een Teams link toe zodat de gebruiker direct kan deelnemen aan het gesprek.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Bevestigen met Link
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Overslaan
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

