import { useEffect, useRef } from 'react';
import { Calendar, MessageSquare, X } from 'lucide-react';

export function fireConfetti() {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:10000';
  const colors = ['#ea580c', '#f59e0b', '#22c55e', '#3b82f6', '#e11d48'];
  const h = window.innerHeight + 40;
  for (let i = 0; i < 48; i++) {
    const p = document.createElement('i');
    p.style.cssText = `position:absolute;top:-14px;left:${Math.random() * 100}%;width:9px;height:14px;border-radius:2px;background:${colors[i % colors.length]}`;
    layer.appendChild(p);
    p.animate(
      [
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${h}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0.2 },
      ],
      { duration: 1800 + Math.random() * 1400, delay: Math.random() * 500, easing: 'ease-in', fill: 'forwards' }
    );
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3800);
}

export function Modal({
  onClose,
  children,
  label,
  wide,
}: {
  onClose: () => void;
  children: React.ReactNode;
  label: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('button, a, input')?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-sm'}`}>
        {children}
      </div>
    </div>
  );
}

const primaryBtn = 'w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700';
const secondaryBtn = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50';
const quietBtn = 'text-[13px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-700';

export function CelebrationModal({ emoji, title, children, onClose }: { emoji: string; title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <Modal onClose={onClose} label={title}>
      <div className="p-6 text-center">
        <div className="text-5xl leading-none">{emoji}</div>
        <h3 className="mt-3 text-xl font-bold text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-600">{children}</div>
        <div className="mt-5">
          <button className={primaryBtn} onClick={onClose}>Verder</button>
        </div>
      </div>
    </Modal>
  );
}

export function ReminderModal({
  streak,
  amount,
  daysLeft,
  canJoker,
  onClose,
  onJoker,
}: {
  streak: number;
  amount: number;
  daysLeft: number;
  canJoker: boolean;
  onClose: () => void;
  onJoker: () => void;
}) {
  return (
    <Modal onClose={onClose} label="Maandelijkse storting">
      <div className="p-6 text-center">
        <div className="text-5xl leading-none">🔥</div>
        <h3 className="mt-3 text-xl font-bold text-gray-900">Tijd voor je maandelijkse storting</h3>
        <p className="mt-2 text-sm text-gray-600">
          {streak > 0 ? <>Je zit op een reeks van <b>{streak} {streak === 1 ? 'maand' : 'maanden'}</b>. Stort</> : <>Stort</>} deze maand €{amount}
          {streak > 0 ? <> om hem op {streak + 1} te zetten</> : <> om je reeks te starten</>}.{' '}
          {daysLeft === 0 ? 'Vandaag is de laatste dag.' : `Nog ${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagen'}.`}
        </p>
        <div className="mt-5 grid gap-2">
          <button className={primaryBtn} onClick={onClose}>Ik ga het nu doen</button>
          <button className={secondaryBtn} onClick={onClose}>Herinner me morgen</button>
          {canJoker && <button className={`${quietBtn} mt-1`} onClick={onJoker}>Deze maand overslaan met mijn joker</button>}
        </div>
        <p className="mt-4 text-xs text-gray-400">We zien je storting vanzelf op je wallet.</p>
      </div>
    </Modal>
  );
}

export function HelpMenu({ open, onClose, onChat, onPlan, unread, readOnly }: { open: boolean; onClose: () => void; onChat: () => void; onPlan: () => void; unread: number; readOnly: boolean }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-label="Hulp" className="fixed bottom-36 right-4 z-50 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl md:bottom-24 md:right-6">
        <button className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Sluiten">
          <X className="h-4 w-4" />
        </button>
        <p className="pr-6 text-sm text-gray-600">Liever niet alleen uitzoeken? Wij helpen graag.</p>
        <button className={`${primaryBtn} mt-3 flex items-center justify-center gap-2`} onClick={onChat}>
          <MessageSquare className="h-4 w-4" /> Stel een vraag in de chat
          {unread > 0 && <span className="rounded-full bg-white px-1.5 text-xs font-bold text-orange-600">{unread}</span>}
        </button>
        <button className={`${secondaryBtn} mt-2 flex items-center justify-center gap-2`} onClick={onPlan} disabled={readOnly}>
          <Calendar className="h-4 w-4" /> Plan een gesprek
        </button>
      </div>
    </>
  );
}
