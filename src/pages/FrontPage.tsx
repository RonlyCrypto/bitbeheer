import { Bitcoin, Shield, BookOpen, TrendingUp, Users, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FrontPage() {
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
              Persoonlijke Bitcoin Begeleiding
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Persoonlijke 1-op-1 begeleiding voor mensen die willen investeren in Bitcoin. 
              Leer veilig Bitcoin kopen, bewaren en in eigen beheer houden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/aanmelden"
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Aanmelden voor Begeleiding
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ons Verhaal
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Waarom we dit platform hebben gemaakt en hoe we jou kunnen helpen
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Persoonlijke Begeleiding voor Bitcoin Investeren
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Wij helpen mensen die willen investeren in Bitcoin om dit veilig en verstandig te doen. 
                  Geen groepslessen of online cursussen, maar persoonlijke 1-op-1 begeleiding 
                  op jouw tempo en niveau, op afspraak.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We leren je alles met voorbeelden en echte data, zodat je volledig begrijpt wat je doet 
                  voordat je daadwerkelijk investeert. Stap voor stap, zonder haast.
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-orange-500 p-3 rounded-xl">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">Met Echte Data & Voorbeelden</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We leggen alles uit met voorbeelden en echte data. Geen theorie, 
                  maar praktische kennis die je direct kunt toepassen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Wat We Je Leren
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Persoonlijke begeleiding in drie essentiële stappen
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-orange-100 p-4 rounded-xl w-fit mb-6">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Hoe Koop Je Bitcoin</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We leren je stap voor stap hoe je veilig Bitcoin koopt via betrouwbare exchanges 
                  en wat je moet weten voordat je begint.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Welke exchanges zijn betrouwbaar?
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Hoe maak je een account aan?
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Wat zijn de kosten en risico's?
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-orange-100 p-4 rounded-xl w-fit mb-6">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Veilig Bewaren</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Het belangrijkste onderdeel: hoe bewaar je je Bitcoin veilig en houd je 
                  volledige controle over je eigen geld.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Wat zijn hardware wallets?
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Hoe bewaar je je private keys?
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Wat zijn de risico's van exchanges?
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-orange-100 p-4 rounded-xl w-fit mb-6">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Eigen Beheer</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  De ultieme stap: volledige controle over je Bitcoin. 
                  Geen derde partijen, geen risico's, alleen jij en je Bitcoin.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Wat betekent "not your keys, not your coins"?
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Hoe stel je een backup in?
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Wat als je je wallet verliest?
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Voor Wie is Dit Bedoeld?
              </h2>
              <p className="text-xl text-gray-600">
                We helpen mensen die serieus willen investeren in Bitcoin
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mensen die Willen Investeren</h3>
                    <p className="text-gray-600">
                      We helpen mensen die al van plan zijn om te investeren of graag willen 
                      investeren in Bitcoin. Je hoeft nog niet te weten hoe, dat leren we je.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">1-op-1 Begeleiding</h3>
                    <p className="text-gray-600">
                      Geen groepslessen of online cursussen. Persoonlijke begeleiding 
                      op jouw tempo en niveau, op afspraak.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Uitleg met Voorbeelden</h3>
                    <p className="text-gray-600">
                      We leggen alles uit met voorbeelden en echte data. Voordat je investeert, 
                      begrijp je precies wat je doet en waarom.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Onze Aanpak</h3>
                <blockquote className="text-lg text-gray-700 italic mb-6">
                  "We helpen mensen die willen investeren in Bitcoin om dit veilig en verstandig te doen. 
                  Met voorbeelden en echte data, stap voor stap, zonder haast."
                </blockquote>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-full">
                      <Bitcoin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Persoonlijke Begeleiding</p>
                      <p className="text-gray-600 text-sm">1-op-1, op jouw tempo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-full">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Veilig & Verstandig</p>
                      <p className="text-gray-600 text-sm">Geen risico's, alleen kennis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Wil Je Investeren in Bitcoin?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Als je wilt investeren in Bitcoin en persoonlijke begeleiding wilt, 
              dan zijn wij er voor je. Met voorbeelden en echte data, stap voor stap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/aanmelden"
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Aanmelden voor Begeleiding
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
