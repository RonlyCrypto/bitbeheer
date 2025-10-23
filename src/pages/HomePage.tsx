import BitcoinHistory from '../components/BitcoinHistory';
import EducationSection from '../components/EducationSection';
import InteractiveTools from '../components/InteractiveTools';
import DataManagement from '../components/DataManagement';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Begrijp Crypto Investeren
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Leer hoe Bitcoin werkt en ontdek wat consistent maandelijks investeren (DCA) historisch
              heeft opgeleverd. Geen hype, alleen feiten en educatie.
            </p>
          </section>

          <div id="bitcoin-history">
            <BitcoinHistory />
          </div>

          <DataManagement />

          <EducationSection />

          <InteractiveTools />

          <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Klaar om te Beginnen?</h2>
            <p className="text-lg text-orange-100 mb-6 max-w-2xl mx-auto">
              Nu je de basis begrijpt, is het tijd om je eigen onderzoek te doen. Gebruik betrouwbare exchanges,
              start klein, en investeer alleen wat je kunt missen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://bitcoin.org/en/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
              >
                Leer Meer over Bitcoin
              </a>
              <a
                href="https://www.investopedia.com/terms/d/dollarcostaveraging.asp"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-800 transition-all"
              >
                Verdiep je in DCA
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
