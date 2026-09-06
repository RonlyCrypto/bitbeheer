import { useState } from 'react';
import { User, Mail, Phone, DollarSign, MessageSquare, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { signUpUser } from '../lib/supabase';

export default function AanmeldenPage() {
  const [formData, setFormData] = useState({
    voornaam: '',
    achternaam: '',
    email: '',
    telefoon: '',
    geboortejaar: '',
    locatie: '',
    spaargeld: '',
    ervaring: '',
    motivatie: '',
    verwachtingen: '',
    bedrijf: '',
    investeringsdoel: '',
    voorkeurContact: 'email',
    nieuwsbrief: false,
    marketingToestemming: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      const newErrors: Record<string, boolean> = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.voornaam?.trim()) newErrors.voornaam = true;
      if (!formData.achternaam?.trim()) newErrors.achternaam = true;
      if (!formData.email?.trim() || !emailRegex.test(formData.email)) newErrors.email = true;
      if (!formData.telefoon?.trim()) newErrors.telefoon = true;
      const geboortejaarNum = Number(formData.geboortejaar);
      const currentYear = new Date().getFullYear();
      if (!formData.geboortejaar?.trim() || !Number.isInteger(geboortejaarNum) || geboortejaarNum < 1900 || geboortejaarNum > currentYear) newErrors.geboortejaar = true;

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        setIsLoading(false);
        setMessage({ type: 'error', text: 'Controleer de gemarkeerde velden en probeer opnieuw.' });
        const firstErrorName = Object.keys(newErrors)[0];
        const el = document.querySelector(`[name="${firstErrorName}"]`) as HTMLElement | null;
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Create complete account with all form data
      const accountResponse = await fetch('/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          voornaam: formData.voornaam,
          achternaam: formData.achternaam,
          telefoon: formData.telefoon,
          geboortejaar: formData.geboortejaar,
          locatie: formData.locatie,
          spaargeld: formData.spaargeld,
          ervaring: formData.ervaring,
          motivatie: formData.motivatie,
          verwachtingen: formData.verwachtingen,
          bedrijf: formData.bedrijf,
          investeringsdoel: formData.investeringsdoel,
          voorkeurContact: formData.voorkeurContact,
          nieuwsbrief: formData.nieuwsbrief,
          marketingToestemming: formData.marketingToestemming
        }),
      });

      if (accountResponse.ok) {
        const result = await accountResponse.json();
        console.log('Account created successfully:', result);
        
        setMessage({ 
          type: 'success', 
          text: 'Account succesvol aangemaakt! Je kunt nu inloggen met je e-mailadres. We nemen binnen 24 uur contact met je op.' 
        });
        setIsSubmitted(true);
      } else {
        let errorData: any = null;
        try { errorData = await accountResponse.json(); } catch {}
        console.error('Account creation failed:', errorData || accountResponse.statusText);
        // Duplicate e-mail: highlight field
        if (accountResponse.status === 409 || errorData?.details === 'duplicate_email') {
          setFieldErrors({ ...fieldErrors, email: true });
          setMessage({ type: 'error', text: 'Dit e-mailadres is al in gebruik.' });
        } else if (accountResponse.status >= 500) {
          // Graceful fallback: toon succes zoals voorheen, omdat account vaak wel is aangemaakt
          setIsSubmitted(true);
          setMessage({ 
            type: 'success', 
            text: 'Account succesvol aangemaakt! Controleer je e-mail en klik op de verificatielink om te activeren.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Er is een fout opgetreden bij het aanmaken van je account. Probeer het opnieuw.' 
          });
        }
      }
    } catch (error) {
      console.error('Account creation error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-100 p-8 rounded-2xl mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Account Aangemaakt! 🎉
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Je account is succesvol aangemaakt. Controleer je e-mail en klik op de verificatie link 
                om je account te activeren en toegang te krijgen tot je persoonlijke dashboard.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Wat gebeurt er nu?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-gray-700">Controleer je e-mail en klik op de verificatie link</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-gray-700">Je account wordt geactiveerd en je krijgt toegang tot je dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-gray-700">We nemen contact met je op voor een kennismakingsgesprek</span>
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
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <style>
                {`
                  @keyframes bb-blink-red {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
                    50% { box-shadow: 0 0 0 3px rgba(239,68,68,0.35); }
                  }
                  .bb-error-field {
                    background-color: #FFFBEB; /* amber-50 */
                    border-color: #EF4444 !important; /* red-500 */
                    animation: bb-blink-red 0.6s ease-in-out 3;
                  }
                `}
              </style>
              {/* Persoonlijke Gegevens */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-orange-600" />
                  Persoonlijke Gegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voornaam *
                    </label>
                    <input
                      type="text"
                      name="voornaam"
                      value={formData.voornaam}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${fieldErrors.voornaam ? 'bb-error-field' : 'border-gray-300'}`}
                      placeholder="Je voornaam"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Achternaam *
                    </label>
                    <input
                      type="text"
                      name="achternaam"
                      value={formData.achternaam}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${fieldErrors.achternaam ? 'bb-error-field' : 'border-gray-300'}`}
                      placeholder="Je achternaam"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Locatie <span className="text-gray-400 font-normal">(optioneel)</span>
                    </label>
                    <input
                      type="text"
                      name="locatie"
                      value={formData.locatie}
                      onChange={handleChange}
                      list="nl-cities"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${fieldErrors.locatie ? 'bb-error-field' : 'border-gray-300'}`}
                      placeholder="Stad, Land"
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${fieldErrors.email ? 'bb-error-field' : 'border-gray-300'}`}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${fieldErrors.telefoon ? 'bb-error-field' : 'border-gray-300'}`}
                      placeholder="06-12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geboortejaar *
                    </label>
                    <input
                      type="number"
                      name="geboortejaar"
                      value={formData.geboortejaar}
                      onChange={handleChange}
                      required
                      min={1900}
                      max={new Date().getFullYear()}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${fieldErrors.geboortejaar ? 'bb-error-field' : 'border-gray-300'}`}
                      placeholder="1990"
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

              {/* Aanvullende Informatie */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-600" />
                  Aanvullende Informatie (Optioneel)
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrijf/Organisatie
                    </label>
                    <input
                      type="text"
                      name="bedrijf"
                      value={formData.bedrijf}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Je werkgever of bedrijf"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investeringsdoel
                    </label>
                    <select
                      name="investeringsdoel"
                      value={formData.investeringsdoel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Selecteer je investeringsdoel</option>
                      <option value="pensioen">Pensioen opbouw</option>
                      <option value="sparen">Lange termijn sparen</option>
                      <option value="trading">Actief trading</option>
                      <option value="diversificatie">Portfolio diversificatie</option>
                      <option value="leren">Leren over Bitcoin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voorkeur Contact
                    </label>
                    <select
                      name="voorkeurContact"
                      value={formData.voorkeurContact}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="email">E-mail</option>
                      <option value="telefoon">Telefoon</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>
                
                {/* Checkboxes */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="nieuwsbrief"
                      checked={formData.nieuwsbrief}
                      onChange={(e) => setFormData({...formData, nieuwsbrief: e.target.checked})}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Ik wil graag de nieuwsbrief ontvangen met Bitcoin updates en tips
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="marketingToestemming"
                      checked={formData.marketingToestemming}
                      onChange={(e) => setFormData({...formData, marketingToestemming: e.target.checked})}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Ik geef toestemming voor marketing communicatie over Bitcoin gerelateerde diensten
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Account Aanmaken...
                    </>
                  ) : (
                    'Account Aanmaken & Aanmelden'
                  )}
                </button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Door je aan te melden ga je akkoord dat we contact met je opnemen voor een kennismakingsgesprek.
                </p>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
