// Houdt de app up-to-date: een app die op de achtergrond staat, toont anders
// uren de oude versie. Zodra de app weer naar voren komt, kijken we of er een
// nieuwe versie is. Zo ja: vanzelf opnieuw laden, tenzij iemand bezig is met
// invullen. Dan tonen we een kleine balk met een knop.

const MIN_HIDDEN_MS = 30_000;
const CHECK_EVERY_MS = 30 * 60_000;

const assetOf = (html: string) => html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0] ?? null;
const currentAsset = () => {
  const src = (document.querySelector('script[type="module"][src*="/assets/index-"]') as HTMLScriptElement | null)?.src;
  return src ? new URL(src).pathname : null;
};

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};

function showBanner() {
  if (document.getElementById('bb-update-banner')) return;
  const bar = document.createElement('div');
  bar.id = 'bb-update-banner';
  bar.setAttribute('role', 'status');
  bar.style.cssText =
    'position:fixed;left:12px;right:12px;bottom:76px;z-index:10001;display:flex;align-items:center;justify-content:space-between;gap:12px;' +
    'background:#111827;color:#fff;padding:12px 14px;border-radius:12px;font:600 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)';
  const text = document.createElement('span');
  text.textContent = 'Nieuwe versie beschikbaar.';
  const btn = document.createElement('button');
  btn.textContent = 'Vernieuwen';
  btn.style.cssText = 'background:#ea580c;color:#fff;border:0;border-radius:8px;padding:8px 14px;font:700 14px system-ui,sans-serif;cursor:pointer';
  btn.onclick = () => location.reload();
  bar.append(text, btn);
  document.body.appendChild(bar);
}

async function checkForUpdate() {
  const loaded = currentAsset();
  if (!loaded) return; // dev-server of onbekende build
  try {
    const res = await fetch(`/index.html?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const latest = assetOf(await res.text());
    if (!latest || latest === loaded) return;
    if (isTyping()) showBanner();
    else location.reload();
  } catch {
    /* offline: geen update-check mogelijk */
  }
}

export function initAutoUpdate() {
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      return;
    }
    navigator.serviceWorker?.getRegistration().then((reg) => reg?.update()).catch(() => undefined);
    if (hiddenAt && Date.now() - hiddenAt >= MIN_HIDDEN_MS) checkForUpdate();
  });
  setInterval(() => document.visibilityState === 'visible' && checkForUpdate(), CHECK_EVERY_MS);
}
