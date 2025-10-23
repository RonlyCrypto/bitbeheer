import { Bitcoin, Clock, Shield, Users, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SoonOnlinePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                <Bitcoin className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Binnenkort Online
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              BitBeheer - Persoonlijke Bitcoin Begeleiding
            </p>
            <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="w-8 h-8" />
                <span className="text-2xl font-bold">We zijn bijna klaar!</span>
              </div>
              <p className="text-orange-100">
                We werken hard aan de laatste details om je de beste Bitcoin begeleiding te kunnen bieden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Wat Komt Er Aan?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Persoonlijke 1-op-1 begeleiding voor Bitcoin investeren
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 text-center">
                <div className="bg-orange-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Veilig Bitcoin Kopen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Leer stap voor stap hoe je veilig Bitcoin koopt via betrouwbare exchanges en wat je moet weten voordat je begint.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
                <div className="bg-blue-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <Bitcoin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Eigen Beheer</h3>
                <p className="text-gray-600 leading-relaxed">
                  Het belangrijkste onderdeel: hoe bewaar je je Bitcoin veilig en houd je volledige controle over je eigen geld.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
                <div className="bg-green-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Persoonlijke Begeleiding</h3>
                <p className="text-gray-600 leading-relaxed">
                  1-op-1 begeleiding op jouw tempo en niveau, met voorbeelden en echte data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Blijf Op De Hoogte
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Wil je op de hoogte blijven van wanneer we live gaan? Laat je gegevens achter en we sturen je een bericht zodra we klaar zijn.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Mail className="w-8 h-8 text-orange-600" />
                <h3 className="text-2xl font-bold text-gray-900">Notificatie Ontvangen</h3>
              </div>
              <p className="text-gray-600 mb-8">
                We sturen je een e-mail zodra BitBeheer live gaat en je kunt beginnen met je Bitcoin begeleiding.
              </p>
              
              <div className="text-center">
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-6 mb-6">
                  <Mail className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Notificatie Formulier Tijdelijk Uitgeschakeld
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Het notificatie formulier is tijdelijk uitgeschakeld voor onderhoud. 
                    We werken aan een betere oplossing.
                  </p>
                  <p className="text-sm text-gray-500">
                    Neem contact op via <strong>update@bitbeheer.nl</strong> voor updates.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Wat Komt Er Aan:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Persoonlijke Bitcoin begeleiding</li>
                      <li>• 1-op-1 sessies op afspraak</li>
                      <li>• Veilig Bitcoin kopen en bewaren</li>
                      <li>• Eigen beheer van je Bitcoin</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Contact:</h4>
                    <p className="text-sm text-green-800">
                      Stuur een e-mail naar <strong>update@bitbeheer.nl</strong> 
                      om op de hoogte te blijven van wanneer BitBeheer live gaat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bitcoin className="w-8 h-8 text-orange-500" />
              <h3 className="text-2xl font-bold text-white">BitBeheer</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Persoonlijke begeleiding voor Bitcoin investeren
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <span>© 2024 BitBeheer</span>
              <span>•</span>
              <span>Binnenkort online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
