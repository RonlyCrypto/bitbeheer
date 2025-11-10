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
  floatSpeed: number;
  floatAmount: number;
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
        baseOpacity: 0.05 + Math.random() * 0.1, // Base opacity for glow effect
        speed: 0.05 + Math.random() * 0.15, // Different scroll speeds
        blinkSpeed: 3000 + Math.random() * 4000, // Different blink speeds (3-7 seconds)
        initialY: Math.random() * 200,
        floatSpeed: 0.5 + Math.random() * 1.5, // Floating animation speed
        floatAmount: 20 + Math.random() * 40 // Float distance in pixels
      });
    }
    
    setLogos(initialLogos);
    startTimeRef.current = Date.now();

    // Handle scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Animation loop for blinking, scroll movement, and floating
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      
      const newOpacities: Record<number, number> = {};
      setLogos(prevLogos => prevLogos.map(logo => {
        const cycle = (elapsed % logo.blinkSpeed) / logo.blinkSpeed;
        // Smooth fade in/out using sine wave
        const opacityMultiplier = (Math.sin(cycle * Math.PI * 2) + 1) / 2;
        const currentOpacity = logo.baseOpacity * (0.5 + opacityMultiplier * 0.5);
        newOpacities[logo.id] = currentOpacity;
        
        // Calculate scroll offset
        const scrollOffset = scrollYRef.current * logo.speed;
        
        // Calculate floating movement
        const floatCycle = (elapsed * logo.floatSpeed) / 1000;
        const floatY = Math.sin(floatCycle * Math.PI) * logo.floatAmount;
        
        return {
          ...logo,
          y: logo.initialY + scrollOffset + floatY
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
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 107, 53, 0.03) 50%, rgba(255, 255, 255, 0) 100%)',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Glow gradient backgrounds */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(255, 107, 53, 0.15) 0%, transparent 50%)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          background: 'radial-gradient(ellipse at 80% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />
      
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
            transition: 'opacity 0.3s ease-in-out',
            filter: `drop-shadow(0 0 ${Math.max(8, logo.size * 0.3)}px rgba(255, 107, 53, ${(opacities[logo.id] || logo.baseOpacity) * 0.8}))`
          }}
        >
          <Bitcoin className="w-full h-full text-orange-400" />
        </div>
      ))}
    </div>
  );
}

