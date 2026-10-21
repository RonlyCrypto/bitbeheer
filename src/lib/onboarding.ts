export type Stage =
  | 'aangemeld'
  | 'gesprek_gehad'
  | 'pending'
  | 'wallet_gekoppeld'
  | 'eerste_bitcoin'
  | 'reeks_actief';

export const STAGES: Stage[] = ['aangemeld', 'gesprek_gehad', 'pending', 'wallet_gekoppeld', 'eerste_bitcoin', 'reeks_actief'];

export const stageIndex = (s: Stage) => STAGES.indexOf(s);

export const STAGE_LABELS: Record<Stage, string> = {
  aangemeld: 'Aangemeld',
  gesprek_gehad: 'Gesprek gehad',
  pending: 'Wallet besteld (onderweg)',
  wallet_gekoppeld: 'Wallet gekoppeld',
  eerste_bitcoin: 'Eerste satoshi binnen',
  reeks_actief: 'Maandelijkse storting actief',
};

export interface Plan {
  strategy?: string;
  monthly_amount?: number;
  years?: number;
  goal_btc?: number;
  /** Wie het plan heeft ingesteld; een plan van de admin kan de gebruiker niet aanpassen. */
  set_by?: 'admin' | 'user';
}

export interface OnboardingAccount {
  id: string;
  email: string;
  name: string | null;
  first_name: string | null;
  onboarding_stage: Stage;
  wallet_model: string | null;
  wallet_ordered_at: string | null;
  wallet_received_at: string | null;
  plan: Plan | null;
  monthly_active: boolean;
  monthly_day: number | null;
  remind_app: boolean;
  remind_mail: boolean;
  monthly_started_on: string | null;
  first_bitcoin_at: string | null;
  first_appointment_completed: boolean | null;
  account_approved: boolean | null;
}

export interface WalletRow {
  address: string;
  name: string | null;
  balance: number | null;
  total_received: number | null;
  total_investment: number | null;
  transaction_count: number | null;
}

export interface Deposit {
  month: string;
  source: 'auto' | 'joker';
}

export interface JokerEvent {
  kind: 'yearly' | 'holiday' | 'streak';
  ref: string;
  year: number;
}

export const MAX_JOKERS_PER_YEAR = 3;

export interface JokerStats {
  /** Verdiend dit jaar (max 3) */
  earnedThisYear: number;
  /** Nog in te zetten (verdiend minus ingezet, ook van eerdere jaren) */
  available: number;
  /** Al ingezet, in totaal */
  used: number;
}

/** Saldo van jokers. De jaarlijkse joker telt direct mee, ook als de server hem nog moet vastleggen. */
export function jokerStats(events: JokerEvent[], deposits: Deposit[], active: boolean, now: Date = new Date()): JokerStats {
  const year = now.getFullYear();
  const hasYearly = events.some((e) => e.kind === 'yearly' && e.year === year);
  const thisYear = events.filter((e) => e.year === year).length;
  const virtual = active && !hasYearly && thisYear < MAX_JOKERS_PER_YEAR ? 1 : 0;
  const used = deposits.filter((d) => d.source === 'joker').length;
  return { earnedThisYear: thisYear + virtual, available: Math.max(0, events.length + virtual - used), used };
}

export interface ModelOption {
  id: string;
  note?: string;
}

export interface OnboardingConfig {
  ledger_url: string;
  models: ModelOption[];
}

export const DEFAULT_CONFIG: OnboardingConfig = {
  ledger_url: 'https://www.ledger.com',
  models: [
    { id: 'Ledger Nano S Plus', note: 'Het basismodel' },
    { id: 'Ledger Nano X', note: 'Met Bluetooth, ook handig op je telefoon' },
    { id: 'Ledger Flex', note: 'Met groot touchscreen' },
    { id: 'Ledger Stax', note: 'Premium model met groot scherm' },
  ],
};

export const isBtcAddress = (a: string) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(a.trim());

export const toDateInput = (d: Date = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const hasDepositThisMonth = (deposits: Deposit[], now: Date = new Date()) =>
  deposits.some((d) => d.month.slice(0, 7) === monthKey(now));

/** Aantal maanden op rij. De lopende maand telt mee zodra er gestort is; anders telt de reeks vanaf vorige maand door. */
export function computeStreak(deposits: Deposit[], now: Date = new Date()): number {
  const have = new Set(deposits.map((d) => d.month.slice(0, 7)));
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  if (!have.has(monthKey(cursor))) cursor.setMonth(cursor.getMonth() - 1);
  let streak = 0;
  while (have.has(monthKey(cursor))) {
    streak += 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return streak;
}

export interface Level {
  name: string;
  next: string | null;
  from: number;
  to: number | null;
}

export function levelFor(streak: number): Level {
  if (streak >= 12) return { name: 'Hodler', next: null, from: 12, to: null };
  if (streak >= 6) return { name: 'Volhouder', next: 'Hodler', from: 6, to: 12 };
  if (streak >= 3) return { name: 'Stacker', next: 'Volhouder', from: 3, to: 6 };
  return { name: 'Starter', next: 'Stacker', from: 0, to: 3 };
}

export const BADGES = [
  { id: 'first', emoji: '🪙', label: 'Eerste satoshi', need: 0 },
  { id: 's3', emoji: '🔥', label: '3 op rij', need: 3 },
  { id: 's6', emoji: '💪', label: '6 op rij', need: 6 },
  { id: 's12', emoji: '🏆', label: '12 op rij', need: 12 },
  { id: 'whole', emoji: '👑', label: '1 hele Bitcoin', need: 0 },
];

const MONTHS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export interface Tile {
  label: string;
  state: 'done' | 'now' | 'future' | 'past';
  joker: boolean;
}

/** Twaalf maandtegels vanaf de startmaand van de reeks. */
export function buildTiles(deposits: Deposit[], startedOn: string | null, now: Date = new Date()): Tile[] {
  const byMonth = new Map(deposits.map((d) => [d.month.slice(0, 7), d]));
  const base = startedOn ? new Date(startedOn + 'T12:00:00') : now;
  const cursor = new Date(base.getFullYear(), base.getMonth(), 1);
  const nowKey = monthKey(now);
  const tiles: Tile[] = [];
  for (let i = 0; i < 12; i++) {
    const key = monthKey(cursor);
    const dep = byMonth.get(key);
    let state: Tile['state'] = 'future';
    if (dep) state = 'done';
    else if (key === nowKey) state = 'now';
    else if (key < nowKey) state = 'past';
    tiles.push({ label: MONTHS_NL[cursor.getMonth()], state, joker: dep?.source === 'joker' });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return tiles;
}

export function daysLeftInMonth(now: Date = new Date()) {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return last - now.getDate();
}

export function fearGreedLabel(v: number) {
  if (v <= 24) return 'Extreme angst';
  if (v <= 44) return 'Angst';
  if (v <= 55) return 'Neutraal';
  if (v <= 75) return 'Hebzucht';
  return 'Extreme hebzucht';
}

export const formatDateNl = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
};
