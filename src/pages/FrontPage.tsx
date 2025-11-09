import { Bitcoin, Shield, BookOpen, TrendingUp, Users, Target, ArrowRight, CheckCircle, BarChart3, Wallet, Lock, Smartphone, Monitor, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import AnimatedBitcoinBackground from '../components/AnimatedBitcoinBackground';

export default function FrontPage() {
  const { isAuthenticated } = useSupabaseAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <AnimatedBitcoinBackground />
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative z-10">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                <Bitcoin className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Bitcoin Investeren in Nederland - Persoonlijke Begeleiding voor Beginners
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

      {/* My Story Section - Only for logged in users */}
      {isAuthenticated && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Het Verhaal van BitBeheer
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Waarom we BitBeheer hebben opgericht en wat we willen bereiken
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    Waarom BitBeheer bestaat
                  </h3>
                  <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                    <p>
                      BitBeheer is ontstaan uit de behoefte om mensen te helpen veilig en verstandig te investeren in Bitcoin. 
                      Sinds 2017 hebben we gezien hoe de cryptomarkt groeide, maar ook hoe veel beginners hun geld kwijtraakten door gebrek aan kennis, 
                      verkeerde keuzes en oplichting. Zonder de juiste begeleiding kan investeren in Bitcoin al snel overweldigend zijn.
                    </p>
                    <p>
                      Steeds meer mensen willen investeren in Bitcoin, maar weten niet waar ze moeten beginnen. Er is veel informatie beschikbaar, 
                      maar veel ervan is verwarrend, misleidend of gericht op hype. Veel beginners verliezen geld door niet te weten welke exchanges 
                      betrouwbaar zijn, Bitcoin op exchanges te bewaren in plaats van eigen beheer, of te vallen voor scams en oplichting.
                    </p>
                    <p>
                      <strong>Daarom hebben we BitBeheer opgericht.</strong> We willen mensen helpen die interesse hebben in Bitcoin, maar niet goed weten waar ze moeten beginnen. 
                      Met persoonlijke 1-op-1 begeleiding, praktische kennis en echte voorbeelden helpen we je stap voor stap om veilig Bitcoin te kopen en in eigen beheer te houden.
                    </p>
                    <p className="text-orange-600 font-semibold">
                      Ons doel is duidelijk: mensen helpen begrijpen hoe je veilig Bitcoin aankoopt en in eigen beheer bewaart, zonder poespas, zonder hype, gewoon eerlijk en duidelijk. 
                      Bitcoin voor beginners in Nederland, met Nederlandse begeleiding.
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-orange-500 p-3 rounded-xl">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Wat We Willen Bereiken</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">Bitcoin veilig kopen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">Weten wanneer je het beste kan instappen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">Versturen en ontvangen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">Bewaren in eigen beheer</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">24/7 elke seconde je balans kunnen inzien</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">Altijd bij je geld kunnen</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 italic">
                      "Bitcoin investeren in Nederland hoeft niet moeilijk te zijn. Met de juiste begeleiding en kennis kun je veilig en verstandig beginnen met Bitcoin."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why We Started Section - Only for NOT logged in users */}
      {!isAuthenticated && (
        <>
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Waarom We Dit Platform Hebben Gestart
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                    Bitcoin investeren kan overweldigend zijn. Wij helpen je stap voor stap om veilig te beginnen.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      De Uitdaging
                    </h3>
                    <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                      <p>
                        Steeds meer mensen willen investeren in Bitcoin, maar weten niet waar ze moeten beginnen. 
                        Er is zoveel informatie beschikbaar, maar veel ervan is verwarrend, misleidend of gericht op hype.
                      </p>
                      <p>
                        Veel beginners verliezen geld door:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Niet weten welke exchanges betrouwbaar zijn</li>
                        <li>Bitcoin bewaren op exchanges in plaats van eigen beheer</li>
                        <li>Gevallen voor scams en oplichting</li>
                        <li>Niet begrijpen van de risico's</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-orange-500 p-3 rounded-xl">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Onze Oplossing</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Persoonlijke 1-op-1 begeleiding</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Veilig Bitcoin kopen en bewaren leren</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Eigen beheer opzetten met hardware wallet</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Portfolio monitoring en beheer tools</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Preview Section */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Wat We Je Bieden
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Een compleet platform om je Bitcoin reis te begeleiden en monitoren
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="bg-orange-100 p-4 rounded-xl w-fit mb-6">
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Dashboard</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Bekijk je Bitcoin portfolio, transacties en waarde ontwikkeling over tijd. Altijd up-to-date en veilig.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <Monitor className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="bg-orange-100 p-4 rounded-xl w-fit mb-6">
                      <Wallet className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Wallet Beheer</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Voeg je Bitcoin wallets toe en volg ze automatisch. Zie je balans, transacties en geschiedenis.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="bg-orange-100 p-4 rounded-xl w-fit mb-6">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Prijs Monitoring</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Volg Bitcoin prijzen in real-time en bekijk historische data. Begrijp markt trends en cycles.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <BarChart3 className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Mobiel & Desktop</h4>
                    </div>
                    <p className="text-gray-600">
                      Toegang tot je portfolio en tools vanaf elk apparaat. Responsive design voor optimale ervaring.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-green-100 p-3 rounded-xl">
                        <Database className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Veilig & Privé</h4>
                    </div>
                    <p className="text-gray-600">
                      Alle data wordt veilig opgeslagen. Jij houdt volledige controle over je informatie en wallets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-0">
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
    </div>
  );
}
