import { Shield, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';

interface ReferralLink {
  id: string;
  title: string;
  url: string;
  section_title: string;
  order_index: number;
}

export default function Footer() {
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Belangrijke Links');

  useEffect(() => {
    const loadReferralLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('referral_links')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setReferralLinks(data);
          // Use the section_title from the first link (all should have the same)
          setSectionTitle(data[0].section_title || 'Belangrijke Links');
        } else {
          // Fallback to default links if database is empty
          setReferralLinks([
            { id: '1', title: 'Bitcoin.org - Officiële Site', url: 'https://bitcoin.org', section_title: 'Belangrijke Links', order_index: 1 },
            { id: '2', title: 'CoinGecko - Prijsdata', url: 'https://www.coingecko.com', section_title: 'Belangrijke Links', order_index: 2 },
            { id: '3', title: 'Blockchain Explorer', url: 'https://www.blockchain.com/explorer', section_title: 'Belangrijke Links', order_index: 3 }
          ]);
        }
      } catch (error) {
        console.error('Error loading referral links:', error);
        // Fallback to default links
        setReferralLinks([
          { id: '1', title: 'Bitcoin.org - Officiële Site', url: 'https://bitcoin.org', section_title: 'Belangrijke Links', order_index: 1 },
          { id: '2', title: 'CoinGecko - Prijsdata', url: 'https://www.coingecko.com', section_title: 'Belangrijke Links', order_index: 2 },
          { id: '3', title: 'Blockchain Explorer', url: 'https://www.blockchain.com/explorer', section_title: 'Belangrijke Links', order_index: 3 }
        ]);
      }
    };

    loadReferralLinks();

    // Listen for referral links updates
    const handleReferralLinksUpdate = () => {
      loadReferralLinks();
    };

    window.addEventListener('referralLinksUpdated', handleReferralLinksUpdate);

    // Also poll every 5 seconds to catch external updates
    const interval = setInterval(loadReferralLinks, 5000);

    return () => {
      window.removeEventListener('referralLinksUpdated', handleReferralLinksUpdate);
      clearInterval(interval);
    };
  }, []);
  return (
    <footer className="bg-gray-900 text-gray-300 mt-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Over Dit Platform</h3>
            <p className="text-sm leading-relaxed">
              Een educatief platform dat beginners helpt begrijpen hoe cryptocurrency en DCA investeren werkt,
              zonder hype en met focus op lange termijn denken.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Ontdek Meer</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/bitcoin-history" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                  Bitcoin Prijsgeschiedenis
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                  Portfolio Beheer
                </Link>
              </li>
              <li>
                <Link to="/aanmelden" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                  Aanmelden voor Begeleiding
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">{sectionTitle}</h3>
            <ul className="space-y-2 text-sm">
              {referralLinks.map((link) => (
                <li key={link.id}>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-orange-400 transition-colors"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
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
