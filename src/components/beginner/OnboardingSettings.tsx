import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_CONFIG, ModelOption, OnboardingConfig } from '../../lib/onboarding';

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200';

export default function OnboardingSettings() {
  const [url, setUrl] = useState('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'onboarding_config')
      .maybeSingle()
      .then(({ data }) => {
        const cfg: OnboardingConfig = { ...DEFAULT_CONFIG, ...((data?.value as Partial<OnboardingConfig>) ?? {}) };
        setUrl(cfg.ledger_url);
        setModels(cfg.models.map((m) => ({ id: m.id, note: m.note ?? '' })));
        setLoaded(true);
      });
  }, []);

  const update = (i: number, patch: Partial<ModelOption>) => setModels((list) => list.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const move = (i: number, dir: -1 | 1) =>
    setModels((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = async () => {
    setMsg(null);
    const cleaned = models.map((m) => ({ id: m.id.trim(), note: (m.note ?? '').trim() })).filter((m) => m.id);
    if (!/^https:\/\/\S+$/.test(url.trim())) return setMsg({ ok: false, text: 'De Ledger-link moet beginnen met https://' });
    if (cleaned.length === 0) return setMsg({ ok: false, text: 'Voeg minstens één model toe.' });
    if (new Set(cleaned.map((m) => m.id.toLowerCase())).size !== cleaned.length) return setMsg({ ok: false, text: 'Elk model mag maar één keer voorkomen.' });
    if (cleaned.some((m) => m.id.length > 60)) return setMsg({ ok: false, text: 'Een modelnaam mag maximaal 60 tekens zijn.' });
    setBusy(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ value: { ledger_url: url.trim(), models: cleaned }, updated_at: new Date().toISOString() })
      .eq('key', 'onboarding_config');
    setBusy(false);
    if (error) return setMsg({ ok: false, text: `Opslaan mislukt: ${error.message}` });
    setModels(cleaned);
    setMsg({ ok: true, text: 'Opgeslagen. Nieuwe gebruikers zien dit direct.' });
  };

  if (!loaded) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-bold text-gray-900">Wallet bestellen (stap 2 van de gebruiker)</h3>
      <p className="mt-1 text-sm text-gray-500">
        Dit zien gebruikers in de stap “Schaf je Ledger aan”: de knop naar de webshop en de modellen die ze kunnen aanklikken.
      </p>

      <div className="mt-5">
        <label htmlFor="ob-url" className="mb-1 block text-xs font-bold text-gray-700">Link achter de knop “Naar Ledger.com” (jouw referral-link)</label>
        <input id="ob-url" className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://shop.ledger.com/…" />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-bold text-gray-700">Modellen (volgorde zoals gebruikers ze zien)</div>
        <ul className="space-y-2">
          {models.map((m, i) => (
            <li key={i} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
              <input className={inputCls} aria-label={`Modelnaam ${i + 1}`} value={m.id} onChange={(e) => update(i, { id: e.target.value })} placeholder="Ledger Nano X" />
              <input className={inputCls} aria-label={`Toelichting ${i + 1}`} value={m.note ?? ''} onChange={(e) => update(i, { note: e.target.value })} placeholder="Korte toelichting" />
              <div className="flex items-center gap-1">
                <button className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Omhoog"><ArrowUp className="h-4 w-4" /></button>
                <button className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === models.length - 1} aria-label="Omlaag"><ArrowDown className="h-4 w-4" /></button>
                <button className="rounded p-1.5 text-red-500 hover:bg-red-50" onClick={() => setModels((l) => l.filter((_, idx) => idx !== i))} aria-label="Verwijderen"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
        <button className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700" onClick={() => setModels((l) => [...l, { id: '', note: '' }])}>
          <Plus className="h-4 w-4" /> Model toevoegen
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-500">De optie “Een ander merk of model” staat er altijd bij en stuurt gebruikers naar de chat.</p>

      <div className="mt-5 flex items-center gap-4">
        <button className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-40" onClick={save} disabled={busy}>
          {busy ? 'Opslaan…' : 'Opslaan'}
        </button>
        {msg && <span role="status" className={`text-sm font-medium ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</span>}
      </div>
    </section>
  );
}
