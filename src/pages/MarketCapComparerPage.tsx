import MarketCapComparer from '../components/ComparisonTool';

export default function MarketCapComparerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Market Cap Vergelijker
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Vergelijk cryptocurrencies op basis van hun marktkapitalisatie en ontdek de potentiële waarde van verschillende coins.
            </p>
          </section>

          {/* Market Cap Comparer Component */}
          <div id="market-cap-comparer">
            <MarketCapComparer />
          </div>
        </div>
      </main>
    </div>
  );
}
