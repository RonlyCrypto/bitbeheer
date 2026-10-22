import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Phase = 'checking' | 'verify' | 'enroll' | 'ok' | 'error';

interface Enrollment {
  factorId: string;
  qr: string;
  secret: string;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200';
const btnCls =
  'w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40';

/** Vraagt de beheerder om een code uit een authenticator-app (tweede inlogstap) voordat het beheer opent. */
export default function AdminMfaGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [factorId, setFactorId] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const check = useCallback(async () => {
    setPhase('checking');
    setError('');
    const { data, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError || !data) {
      setError('We konden de beveiliging niet controleren. Probeer het opnieuw.');
      setPhase('error');
      return;
    }
    if (data.currentLevel === 'aal2') {
      setPhase('ok');
      return;
    }
    if (data.nextLevel === 'aal2') {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
        setPhase('verify');
        return;
      }
    }
    setPhase('enroll');
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const startEnroll = async () => {
    setBusy(true);
    setError('');
    try {
      // Een eerdere, nooit afgeronde koppeling opruimen
      const { data: factors } = await supabase.auth.mfa.listFactors();
      for (const f of factors?.all ?? []) {
        if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `BitBeheer beheer ${Date.now()}`,
      });
      if (enrollError || !data) throw new Error(enrollError?.message || 'Koppelen lukte niet.');
      setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
      setFactorId(data.id);
    } catch (e: any) {
      setError(e.message || 'Koppelen lukte niet.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError || !challenge) throw new Error(challengeError?.message || 'Controle lukte niet.');
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: code.trim() });
      if (verifyError) throw new Error('Deze code klopt niet of is verlopen. Probeer de nieuwste code uit je app.');
      setCode('');
      await check();
    } catch (e: any) {
      setError(e.message || 'Controle lukte niet.');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'ok') return <>{children}</>;

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-2.5">
            <ShieldCheck className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Beheer beveiligen</h1>
        </div>

        {phase === 'checking' && <p className="text-sm text-gray-600">Beveiliging controleren…</p>}

        {phase === 'error' && (
          <>
            <p role="alert" className="text-sm font-medium text-red-600">{error}</p>
            <button className={`${btnCls} mt-4`} onClick={check}>Opnieuw proberen</button>
          </>
        )}

        {phase === 'verify' && (
          <>
            <p className="text-sm text-gray-600">Vul de 6-cijferige code uit je authenticator-app in om verder te gaan.</p>
            <label htmlFor="mfa-code" className="sr-only">Code</label>
            <input
              id="mfa-code"
              className={`${inputCls} mt-4`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verify()}
              autoFocus
            />
            {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
            <button className={`${btnCls} mt-4`} disabled={busy || code.length !== 6} onClick={verify}>
              {busy ? 'Controleren…' : 'Verder'}
            </button>
          </>
        )}

        {phase === 'enroll' && !enrollment && (
          <>
            <p className="text-sm text-gray-600">
              Het beheer wordt beveiligd met een tweede stap. Koppel eenmalig een authenticator-app (zoals Google Authenticator of 1Password). Daarna vraagt het beheer bij het inloggen om een code.
            </p>
            {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
            <button className={`${btnCls} mt-4`} disabled={busy} onClick={startEnroll}>
              {busy ? 'Even geduld…' : 'Authenticator-app koppelen'}
            </button>
          </>
        )}

        {phase === 'enroll' && enrollment && (
          <>
            <p className="text-sm text-gray-600">1. Scan de QR-code met je authenticator-app.</p>
            <img src={enrollment.qr} alt="QR-code voor je authenticator-app" className="mx-auto my-3 h-44 w-44" />
            <p className="text-xs text-gray-500">Lukt scannen niet? Voer deze sleutel handmatig in:</p>
            <p data-testid="mfa-secret" className="mt-1 break-all rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">{enrollment.secret}</p>
            <p className="mt-4 text-sm text-gray-600">2. Vul de 6-cijferige code uit de app in.</p>
            <label htmlFor="mfa-code" className="sr-only">Code</label>
            <input
              id="mfa-code"
              className={`${inputCls} mt-2`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verify()}
            />
            {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
            <button className={`${btnCls} mt-4`} disabled={busy || code.length !== 6} onClick={verify}>
              {busy ? 'Controleren…' : 'Koppeling bevestigen'}
            </button>
          </>
        )}

        <button className="mt-5 w-full text-center text-xs text-gray-400 underline hover:text-gray-600" onClick={signOut}>
          Uitloggen
        </button>
      </div>
    </div>
  );
}
