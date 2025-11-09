import { useState, useEffect } from 'react';
import { Bitcoin, BookOpen, ArrowRight, ChevronLeft, ChevronRight, Shield, TrendingUp, Lock } from 'lucide-react';
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
    title: 'Bitcoin Investeren in Nederland',
    subtitle: 'Persoonlijke Begeleiding voor Beginners',
    description: 'Leer veilig Bitcoin kopen, bewaren en in eigen beheer houden met persoonlijke 1-op-1 begeleiding. Geen hype, alleen praktische kennis.',
    icon: <Bitcoin className="w-16 h-16" />,
    keywords: ['Bitcoin investeren Nederland', 'Bitcoin beginners', 'Bitcoin begeleiding', 'Bitcoin kopen Nederland']
  },
  {
    id: 2,
    title: 'Veilig Bitcoin Bewaren',
    subtitle: 'Eigen Beheer met Hardware Wallet',
    description: 'Leer hoe je Bitcoin veilig bewaart in eigen beheer met een hardware wallet. Volledige controle over je eigen geld, altijd en overal.',
    icon: <Shield className="w-16 h-16" />,
    keywords: ['Bitcoin bewaren', 'Hardware wallet', 'Bitcoin eigen beheer', 'Bitcoin veiligheid']
  },
  {
    id: 3,
    title: 'Bitcoin Portfolio Beheer',
    subtitle: 'Monitor Je Investeringen 24/7',
    description: 'Volg je Bitcoin portfolio in real-time, bekijk transacties en analyseer je investeringen. Altijd up-to-date met je Bitcoin balans.',
    icon: <TrendingUp className="w-16 h-16" />,
    keywords: ['Bitcoin portfolio', 'Bitcoin monitoring', 'Bitcoin tracking', 'Bitcoin balans']
  },
  {
    id: 4,
    title: 'Bitcoin Prijs Analyse',
    subtitle: 'Begrijp Markt Trends en Cycles',
    description: 'Analyseer Bitcoin prijsgeschiedenis, markt trends en 4-jarige cycles. Maak geïnformeerde beslissingen met historische data.',
    icon: <Lock className="w-16 h-16" />,
    keywords: ['Bitcoin prijs', 'Bitcoin analyse', 'Bitcoin trends', 'Bitcoin cycles']
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBitcoinText, setShowBitcoinText] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, []);

  // Trigger Bitcoin text animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBitcoinText(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (index !== currentSlide && !isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
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

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Logo Animation Section */}
          <div className="flex justify-center mb-8">
            <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
              <Bitcoin className="w-16 h-16" />
            </div>
          </div>

          {/* Animated Brand Name */}
          <div className="text-center mb-8 min-h-[120px] flex items-center justify-center">
            <div className="relative w-full">
              {!showBitcoinText ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl md:text-7xl font-bold tracking-tight inline-block animate-slide-out-left">
                    Bit
                  </span>
                  <span className="text-5xl md:text-7xl font-bold tracking-tight inline-block animate-slide-out-right">
                    Beheer
                  </span>
                </div>
              ) : (
                <div className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in text-center">
                  <span className="inline-block">Bit</span>
                  <span className="inline-block mx-1 md:mx-2 text-orange-200 animate-coin-appear">Coin</span>
                  <span className="inline-block ml-1 md:ml-2">in eigen beheer</span>
                </div>
              )}
            </div>
          </div>

          {/* Slider Container */}
          <div className="relative">
            {/* Slides */}
            <div className="relative h-[400px] md:h-[350px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentSlide
                      ? 'opacity-100 translate-x-0'
                      : index < currentSlide
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm animate-pulse-slow">
                        {slide.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <h2 className="text-2xl md:text-3xl text-orange-100 mb-6 font-semibold">
                      {slide.subtitle}
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                      {slide.description}
                    </p>

                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to="/aanmelden"
                        className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                      >
                        <BookOpen className="w-5 h-5" />
                        Aanmelden voor Begeleiding
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full backdrop-blur-sm transition-all z-20"
              aria-label="Vorige slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full backdrop-blur-sm transition-all z-20"
              aria-label="Volgende slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white w-8'
                      : 'bg-white bg-opacity-50 w-2 hover:bg-opacity-75'
                  }`}
                  aria-label={`Ga naar slide ${index + 1}`}
                />
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
        @keyframes slide-out-left {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(-100px);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-200px);
            opacity: 0;
          }
        }

        @keyframes slide-out-right {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(100px);
            opacity: 0.5;
          }
          100% {
            transform: translateX(200px);
            opacity: 0;
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes coin-appear {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.2);
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

        .animate-slide-out-left {
          animation: slide-out-left 1.5s ease-in-out forwards;
        }

        .animate-slide-out-right {
          animation: slide-out-right 1.5s ease-in-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-coin-appear {
          animation: coin-appear 0.8s ease-out 0.3s both;
        }
      `}</style>
    </section>
  );
}

