// Draait elk uur (wallets) en dagelijks (herinneringen) via pg_cron. Zie supabase/migrations/20261021_onboarding.sql.
// Beveiligd met een gedeeld geheim (header x-cron-secret, opgeslagen in public.app_secrets), verify_jwt staat uit.
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import webpush from 'npm:web-push@3.6.7'

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const db = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } })
const SITE = 'https://www.bitbeheer.nl'
const MIN_DEPOSIT_SATS = 5000

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } })

function amsNow() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-')
  const [y, m, d] = parts.map(Number)
  return { y, m, d, ymd: parts.join('-'), month: `${parts[0]}-${parts[1]}`, last: new Date(y, m, 0).getDate() }
}
const monthOf = (ms: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit' }).format(new Date(ms)).slice(0, 7)

function streakOf(months: Set<string>, nowMonth: string) {
  let [y, m] = nowMonth.split('-').map(Number)
  const key = () => `${y}-${String(m).padStart(2, '0')}`
  const back = () => { m -= 1; if (m === 0) { m = 12; y -= 1 } }
  if (!months.has(key())) back()
  let n = 0
  while (months.has(key())) { n++; back() }
  return n
}

async function getJson(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!r.ok) throw new Error(`${url} -> ${r.status}`)
  return r.json()
}

async function pushTo(email: string, payload: Record<string, unknown>) {
  const { data: subs } = await db.from('push_subscriptions').select('id,endpoint,p256dh,auth').ilike('email', email)
  let sent = 0
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 86400 })
      sent++
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await db.from('push_subscriptions').delete().eq('id', s.id)
      else console.error('push failed', e?.statusCode, e?.body)
    }
  }
  return sent
}

