import { BookOpen, Shield, Lightbulb, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

const educationCards = [
  {
    icon: BookOpen,
    title: 'Wat is Bitcoin?',
    description: 'Bitcoin is de eerste en bekendste cryptocurrency. Het is digitaal geld dat werkt zonder banken of overheden.',
    points: [
      'Gedecentraliseerd netwerk zonder centrale controle',
      'Beperkte voorraad van 21 miljoen coins',
      'Werkt met blockchain technologie',
      'Peer-to-peer transacties zonder tussenpersoon'
    ],
    color: 'orange'
  },
  {
    icon: Lightbulb,
    title: 'Wat is DCA?',
    description: 'Dollar Cost Averaging betekent regelmatig een vast bedrag investeren, ongeacht de prijs.',
    points: [
      'Vermindert het risico van market timing',
      'Gemiddelde aankoopprijs over tijd',
      'Emotie uit investeren halen',
      'Geschikt voor lange termijn strategie'
    ],
    color: 'blue'
  },
  {
    icon: AlertTriangle,
    title: 'Risico\'s & Volatiliteit',
    description: 'Crypto is zeer volatiel en kent grote prijsschommelingen. Investeer alleen wat je kunt missen.',
    points: [
      'Prijzen kunnen 50%+ dalen in korte tijd',
      'Geen garantie op rendement',
      'Houdt altijd langetermijnperspectief aan',
      'Diversificeer je investeringen'
    ],
    color: 'red'
  },
  {
    icon: Shield,
    title: 'Veiligheid & Opslag',
    description: 'De veiligheid van je crypto begint bij jezelf. Leer hoe je je investeringen beschermt.',
    points: [
      'Gebruik betrouwbare exchanges',
      'Hardware wallet voor grote bedragen',
      'Bewaar je seed phrase veilig offline',
      'Deel nooit je private keys'
    ],
    color: 'green'
  }
];

const colorClasses = {
  orange: {
    bg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-900'
  },
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-900'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-900'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-900'
  }
};

export default function EducationSection() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Leer de Basis</h2>
        <p className="text-gray-600">
          Voordat je begint met investeren, is het belangrijk om de fundamenten te begrijpen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {educationCards.map((card, index) => {
          const Icon = card.icon;
          const colors = colorClasses[card.color as keyof typeof colorClasses];

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-6 transition-all hover:shadow-lg`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`${colors.icon} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
                    {card.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {card.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className={`${colors.text} mt-1 flex-shrink-0`}>•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-3">Belangrijke Waarschuwing</h3>
        <p className="text-gray-200 leading-relaxed">
          Investeren in cryptocurrency kent risico's. De informatie op deze site is educatief en geen financieel advies.
          Doe altijd je eigen onderzoek en investeer alleen geld dat je kunt missen. Historische prestaties zijn geen
          garantie voor toekomstige resultaten.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Veelgestelde Vragen
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-3">Is DCA altijd de beste strategie?</h4>
            <p className="text-sm text-blue-800">
              DCA is een goede strategie voor beginners omdat het risico verspreidt. Het is echter niet altijd de meest winstgevende strategie.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-900 mb-3">Hoe vaak moet ik DCA doen?</h4>
            <p className="text-sm text-green-800">
              Maandelijks is de meest populaire frequentie, maar je kunt ook wekelijks of driemaandelijks doen. Belangrijker is consistentie.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h4 className="font-semibold text-orange-900 mb-3">Wat als de prijs blijft dalen?</h4>
            <p className="text-sm text-orange-800">
              DCA werkt juist goed tijdens dalende markten omdat je meer coins koopt voor hetzelfde geld.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h4 className="font-semibold text-purple-900 mb-3">Hoeveel moet ik investeren?</h4>
            <p className="text-sm text-purple-800">
              Investeer alleen wat je kunt missen. Begin klein en verhoog geleidelijk. Een vuistregel is 5-10% van je inkomen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
