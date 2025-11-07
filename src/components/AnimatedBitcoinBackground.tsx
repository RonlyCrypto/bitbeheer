import { useEffect, useRef, useState } from 'react';
import { Bitcoin } from 'lucide-react';

interface BitcoinLogo {
  id: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  speed: number;
  blinkSpeed: number;
  initialY: number;
}

export default function AnimatedBitcoinBackground() {
  const [logos, setLogos] = useState<BitcoinLogo[]>([]);
  const [opacities, setOpacities] = useState<Record<number, number>>({});
  const scrollYRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Initialize logos with random positions and properties
    const logoCount = 12; // Number of Bitcoin logos
    const initialLogos: BitcoinLogo[] = [];
    
    for (let i = 0; i < logoCount; i++) {
      initialLogos.push({
        id: i,
        x: Math.random() * 100, // Percentage of viewport width
        y: Math.random() * 200, // Start higher to allow scrolling
        size: 30 + Math.random() * 50, // Size between 30-80px
        baseOpacity: 0.03 + Math.random() * 0.07, // Very subtle base opacity
        speed: 0.05 + Math.random() * 0.15, // Different scroll speeds
        blinkSpeed: 3000 + Math.random() * 4000, // Different blink speeds (3-7 seconds)
        initialY: Math.random() * 200
      });
    }
    
    setLogos(initialLogos);
    startTimeRef.current = Date.now();

    // Handle scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Animation loop for blinking and scroll movement
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      
      const newOpacities: Record<number, number> = {};
      setLogos(prevLogos => prevLogos.map(logo => {
        const cycle = (elapsed % logo.blinkSpeed) / logo.blinkSpeed;
        // Smooth fade in/out using sine wave
        const opacityMultiplier = (Math.sin(cycle * Math.PI * 2) + 1) / 2;
        const currentOpacity = logo.baseOpacity * (0.4 + opacityMultiplier * 0.6);
        newOpacities[logo.id] = currentOpacity;
        
        // Calculate scroll offset
        const scrollOffset = scrollYRef.current * logo.speed;
        
        return {
          ...logo,
          y: logo.initialY + scrollOffset
        };
      }));
      
      setOpacities(newOpacities);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ 
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="absolute"
          style={{
            left: `${logo.x}%`,
            top: `${logo.y}%`,
            width: `${logo.size}px`,
            height: `${logo.size}px`,
            opacity: opacities[logo.id] || logo.baseOpacity,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform, opacity',
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <Bitcoin className="w-full h-full text-orange-400" />
        </div>
      ))}
    </div>
  );
}

