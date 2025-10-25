import { Shield, Heart } from 'lucide-react';
import AdminLogin from './AdminLogin';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Over Dit Platform</h3>
            <p className="text-sm leading-relaxed">
              Een educatief platform dat beginners helpt begrijpen hoe cryptocurrency en DCA investeren werkt,
              zonder hype en met focus op lange termijn denken.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Belangrijke Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                  Bitcoin.org - Officiële Site
                </a>
              </li>
              <li>
                <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                  CoinGecko - Prijsdata
                </a>
              </li>
              <li>
                <a href="https://www.blockchain.com/explorer" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                  Blockchain Explorer
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Disclaimer</h3>
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                Deze site biedt educatieve informatie en geen financieel advies. Investeer verantwoord en doe je eigen onderzoek.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} BitBeheer. Persoonlijke begeleiding bij het investeren in Bitcoin.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Gemaakt met</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>voor crypto beginners</span>
            </div>
            <AdminLogin />
          </div>
        </div>
      </div>
    </footer>
  );
}
