import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface AppointmentQuestionsFormProps {
  appointmentId: string;
  questionsData: any;
  setQuestionsData: (data: any) => void;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}

export default function AppointmentQuestionsForm({
  questionsData,
  setQuestionsData,
  onClose,
  onSave,
  isSaving
}: AppointmentQuestionsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setQuestionsData({
      ...questionsData,
      [field]: value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Basic validation - only required questions
    if (questionsData.has_bitcoin_experience === null) {
      newErrors.has_bitcoin_experience = 'Selecteer een antwoord';
    }
    if (questionsData.knows_hardware_wallet === null) {
      newErrors.knows_hardware_wallet = 'Selecteer een antwoord';
    }
    if (!questionsData.main_goal) {
      newErrors.main_goal = 'Selecteer je hoofddoel';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave(questionsData);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6 mt-4 border border-gray-300">
      <div className="space-y-6">
        {/* Question 1 */}
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            1. Ben je ooit wel eens in bezit geweest van Bitcoin?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('has_bitcoin_experience', true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.has_bitcoin_experience === true
                  ? 'bg-gray-800 text-white border-2 border-gray-800'
                  : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-500'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => handleChange('has_bitcoin_experience', false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.has_bitcoin_experience === false
                  ? 'bg-gray-800 text-white border-2 border-gray-800'
                  : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-500'
              }`}
            >
              Nee
            </button>
          </div>
          {errors.has_bitcoin_experience && (
            <p className="text-red-600 text-sm mt-1">{errors.has_bitcoin_experience}</p>
          )}
        </div>

        {/* Question 2 */}
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            2. Weet je wat een hardware wallet is?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('knows_hardware_wallet', true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.knows_hardware_wallet === true
                  ? 'bg-gray-800 text-white border-2 border-gray-800'
                  : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-500'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => handleChange('knows_hardware_wallet', false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.knows_hardware_wallet === false
                  ? 'bg-gray-800 text-white border-2 border-gray-800'
                  : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-500'
              }`}
            >
              Nee
            </button>
          </div>
          {errors.knows_hardware_wallet && (
            <p className="text-red-600 text-sm mt-1">{errors.knows_hardware_wallet}</p>
          )}
        </div>

        {/* Question 6 - Moved up */}
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            3. Wat is je hoofddoel met Bitcoin?
          </label>
          <select
            value={questionsData.main_goal}
            onChange={(e) => handleChange('main_goal', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="">Selecteer...</option>
            <option value="long_term" className="text-gray-900">Langetermijn opslag / HODL</option>
            <option value="dca" className="text-gray-900">DCA (Dollar Cost Averaging) strategie</option>
            <option value="trading" className="text-gray-900">Handelen / Trading</option>
            <option value="education" className="text-gray-900">Leren en begrijpen</option>
            <option value="diversification" className="text-gray-900">Portfolio diversificatie</option>
          </select>
          {errors.main_goal && (
            <p className="text-red-600 text-sm mt-1">{errors.main_goal}</p>
          )}
        </div>

        {/* Question 7 - Open text */}
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            4. Heb je specifieke vragen of zorgen waar we het tijdens het gesprek over kunnen hebben?
          </label>
          <textarea
            value={questionsData.questions_or_concerns || ''}
            onChange={(e) => handleChange('questions_or_concerns', e.target.value)}
            rows={4}
            placeholder="Typ hier je vragen of zorgen..."
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none placeholder-gray-400"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-800 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}