async function mail(to: string, subject: string, text: string) {
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:520px"><p>${text.replace(/\n/g, '<br>')}</p><p><a href="${SITE}" style="background:#ea580c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Open BitBeheer</a></p></div>`
  const r = await fetch(`${SB_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    body: JSON.stringify({ to, subject, htmlContent: html, textContent: text + `\n\n${SITE}`, type: 'notification' }),
  })
  return r.ok
}

async function adminNote(email: string, name: string, body: string) {
  await db.from('support_messages').insert({ email, body, from_admin: false, user_name: name })
}

async function checkWallets() {
  const summary: Record<string, unknown>[] = []
  const { data: accs } = await db.from('accounts')
    .select('id,email,first_name,name,onboarding_stage,monthly_active,monthly_started_on,remind_app')
    .in('onboarding_stage', ['wallet_gekoppeld', 'eerste_bitcoin', 'reeks_actief'])
  const now = amsNow()
  for (const acc of accs ?? []) {
    const label = acc.first_name || acc.name || acc.email
    try {
      const { data: wallet } = await db.from('wallets').select('address').ilike('email', acc.email).maybeSingle()
      if (!wallet?.address) continue
      const addr = wallet.address
      const info = await getJson(`https://blockstream.info/api/address/${addr}`)
      const c = info.chain_stats, mp = info.mempool_stats
      const funded = c.funded_txo_sum + mp.funded_txo_sum
      const spent = c.spent_txo_sum + mp.spent_txo_sum
      await db.from('wallets').update({
        balance: (funded - spent) / 1e8, total_received: funded / 1e8,
        transaction_count: c.tx_count + mp.tx_count, updated_at: new Date().toISOString(),
      }).ilike('email', acc.email)
      const row: Record<string, unknown> = { email: acc.email, stage: acc.onboarding_stage }

      if (acc.onboarding_stage === 'wallet_gekoppeld' && funded >= MIN_DEPOSIT_SATS) {
        await db.from('accounts').update({ onboarding_stage: 'eerste_bitcoin', first_bitcoin_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', acc.id)
        await adminNote(acc.email, label, `🎉 ${label}: eerste Bitcoin staat op de wallet. Het dashboard is vrijgespeeld.`)
        row.pushed = await pushTo(acc.email, { title: 'Je eerste Bitcoin is binnen 🎉', body: 'Er is nieuws vrijgespeeld op je dashboard.', url: '/', tag: 'first-bitcoin' })
        row.stage = 'eerste_bitcoin'
      }

      if (acc.onboarding_stage === 'reeks_actief' && acc.monthly_active && acc.monthly_started_on) {
        const txs = await getJson(`https://blockstream.info/api/address/${addr}/txs`)
        const { data: have } = await db.from('monthly_deposits').select('month').ilike('email', acc.email)
        const months = new Set<string>((have ?? []).map((d: any) => String(d.month).slice(0, 7)))
        const startMonth = String(acc.monthly_started_on).slice(0, 7)
        const added: string[] = []
        for (const tx of txs) {
          if ((tx.vin ?? []).some((v: any) => v.prevout?.scriptpubkey_address === addr)) continue
          const incoming = (tx.vout ?? []).filter((v: any) => v.scriptpubkey_address === addr).reduce((s: number, v: any) => s + v.value, 0)
          if (incoming < MIN_DEPOSIT_SATS) continue
          const when = tx.status?.confirmed ? tx.status.block_time * 1000 : Date.now()
          const month = monthOf(when)
          if (month < startMonth || months.has(month)) continue
          const { error } = await db.from('monthly_deposits').insert({ email: acc.email, month: `${month}-01`, source: 'auto', txid: tx.txid, amount_btc: incoming / 1e8 })
          if (!error) { months.add(month); added.push(month) }
        }
        if (added.length) {
          const streak = streakOf(months, now.month)
          row.deposits = added
          row.pushed = await pushTo(acc.email, { title: 'Storting gezien! 🔥', body: `Je reeks staat op ${streak} ${streak === 1 ? 'maand' : 'maanden'}. Mooi volgehouden.`, url: '/', tag: 'deposit-seen' })
        }
      }
      summary.push(row)
    } catch (e: any) {
      summary.push({ email: acc.email, error: String(e?.message ?? e) })
    }
  }
  return summary
}

async function sendReminders() {
  const out: Record<string, unknown>[] = []
  const now = amsNow()
  const { data: accs } = await db.from('accounts')
    .select('id,email,first_name,name,onboarding_stage,monthly_active,monthly_day,remind_app,remind_mail,plan,last_reminder_at,wallet_ordered_at,wallet_model')
    .in('onboarding_stage', ['pending', 'reeks_actief'])
  for (const acc of accs ?? []) {
    const lastDay = acc.last_reminder_at ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date(acc.last_reminder_at)) : ''
    if (lastDay === now.ymd) continue
    const name = acc.first_name || acc.name || 'daar'

    if (acc.onboarding_stage === 'pending') {
      if (acc.last_reminder_at || !acc.wallet_ordered_at) continue
      const days = Math.floor((Date.now() - new Date(acc.wallet_ordered_at + 'T12:00:00').getTime()) / 86400000)
      if (days < 10) continue
      const pushed = await pushTo(acc.email, { title: 'Is je wallet al binnen?', body: 'Zodra hij is bezorgd, koppel je hem in een paar klikken.', url: '/', tag: 'wallet-nudge' })
      const mailed = await mail(acc.email, 'Is je Ledger al binnen?', `Hoi ${name},\n\nJe hebt een ${acc.wallet_model ?? 'Ledger'} besteld. Is hij al bezorgd? Open BitBeheer, bevestig de ontvangst en koppel je wallet. Lukt het niet, stuur ons gerust een bericht in de chat.`)
      await db.from('accounts').update({ last_reminder_at: new Date().toISOString() }).eq('id', acc.id)
      out.push({ email: acc.email, type: 'wallet-nudge', pushed, mailed })
      continue
    }

    if (!acc.monthly_active || !acc.monthly_day || acc.monthly_day > now.d) continue
    const dueDays = new Set([acc.monthly_day, acc.monthly_day + 7, now.last - 2].filter((d) => d >= acc.monthly_day))
    if (!dueDays.has(now.d)) continue
    const { data: dep } = await db.from('monthly_deposits').select('month').ilike('email', acc.email)
    const months = new Set<string>((dep ?? []).map((d: any) => String(d.month).slice(0, 7)))
    if (months.has(now.month)) continue
    const streak = streakOf(months, now.month)
    const amount = acc.plan?.monthly_amount ?? 50
    const body = streak > 0 ? `Stort €${amount} om je reeks van ${streak} maanden op ${streak + 1} te zetten.` : `Stort €${amount} om je reeks te starten.`
    let pushed = 0, mailed = false
    if (acc.remind_app) pushed = await pushTo(acc.email, { title: 'Tijd voor je maandelijkse storting 🔥', body, url: '/', tag: 'monthly-reminder' })
    if (acc.remind_mail) mailed = await mail(acc.email, 'Tijd voor je maandelijkse storting 🔥', `Hoi ${name},\n\n${body}\n\nWe zien je storting vanzelf op je wallet.`)
    await db.from('accounts').update({ last_reminder_at: new Date().toISOString() }).eq('id', acc.id)
    out.push({ email: acc.email, type: 'monthly', streak, pushed, mailed })
  }
  return out
}

Deno.serve(async (req) => {
  const { data } = await db.from('app_secrets').select('key,value')
  const sec: Record<string, string> = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]))
  if (!sec.cron_secret || req.headers.get('x-cron-secret') !== sec.cron_secret) return json({ error: 'forbidden' }, 403)
  webpush.setVapidDetails(sec.vapid_subject, sec.vapid_public, sec.vapid_private)
  const task = new URL(req.url).searchParams.get('task') ?? 'all'
  const out: Record<string, unknown> = {}
  if (task === 'wallets' || task === 'all') out.wallets = await checkWallets()
  if (task === 'reminders' || task === 'all') out.reminders = await sendReminders()
  return json(out)
})
