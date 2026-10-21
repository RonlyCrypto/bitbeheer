import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, MessageSquare, PieChart, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useOnboarding } from '../../hooks/useOnboarding';
import {
  computeStreak,
  daysLeftInMonth,
  hasDepositThisMonth,
  stageIndex,
} from '../../lib/onboarding';
import AppointmentBookingPopup from '../AppointmentBookingPopup';
import ProfilePopup from '../ProfilePopup';
import { useProfilePopup } from '../../contexts/ProfilePopupContext';
import Helpdesk from '../Helpdesk';
import StageHero from './StageHero';
import PushSetup from './PushSetup';
import { ActivateMonthlyCard, BitcoinCard, MarketCard, PlanCard, StreakCard } from './cards';
import { CelebrationModal, HelpMenu, Modal, ReminderModal, fireConfetti } from './Modals';

const PortfolioPage = lazy(() => import('../../pages/PortfolioPage'));

const ADMIN_EMAIL = 'admin@bitbeheer.nl';

const todayKey = () => new Date().toISOString().slice(0, 10);
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* opslag niet beschikbaar */
  }
};

function useUnreadChat(email: string | undefined) {
  const [unread, setUnread] = useState(0);
  const check = useCallback(async () => {
    if (!email) return;
    try {
      const [{ data: status }, { data: msgs }] = await Promise.all([
        supabase.from('chat_read_status').select('last_read_at').eq('user_email', email).maybeSingle(),
        supabase.from('support_messages').select('created_at').eq('email', email).eq('from_admin', true),
      ]);
      const last = status?.last_read_at ? new Date(status.last_read_at).getTime() : 0;
      setUnread((msgs ?? []).filter((m: any) => new Date(m.created_at).getTime() > last).length);
    } catch {
      /* chatstatus is niet kritiek */
    }
  }, [email]);
  useEffect(() => {
    check();
    const t = setInterval(() => document.visibilityState === 'visible' && check(), 30000);
    window.addEventListener('newAdminMessage', check);
    return () => {
      clearInterval(t);
      window.removeEventListener('newAdminMessage', check);
    };
  }, [check]);
  return { unread, markRead: async () => {
    if (!email) return;
    const row = { user_email: email, last_read_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data: existing } = await supabase.from('chat_read_status').select('id').eq('user_email', email).maybeSingle();
    if (existing) await supabase.from('chat_read_status').update(row).eq('id', existing.id);
    else await supabase.from('chat_read_status').insert([row]);
    setUnread(0);
  } };
}

type Celebration = { emoji: string; title: string; body: React.ReactNode } | null;

