import { useEffect, useRef, useState } from 'react';

export const DUTCH_CITIES = [
  'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Groningen', 'Eindhoven',
  'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Apeldoorn', 'Haarlem', 'Enschede',
  'Amersfoort', 'Zaanstad', "'s-Hertogenbosch", 'Zwolle', 'Zoetermeer', 'Leiden',
  'Dordrecht', 'Ede', 'Leeuwarden', 'Maastricht', 'Arnhem', 'Gouda', 'Goes',
  'Gorinchem', 'Geleen'
];

interface CityInputProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
}

export default function CityInput({ name, value, onChange, className, placeholder }: CityInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = value.trim()
    ? DUTCH_CITIES.filter(city => city.toLowerCase().includes(value.trim().toLowerCase()))
    : DUTCH_CITIES;

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
        className={className}
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-36 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
          {filtered.map(city => (
            <button
              key={city}
              type="button"
              onClick={() => { onChange(city); setIsOpen(false); }}
              className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-orange-50"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
