import { useState } from 'react';
import { User, Mail, Phone, DollarSign, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AanmeldenPage() {
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    spaargeld: '',
    ervaring: '',
    motivatie: '',
    verwachtingen: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier zou je normaal gesproken de data naar een server sturen
    console.log('Aanmeldingsformulier:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-100 p-8 rounded-2xl mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Aanmelding Ontvangen!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Bedankt voor je interesse. We nemen binnen 24 uur contact met je op 
                om te bespreken hoe we je kunnen helpen.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Wat gebeurt er nu?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-gray-700">We bekijken je aanmelding en financiële situatie</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-gray-700">We bellen je voor een kennismakingsgesprek</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-gray-700">Als we een match zijn, plannen we je eerste sessie</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Terug naar Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Terug naar Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Aanmelden voor Persoonlijke Begeleiding
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vul dit formulier in als je wilt investeren in Bitcoin en persoonlijke begeleiding wilt. 
              We helpen je stap voor stap, met voorbeelden en echte data.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Persoonlijke Gegevens */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-orange-600" />
                  Persoonlijke Gegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volledige Naam *
                    </label>
                    <input
                      type="text"
                      name="naam"
                      value={formData.naam}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Je volledige naam"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mailadres *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="je@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefoonnummer *
                    </label>
                    <input
                      type="tel"
                      name="telefoon"
                      value={formData.telefoon}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="06-12345678"
                    />
                  </div>
                </div>
              </div>

              {/* Investeringsplannen */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                  Investeringsplannen
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wat zijn je plannen voor Bitcoin investeringen? *
                  </label>
                  <select
                    name="spaargeld"
                    value={formData.spaargeld}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selecteer je situatie</option>
                    <option value="wil-investeren">Ik wil graag investeren in Bitcoin</option>
                    <option value="plan-investeren">Ik ben al van plan om te investeren</option>
                    <option value="klein-bedrag">Ik wil beginnen met een klein bedrag</option>
                    <option value="groot-bedrag">Ik wil een substantieel bedrag investeren</option>
                    <option value="onzeker">Ik ben nog onzeker over de hoeveelheid</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    We helpen je bepalen wat verstandig is voor jouw situatie.
                  </p>
                </div>
              </div>

              {/* Ervaring */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                  Jouw Situatie
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wat is je huidige ervaring met Bitcoin en cryptocurrency? *
                    </label>
                    <select
                      name="ervaring"
                      value={formData.ervaring}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Selecteer je ervaringsniveau</option>
                      <option value="beginner">Volledig beginner - nog nooit Bitcoin gekocht</option>
                      <option value="beperkt">Beperkte ervaring - een paar keer gekocht</option>
                      <option value="gemiddeld">Gemiddelde ervaring - regelmatig actief</option>
                      <option value="gevorderd">Gevorderd - veel ervaring met crypto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waarom wil je investeren in Bitcoin? *
                    </label>
                    <textarea
                      name="motivatie"
                      value={formData.motivatie}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Vertel ons waarom je wilt investeren in Bitcoin en wat je hoopt te bereiken..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wat verwacht je van onze begeleiding? *
                    </label>
                    <textarea
                      name="verwachtingen"
                      value={formData.verwachtingen}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Wat hoop je te leren over Bitcoin en hoe zien je ideale begeleiding eruit?"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Aanmelden voor Begeleiding
                </button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Door je aan te melden ga je akkoord dat we contact met je opnemen voor een kennismakingsgesprek.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
