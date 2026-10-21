import { useCallback, useEffect, useState } from 'react';
import { Bell, Share } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type State = 'checking' | 'unsupported' | 'needs-install' | 'off' | 'on' | 'denied';

const toKey = (s: string) => {
  const b64 = (s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  (navigator as unknown as { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export default function PushSetup({ email, readOnly }: { email: string | undefined; readOnly: boolean }) {
  const [state, setState] = useState<State>('checking');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const detect = useCallback(async () => {    if (isIos() && !isStandalone()) return setState('needs-install');
    if (!supported()) return setState('unsupported');
    if (Notification.permission === 'denied') return setState('denied');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub && Notification.permission === 'granted' ? 'on' : 'off');
    } catch {
      setState('off');
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  const enable = async () => {
    if (!email) return;
    setBusy(true);
    setError('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return setState(permission === 'denied' ? 'denied' : 'off');
      const { data: cfg } = await supabase.from('site_settings').select('value').eq('key', 'vapid_public_key').maybeSingle();
      const key = typeof cfg?.value === 'string' ? cfg.value : '';
      if (!key) throw new Error('Meldingen zijn nog niet beschikbaar.');
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(key) }));
      const json = sub.toJSON();
      const { error: dbError } = await supabase.from('push_subscriptions').upsert(
        { email, endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, user_agent: navigator.userAgent.slice(0, 200) },
        { onConflict: 'endpoint' }
      );
      if (dbError) throw dbError;
      setState('on');
    } catch (e: any) {
      setError(e?.message || 'Meldingen aanzetten lukte niet.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
      }
      setState('off');
    } finally {
      setBusy(false);
    }
  };

  if (readOnly || state === 'checking') return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
      {state === 'needs-install' && (
        <div className="flex gap-2.5">
          <Share className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
          <div>
            <b className="text-gray-900">Meldingen op je iPhone</b>
            <p className="mt-1 text-xs text-gray-600">
              Zet BitBeheer eerst op je beginscherm: tik onderin op Deel en kies “Zet op beginscherm”. Open BitBeheer daarna vanaf je beginscherm en zet hier de meldingen aan. Tot die tijd krijg je de herinnering per e-mail.
            </p>
          </div>
        </div>
      )}
      {state === 'unsupported' && <p className="text-xs text-gray-600">Je browser ondersteunt geen meldingen. Je krijgt de herinnering per e-mail.</p>}
      {state === 'denied' && (
        <p className="text-xs text-gray-600">Meldingen staan geblokkeerd. Zet ze aan in de instellingen van je browser of telefoon, en kom daarna terug.</p>
      )}
      {state === 'off' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-orange-600" /> Krijg een melding, ook als de app dicht is.</span>
          <button className="rounded-lg border border-orange-600 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 disabled:opacity-40" onClick={enable} disabled={busy}>
            Zet meldingen aan
          </button>
        </div>
      )}
      {state === 'on' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-green-600" /> <b>Meldingen staan aan</b>, ook als de app dicht is.</span>
          <button className="text-xs font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-700" onClick={disable} disabled={busy}>Uitzetten</button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
