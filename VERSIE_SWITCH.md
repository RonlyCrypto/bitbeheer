# Versie Switch Instructies

## 📋 Overzicht

Deze applicatie heeft nu twee versies:
1. **Complexe versie** (huidige volledige versie) - opgeslagen in branch `complex-version-backup`
2. **Eenvoudige versie** (nieuwe vereenvoudigde versie) - op branch `main`

## 🔄 Tussen Versies Switchen

### Optie 1: Via Git Branch (Aanbevolen)

```bash
# Naar complexe versie
git checkout complex-version-backup

# Naar eenvoudige versie
git checkout main
```

### Optie 2: Via Configuratiebestand

Wijzig `src/config/appVersion.ts`:
```typescript
export const APP_VERSION: AppVersion = 'simple'; // of 'complex'
```

En gebruik de juiste App.tsx:
- `src/App.tsx` - Complexe versie
- `src/App.simple.tsx` - Eenvoudige versie

## 📦 Wat is Verschillend?

### Eenvoudige Versie Bevat:
- ✅ Basis User Dashboard (Overview, Portfolio, Afspraken)
- ✅ Basis Admin Dashboard (Overview, Accounts, Afspraken)
- ✅ FrontPage (ongewijzigd - ziet er goed uit)
- ✅ Basis authenticatie (Supabase Auth)
- ✅ Portfolio beheer (vereenvoudigd)

### Complexe Versie Bevat (Alles):
- ✅ Alle features van eenvoudige versie
- ✅ Cycle Advisor
- ✅ SEO Analytics
- ✅ Referral Links
- ✅ Complexe notificaties
- ✅ Chat systeem
- ✅ Market Status Widget
- ✅ Impersonation
- ✅ System Status Debug
- ✅ Alle context providers

## 🚀 Gebruik

1. **Voor ontwikkeling/testen**: Gebruik eenvoudige versie
2. **Voor productie met alle features**: Gebruik complexe versie
3. **Voor nieuwe gebruikers**: Start met eenvoudige versie en voeg features toe indien nodig

## 📝 Notities

- Beide versies gebruiken dezelfde database
- Beide versies gebruiken dezelfde styling (Tailwind CSS)
- Het uiterlijk blijft hetzelfde, alleen functionaliteit verschilt

