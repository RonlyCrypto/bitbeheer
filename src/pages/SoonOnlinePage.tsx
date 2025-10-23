import { Bitcoin, Clock, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SoonOnlinePage() {
  // Clean page without form - deployed to production

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
