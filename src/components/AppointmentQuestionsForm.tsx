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

    // Basic validation
    if (questionsData.has_bitcoin_experience === null) {
      newErrors.has_bitcoin_experience = 'Selecteer een antwoord';
    }
    if (questionsData.knows_hardware_wallet === null) {
      newErrors.knows_hardware_wallet = 'Selecteer een antwoord';
    }
    if (questionsData.has_crypto_wallet === null) {
      newErrors.has_crypto_wallet = 'Selecteer een antwoord';
    }
    if (!questionsData.investment_experience) {
      newErrors.investment_experience = 'Selecteer je ervaring';
    }
    if (!questionsData.monthly_investment_budget) {
      newErrors.monthly_investment_budget = 'Selecteer je budget';
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
    <div className="bg-white bg-opacity-10 rounded-lg p-6 mt-4">
      <div className="space-y-6">
        {/* Question 1 */}
        <div>
          <label className="block text-white font-semibold mb-2">
            1. Ben je ooit wel eens in bezit geweest van Bitcoin?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('has_bitcoin_experience', true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.has_bitcoin_experience === true
                  ? 'bg-white text-green-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => handleChange('has_bitcoin_experience', false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.has_bitcoin_experience === false
                  ? 'bg-white text-green-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Nee
            </button>
          </div>
          {errors.has_bitcoin_experience && (
            <p className="text-red-200 text-sm mt-1">{errors.has_bitcoin_experience}</p>
          )}
        </div>

        {/* Question 2 */}
        <div>
          <label className="block text-white font-semibold mb-2">
            2. Weet je wat een hardware wallet is?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('knows_hardware_wallet', true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.knows_hardware_wallet === true
                  ? 'bg-white text-green-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => handleChange('knows_hardware_wallet', false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.knows_hardware_wallet === false
                  ? 'bg-white text-green-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Nee
            </button>
          </div>
          {errors.knows_hardware_wallet && (
            <p className="text-red-200 text-sm mt-1">{errors.knows_hardware_wallet}</p>
          )}
        </div>

        {/* Question 3 */}
        <div>
          <label className="block text-white font-semibold mb-2">
            3. Heb je al een crypto wallet (hardware of software)?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('has_crypto_wallet', true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.has_crypto_wallet === true
                  ? 'bg-white text-green-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => handleChange('has_crypto_wallet', false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                questionsData.has_crypto_wallet === false
                  ? 'bg-white text-green-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Nee
            </button>
          </div>
          {errors.has_crypto_wallet && (
            <p className="text-red-200 text-sm mt-1">{errors.has_crypto_wallet}</p>
          )}
        </div>

        {/* Question 4 */}
        <div>
          <label className="block text-white font-semibold mb-2">
            4. Wat is je ervaring met investeren?
          </label>
          <select
            value={questionsData.investment_experience}
            onChange={(e) => handleChange('investment_experience', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:ring-2 focus:ring-white focus:border-white"
          >
            <option value="">Selecteer...</option>
            <option value="beginner" className="text-gray-900">Beginner - Nog geen ervaring</option>
            <option value="intermediate" className="text-gray-900">Gemiddeld - Enige ervaring met traditionele investeringen</option>
            <option value="advanced" className="text-gray-900">Gevorderd - Ervaring met crypto/bitcoin</option>
          </select>
          {errors.investment_experience && (
            <p className="text-red-200 text-sm mt-1">{errors.investment_experience}</p>
          )}
        </div>

        {/* Question 5 */}
        <div>
          <label className="block text-white font-semibold mb-2">
            5. Wat is je maandelijks investeringsbudget voor Bitcoin?
          </label>
          <select
            value={questionsData.monthly_investment_budget}
            onChange={(e) => handleChange('monthly_investment_budget', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:ring-2 focus:ring-white focus:border-white"
          >
            <option value="">Selecteer...</option>
            <option value="< 100" className="text-gray-900">Minder dan €100</option>
            <option value="100-500" className="text-gray-900">€100 - €500</option>
            <option value="500-1000" className="text-gray-900">€500 - €1.000</option>
            <option value="> 1000" className="text-gray-900">Meer dan €1.000</option>
          </select>
          {errors.monthly_investment_budget && (
            <p className="text-red-200 text-sm mt-1">{errors.monthly_investment_budget}</p>
          )}
        </div>

        {/* Question 6 */}
        <div>
          <label className="block text-white font-semibold mb-2">
            6. Wat is je hoofddoel met Bitcoin?
          </label>
          <select
            value={questionsData.main_goal}
            onChange={(e) => handleChange('main_goal', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:ring-2 focus:ring-white focus:border-white"
          >
            <option value="">Selecteer...</option>
            <option value="long_term" className="text-gray-900">Langetermijn opslag / HODL</option>
            <option value="dca" className="text-gray-900">DCA (Dollar Cost Averaging) strategie</option>
            <option value="trading" className="text-gray-900">Handelen / Trading</option>
            <option value="education" className="text-gray-900">Leren en begrijpen</option>
            <option value="diversification" className="text-gray-900">Portfolio diversificatie</option>
          </select>
          {errors.main_goal && (
            <p className="text-red-200 text-sm mt-1">{errors.main_goal}</p>
          )}
        </div>

        {/* Question 7 - Open text */}
        <div>
          <label className="block text-white font-semibold mb-2">
            7. Heb je specifieke vragen of zorgen waar we het tijdens het gesprek over kunnen hebben?
          </label>
          <textarea
            value={questionsData.questions_or_concerns || ''}
            onChange={(e) => handleChange('questions_or_concerns', e.target.value)}
            rows={4}
            placeholder="Typ hier je vragen of zorgen..."
            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-green-200 border border-white border-opacity-30 focus:ring-2 focus:ring-white focus:border-white resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}

