import { useState, useEffect } from 'react';
import { Bitcoin, BookOpen, ArrowRight, Shield, TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
}

const slides: Slide[] = [
  {
    id: 1,
    title: '',
    subtitle: '',
    description: 'Laat ons de kennis en skills geven om je eigen Bitcoin in eigen beheer te houden.',
    icon: <Bitcoin className="w-16 h-16" />,
    keywords: ['Bitcoin eigen beheer', 'Bitcoin kennis', 'Bitcoin skills', 'Bitcoin begeleiding']
  },
  {
    id: 2,
    title: '',
    subtitle: '',
    description: '24/7 toegang tot je funds waar niemand bij kan, alleen jij.',
    icon: <Shield className="w-16 h-16" />,
    keywords: ['Bitcoin toegang', 'Bitcoin privacy', 'Bitcoin veiligheid', 'Bitcoin controle']
  },
  {
    id: 3,
    title: '',
    subtitle: '',
    description: 'Volledige controle over je eigen geld, zonder tussenpersonen. Veilig, privé en altijd beschikbaar.',
    icon: <Lock className="w-16 h-16" />,
    keywords: ['Bitcoin controle', 'Bitcoin veiligheid', 'Bitcoin privé', 'Bitcoin beschikbaar']
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBitcoinText, setShowBitcoinText] = useState(false);
  const [slidePhase, setSlidePhase] = useState<'together' | 'sliding' | 'fading'>('together');

  // Start with Bit and beheer together, then slide apart
  useEffect(() => {
    // Start with Bit and beheer together
    setSlidePhase('together');
    setTimeout(() => {
      // After 2 seconds, start sliding apart
      setSlidePhase('sliding');
      setTimeout(() => {
        // After sliding, fade in coin in eigen
        setShowBitcoinText(true);
        setSlidePhase('fading');
      }, 1200); // Wait for slide animation to complete
    }, 2000); // Wait 2 seconds before sliding
  }, []);

  // Auto-advance main slides - start later after animation completes
  useEffect(() => {
    if (!showBitcoinText) return;

    let intervalId: NodeJS.Timeout | null = null;

    const sliderTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000); // Change slide every 4 seconds
    }, 5000); // Start slider 5 seconds after animation completes (later)

    return () => {
      clearTimeout(sliderTimer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [showBitcoinText]);

  const goToSlide = (index: number) => {
    if (index !== currentSlide && !isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative z-10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Animated Brand Name - Fixed height container */}
          <div className="text-center mb-4 h-[100px] md:h-[120px] flex flex-col items-center justify-center">
            <div className="relative w-full mb-3 h-full flex items-center justify-center">
              <div className="text-4xl md:text-6xl font-bold tracking-tight text-center flex items-center justify-center h-full">
                <span className={`inline-block transition-all duration-700 ${
                  slidePhase === 'together' ? 'mr-0' :
                  slidePhase === 'sliding' ? 'mr-0 animate-slide-left' :
                  'mr-0'
                }`}>
                  Bit
                </span>
                <span className={`inline-block text-orange-200 transition-all duration-700 ${
                  slidePhase === 'together' || slidePhase === 'sliding' ? 'opacity-0 w-0 mx-0 overflow-hidden' :
                  'opacity-100 mx-0'
                }`}>
                  coin
                </span>
                <span className={`inline-block text-orange-200 transition-all duration-700 ${
                  slidePhase === 'together' || slidePhase === 'sliding' ? 'opacity-0 w-0 ml-0 overflow-hidden' :
                  'opacity-100 ml-1 md:ml-1.5'
                }`}>
                  in eigen
                </span>
                <span className={`inline-block transition-all duration-700 ${
                  slidePhase === 'together' ? 'ml-0' :
                  slidePhase === 'sliding' ? 'ml-0 animate-slide-right' :
                  'ml-1 md:ml-1.5'
                }`}>
                  beheer
                </span>
              </div>
            </div>
          </div>

          {/* Slider Container - Always present but hidden until ready */}
          <div className="relative">
            {/* Slides */}
            <div className="relative h-[200px] md:h-[180px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide && showBitcoinText
                      ? 'opacity-100 translate-y-0 visible'
                      : 'opacity-0 translate-y-4 invisible'
                  }`}
                >
                  <div className="text-center">
                    {/* Description as main text */}
                    <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto leading-relaxed font-medium">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Keywords (hidden but accessible) */}
          <div className="sr-only">
            {currentSlideData.keywords.map((keyword, idx) => (
              <span key={idx}>{keyword} </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes slide-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 40px));
          }
        }

        @keyframes slide-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(50% + 40px));
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes coin-appear {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-blink {
          animation: blink 1.2s ease-in-out infinite;
        }

        .animate-slide-left {
          animation: slide-left 1.2s ease-in-out forwards;
        }

        .animate-slide-right {
          animation: slide-right 1.2s ease-in-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out 0.3s both;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-coin-appear {
          animation: coin-appear 0.7s ease-out 0.6s both;
        }
      `}</style>
    </section>
  );
}