export default function BeginnerDashboard() {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const email = isImpersonating && impersonatedUser ? impersonatedUser : user?.email;
  const readOnly = !!isImpersonating;
  const ob = useOnboarding(email);
  const chat = useUnreadChat(email);

  const [tab, setTab] = useState<'overview' | 'portfolio'>('overview');
  const [helpOpen, setHelpOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const { isOpen: profileOpen, closeProfilePopup } = useProfilePopup();
  const [userProfile, setUserProfile] = useState<any>({
    id: user?.id || '',
    email: email || '',
    name: user?.user_metadata?.name || (email ?? '').split('@')[0],
    first_name: user?.user_metadata?.first_name || '',
    last_name: user?.user_metadata?.last_name || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    company: user?.user_metadata?.company || '',
  });

  const account = ob.account;
  const stage = account?.onboarding_stage ?? 'aangemeld';
  const si = stageIndex(stage);
  const streak = useMemo(() => computeStreak(ob.deposits), [ob.deposits]);
  const jokerUsed = ob.deposits.some((d) => d.source === 'joker' && d.month.startsWith(String(new Date().getFullYear())));
  const depositDone = hasDepositThisMonth(ob.deposits);

  // Feestelijke momenten: alleen bij een echte verandering sinds het laatste bezoek.
  useEffect(() => {
    if (!email || !account) return;
    const key = `bb_seen_stage:${email}`;
    const seen = read(key);
    if (seen === null) {
      write(key, String(si));
      return;
    }
    if (si > Number(seen)) {
      write(key, String(si));
      if (stage === 'eerste_bitcoin') {
        fireConfetti();
        setCelebration({ emoji: '🎉', title: 'Je eerste Bitcoin is binnen!', body: <>We zagen je aankoop op je wallet. Er is nieuws vrijgespeeld op je dashboard.</> });
      }
    }
  }, [email, account, si, stage]);

  useEffect(() => {
    if (!email || stage !== 'reeks_actief') return;
    const key = `bb_seen_streak:${email}`;
    const seen = read(key);
    if (seen === null) {
      write(key, String(streak));
      return;
    }
    if (streak > Number(seen)) {
      write(key, String(streak));
      fireConfetti();
      const badge = streak === 3 ? 'Je hebt de badge 3 op rij behaald en bent nu Stacker.' : streak === 6 ? 'Je hebt de badge 6 op rij behaald en bent nu Volhouder.' : streak === 12 ? 'Je hebt de badge 12 op rij behaald en bent nu Hodler.' : 'Mooi volgehouden.';
      setCelebration({ emoji: '🎉', title: 'Storting gezien!', body: <>Je reeks staat op <b>{streak} {streak === 1 ? 'maand' : 'maanden'}</b>. {badge}</> });
    }
  }, [email, stage, streak]);

  // Herinnering: één keer per dag, vanaf de gekozen dag van de maand.
  useEffect(() => {
    if (!email || !account || readOnly || celebration) return;
    if (stage !== 'reeks_actief' || !account.monthly_active || !account.remind_app) return;
    if (new Date().getDate() < (account.monthly_day ?? 1) || depositDone) return;
    const key = `bb_reminder_day:${email}`;
    if (read(key) === todayKey()) return;
    setReminderOpen(true);
  }, [email, account, stage, depositDone, readOnly, celebration]);

  const closeReminder = () => {
    if (email) write(`bb_reminder_day:${email}`, todayKey());
    setReminderOpen(false);
  };

  const activateMonthly = async (amount: number, day: number, app: boolean, mail: boolean) => {
    await ob.activateMonthly(amount, day, app, mail);
    if (email) write(`bb_reminder_day:${email}`, todayKey());
  };

  if (user?.email === ADMIN_EMAIL && !isImpersonating) return <Navigate to="/admin" replace />;

  if (ob.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-orange-600" />
          <p className="text-sm text-gray-600">Dashboard laden…</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900">We kunnen je account niet vinden</h1>
        <p className="mt-2 text-sm text-gray-600">Probeer het later opnieuw of neem contact met ons op.</p>
      </div>
    );
  }

  const name = account.first_name || account.name?.split(' ')[0] || (email ?? '').split('@')[0];
  const portfolioOpen = si >= stageIndex('wallet_gekoppeld');
  const amount = account.plan?.monthly_amount ?? 50;
  const greeting = si >= stageIndex('eerste_bitcoin') ? 'Fijn dat je er bent. Alles staat voor je klaar.' : 'Dit is wat je nu het beste kunt doen.';

  const tabBtn = (id: 'overview' | 'portfolio', label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      aria-current={tab === id ? 'page' : undefined}
      className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === id ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-[75vh] overflow-x-hidden bg-gray-50 pb-28 md:pb-10">
      <h1 className="sr-only">BitBeheer dashboard</h1>

      {portfolioOpen && (
        <div className="hidden border-b border-gray-200 bg-white md:block">
          <div className="mx-auto flex max-w-3xl gap-1 px-4">{tabBtn('overview', 'Overzicht')}{tabBtn('portfolio', 'Portfolio')}</div>
        </div>
      )}

      {readOnly && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">Je bekijkt dit dashboard als gebruiker. Acties zijn uitgeschakeld.</div>
      )}

      {tab === 'portfolio' && portfolioOpen ? (
        <div className="mx-auto min-w-0 max-w-6xl px-3 py-4 sm:px-4 sm:py-5">
          <Suspense fallback={<p className="py-10 text-center text-sm text-gray-500">Portfolio laden…</p>}><PortfolioPage variant="user" /></Suspense>
        </div>
      ) : (
        <main className="mx-auto flex max-w-3xl flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Hoi {name}</h2>
            <p className="mt-0.5 text-sm text-gray-600">{greeting}</p>
          </div>

          <StageHero ob={ob} readOnly={readOnly} currencySymbol="€" onPlanAppointment={() => setApptOpen(true)} onOpenChat={() => setChatOpen(true)} />

          {stage === 'wallet_gekoppeld' && <BitcoinCard wallet={ob.wallet} price={ob.price} waiting />}

          {si >= stageIndex('eerste_bitcoin') && (
            <>
              {stage === 'reeks_actief' && account.monthly_active && (
                <StreakCard account={account} deposits={ob.deposits} readOnly={readOnly} onJoker={ob.spendJoker} onPause={ob.pauseMonthly} pushSlot={<PushSetup email={email} readOnly={readOnly} />} />
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <BitcoinCard wallet={ob.wallet} price={ob.price} />
                <MarketCard />
              </div>
              <PlanCard account={account} wallet={ob.wallet} readOnly={readOnly} onSave={ob.updatePlan} />
              {(stage === 'eerste_bitcoin' || (stage === 'reeks_actief' && !account.monthly_active)) && (
                <ActivateMonthlyCard account={account} readOnly={readOnly} onActivate={activateMonthly} pushSlot={<PushSetup email={email} readOnly={readOnly} />} />
              )}
            </>
          )}
        </main>
      )}

      {/* Hulp: zwevende knop op desktop, in de onderbalk op mobiel */}
      <HelpMenu
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onChat={() => { setHelpOpen(false); setChatOpen(true); }}
        onPlan={() => { setHelpOpen(false); setApptOpen(true); }}
        unread={chat.unread}
        readOnly={readOnly}
      />
      <button
        onClick={() => setHelpOpen((v) => !v)}
        aria-expanded={helpOpen}
        className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition-colors hover:bg-orange-700 md:flex"
      >
        Hulp nodig?
        {chat.unread > 0 && <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-white px-1 text-xs font-bold text-orange-600">{chat.unread}</span>}
      </button>

      <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden" aria-label="Hoofdmenu">
        <div className="flex h-16 items-start justify-around px-1 pt-1">
          {([['overview', 'Overzicht', BarChart3, true], ['portfolio', 'Portfolio', PieChart, portfolioOpen]] as const).map(([id, label, Icon, on]) =>
            on ? (
              <button key={id} onClick={() => setTab(id)} className={`flex h-full flex-1 flex-col items-center justify-center ${tab === id ? 'text-orange-600' : 'text-gray-400'}`}>
                <Icon className="h-5 w-5" />
                <span className="mt-0.5 text-[10px] font-semibold">{label}</span>
              </button>
            ) : null
          )}
          <button onClick={() => setHelpOpen((v) => !v)} className="relative flex h-full flex-1 flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-5 w-5" />
            {chat.unread > 0 && <span className="absolute right-[34%] top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{chat.unread}</span>}
            <span className="mt-0.5 text-[10px] font-semibold">Hulp</span>
          </button>
        </div>
      </nav>

      {chatOpen && (
        <Modal onClose={() => setChatOpen(false)} label="Chat" wide>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <h3 className="text-base font-bold text-gray-900">Chat met ons</h3>
            <button onClick={() => setChatOpen(false)} aria-label="Sluiten" className="rounded-full p-1 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
          </div>
          <div className="p-4"><Helpdesk onMessageRead={chat.markRead} /></div>
        </Modal>
      )}

      <AppointmentBookingPopup
        isOpen={apptOpen}
        onClose={() => setApptOpen(false)}
        onSuccess={() => {
          setApptOpen(false);
          setTimeout(ob.refresh, 500);
        }}
        accountApproved={!!account.account_approved}
        firstAppointmentCompleted={!!account.first_appointment_completed}
      />

      <ProfilePopup
        isOpen={profileOpen}
        onClose={closeProfilePopup}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        user={user}
        isImpersonating={!!isImpersonating}
        impersonatedUser={impersonatedUser ?? null}
      />

      {reminderOpen && !celebration && (
        <ReminderModal
          streak={streak}
          amount={amount}
          daysLeft={daysLeftInMonth()}
          canJoker={!jokerUsed}
          onClose={closeReminder}
          onJoker={async () => {
            try { await ob.spendJoker(); } finally { closeReminder(); }
          }}
        />
      )}

      {celebration && (
        <CelebrationModal emoji={celebration.emoji} title={celebration.title} onClose={() => setCelebration(null)}>
          {celebration.body}
        </CelebrationModal>
      )}
    </div>
  );
}
