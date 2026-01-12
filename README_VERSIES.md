# 📦 BitBeheer - Twee Versies

Deze applicatie heeft nu **twee versies** beschikbaar:
1. **Complexe versie** - Volledige versie met alle features
2. **Eenvoudige versie** - Vereenvoudigde versie met alleen kernfunctionaliteiten

## 🔄 Tussen Versies Switchen

### Methode 1: Via Configuratiebestand (Aanbevolen)

Open `src/config/appVersion.ts` en wijzig:

```typescript
export const APP_VERSION: AppVersion = 'simple'; // of 'complex'
```

Dan de applicatie opnieuw starten:

```bash
npm run dev
```

### Methode 2: Via Git Branch

```bash
# Naar complexe versie (volledige features)
git checkout complex-version-backup

# Naar eenvoudige versie (basis features)
git checkout main
```

## 📋 Wat is Verschillend?

### ✅ Eenvoudige Versie Bevat:

**User Dashboard:**
- Overview tab (welkom, stats, snelle acties)
- Portfolio tab (basis portfolio beheer)
- Afspraken tab (afspraken bekijken en boeken)

**Admin Dashboard:**
- Overview tab (metrics, site status toggle)
- Accounts tab (account beheer)
- Afspraken tab (afspraken beheer)
- E-mail Beheer tab (basis email functionaliteit)

**Providers:**
- ThemeProvider
- SupabaseAuthProvider
- CurrencyProvider

### 🚀 Complexe Versie Bevat (Alles):

**User Dashboard:**
- Alle features van eenvoudige versie
- Goals tab (doelen stellen en volgen)
- Market Status widget
- Helpdesk/Chat systeem
- Wallet management
- Notificaties
- Referral blocks

**Admin Dashboard:**
- Alle features van eenvoudige versie
- Cycle Advisor
- SEO Analytics
- Referral Links beheer
- Notificatie beheer
- Chat beheer
- Impersonation
- System Status Debug
- Complexe settings

**Providers:**
- Alle providers van eenvoudige versie
- AuthProvider
- PermissionsProvider
- SettingsProvider
- ProfilePopupProvider

## 🎯 Wanneer Welke Versie Gebruiken?

### Gebruik Eenvoudige Versie Als:
- ✅ Je een nieuwe gebruiker bent
- ✅ Je alleen basis functionaliteit nodig hebt
- ✅ Je de applicatie makkelijker wilt onderhouden
- ✅ Je minder complexiteit wilt
- ✅ Je sneller wilt ontwikkelen

### Gebruik Complexe Versie Als:
- ✅ Je alle features nodig hebt
- ✅ Je geavanceerde functionaliteit gebruikt
- ✅ Je Cycle Advisor nodig hebt
- ✅ Je SEO Analytics nodig hebt
- ✅ Je alle admin tools nodig hebt

## 🔧 Technische Details

### Bestanden Structuur

```
src/
├── App.tsx                    # Hoofd app (switcht tussen versies)
├── config/
│   └── appVersion.ts         # Versie configuratie
├── components/
│   ├── UserDashboard.tsx     # Complexe user dashboard
│   ├── UserDashboardSimple.tsx  # Eenvoudige user dashboard
│   ├── AdminDashboard.tsx    # Complexe admin dashboard
│   └── AdminDashboardSimple.tsx # Eenvoudige admin dashboard
└── ...
```

### Versie Switch Logica

De `App.tsx` controleert `APP_VERSION` en:
- Laadt de juiste dashboard componenten
- Gebruikt de juiste context providers
- Toont/verbergt bepaalde features

## 📝 Notities

- **Database**: Beide versies gebruiken dezelfde Supabase database
- **Styling**: Beide versies gebruiken dezelfde Tailwind CSS styling
- **Uiterlijk**: Het uiterlijk blijft hetzelfde, alleen functionaliteit verschilt
- **Backward Compatible**: Je kunt altijd terug naar de complexe versie

## 🚀 Development

```bash
# Start development server
npm run dev

# Build voor productie
npm run build
```

## 📞 Hulp

Als je problemen hebt met het switchen tussen versies:
1. Controleer `src/config/appVersion.ts`
2. Controleer of alle imports kloppen
3. Check de browser console voor errors
4. Zorg dat je de juiste branch gebruikt (als je Git gebruikt)

---

**Laatste Update**: 2025-01-26
**Status**: ✅ Beide versies beschikbaar en werkend

