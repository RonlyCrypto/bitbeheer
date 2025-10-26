import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
}

export default function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🎉 Welkom bij BitBeheer!</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Hallo {userName}! 👋
            </h3>
            <p className="text-gray-600">
              Geweldig dat je je account hebt geactiveerd. Laat me je vertellen wat BitBeheer voor je kan betekenen.
            </p>
          </div>

          {/* What we offer */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              🎯 Wat BitBeheer voor je doet:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">💡</span>
                <div>
                  <h5 className="font-medium text-gray-800">Persoonlijke 1-op-1 Begeleiding</h5>
                  <p className="text-sm text-gray-600">Direct contact met Giovanni voor al je Bitcoin vragen</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">🔐</span>
                <div>
                  <h5 className="font-medium text-gray-800">Veilig Bitcoin Kopen & Bewaren</h5>
                  <p className="text-sm text-gray-600">Leer de beste en veiligste manieren om Bitcoin te kopen en op te slaan</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">📊</span>
                <div>
                  <h5 className="font-medium text-gray-800">Eigen Beheer Opzetten</h5>
                  <p className="text-sm text-gray-600">Zet je eigen Bitcoin beheer systeem op, volledig onder jouw controle</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">🛠️</span>
                <div>
                  <h5 className="font-medium text-gray-800">Tools & Resources</h5>
                  <p className="text-sm text-gray-600">Toegang tot alle Bitcoin tools, charts en educatieve content</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-orange-800 mb-3">
              🚀 Volgende Stappen:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700">
              <li>Verken je dashboard en de beschikbare tools</li>
              <li>Plan een kennismakingsgesprek met Giovanni</li>
              <li>Stel je Bitcoin investeringsdoelen vast</li>
              <li>Begin met veilig Bitcoin kopen en bewaren</li>
            </ol>
          </div>

          {/* Contact info */}
          <div className="text-center bg-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">📞 Direct Contact</h4>
            <p className="text-sm text-gray-600 mb-2">
              Heb je vragen? Giovanni staat klaar om je te helpen!
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-orange-600 font-medium">📧 update@bitbeheer.nl</span>
              <span className="text-orange-600 font-medium">🌐 bitbeheer.nl</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Je kunt dit venster sluiten en later opnieuw bekijken
            </p>
            <button
              onClick={onClose}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium"
            >
              Begrepen! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
