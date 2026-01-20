# Mockup: Dashboard Verbeteringen

## Huidige situatie
```
┌─────────────────────────────────────────────────────────┐
│ Mijn doelen                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [1] Stort elke maand €50                            │ │
│ │     Je hebt deze maand nog niet gestort             │ │
│ │     🔥 Streak: 0 maanden                            │ │
│ └─────────────────────────────────────────────────────┘ │
│ [+ Voeg een doel toe]                                   │
└─────────────────────────────────────────────────────────┘
```

## Voorgestelde nieuwe layout

### Optie 1: Ritme & Discipline + Strategie Snapshot (aanbevolen)
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔁 Ritme & Discipline                                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [1] Stort elke maand €50                                        │ │
│ │     Je hebt deze maand nog niet gestort                         │ │
│ │     🔥 Streak: 0 maanden                                        │ │
│ │     📅 Laatste storting: 15 dec 2024                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ [+ Voeg een ritme toe]                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🧠 Mijn Bitcoin Strategie                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Strategie:        Lange termijn DCA                             │ │
│ │ Tijdshorizon:     5+ jaar                                       │ │
│ │ Verkoopplan:      Nog niet ingesteld                            │ │
│ │ Risicoprofiel:    Conservatief                                  │ │
│ │                                                                   │ │
│ │ [Bewerk strategie]                                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ⚡ Actie voor vandaag                                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Je hebt deze maand nog niet gestort (€50)                    │ │
│ │                                                                   │ │
│ │ Je zit momenteel onder je DCA-gemiddelde.                       │ │
│ │ Dit is een goed moment om bij te storten.                        │ │
│ │                                                                   │ │
│ │ [Stort nu] [Herinner me later]                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Optie 2: Side-by-side layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔁 Ritme & Discipline    │  🧠 Mijn Bitcoin Strategie              │
│ ┌──────────────────────┐ │  ┌──────────────────────────────────┐  │
│ │ [1] Stort elke maand │ │  │ Strategie: Lange termijn DCA    │  │
│ │     €50              │ │  │ Tijdshorizon: 5+ jaar           │  │
│ │     🔥 Streak: 0     │ │  │ Verkoopplan: Nog niet ingesteld │  │
│ └──────────────────────┘ │  │ Risicoprofiel: Conservatief     │  │
│ [+ Voeg ritme toe]       │  │ [Bewerk strategie]              │  │
└──────────────────────────┴──┴──────────────────────────────────┘  │

┌─────────────────────────────────────────────────────────────────────┐
│ ⚡ Actie voor vandaag                                                │
│ 🟡 Je hebt deze maand nog niet gestort (€50)                        │
│ [Stort nu] [Herinner me later]                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Optie 3: Compact met vertrouwenslaag
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔁 Ritme & Discipline                                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [1] Stort elke maand €50                                        │ │
│ │     🔥 Streak: 0 maanden | 📅 Laatste: 15 dec 2024            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🧠 Strategie Snapshot    │  ⚡ Actie voor vandaag                  │
│ ┌──────────────────────┐ │  ┌──────────────────────────────────┐  │
│ │ DCA • 5+ jaar        │ │  │ 🟡 Stort deze maand nog niet     │ │
│ │ Conservatief         │ │  │ [Stort nu]                       │ │
│ │ [Bewerk]             │ │  └──────────────────────────────────┘  │
│ └──────────────────────┘ │                                         │
└──────────────────────────┴─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🔒 Vertrouwen & Veiligheid                                          │
│ Deze website kan geen transacties uitvoeren. Alles is read-only.    │
└─────────────────────────────────────────────────────────────────────┘
```

## Component structuur

### 1. Ritme & Discipline Component
- Huidige "Mijn doelen" hernoemen
- Toevoegen: laatste storting datum
- Behoud: streak, maandelijkse storting info
- Nieuwe styling: focus op consistentie

### 2. Bitcoin Strategie Snapshot Component
- Strategie type (DCA, Lump Sum, etc.)
- Tijdshorizon
- Verkoopplan status
- Risicoprofiel
- Bewerk knop

### 3. Actie voor Vandaag Component
- Dynamische actie op basis van:
  - Maandelijkse storting status
  - Portfolio status
  - Market conditions
- Call-to-action buttons
- Optioneel: "Herinner me later"

### 4. Vertrouwenslaag Component (optioneel)
- Korte disclaimer over read-only
- Subtiel, niet opdringerig

## Data requirements

### Voor Ritme & Discipline:
- Huidige doelen data (al aanwezig)
- Laatste transactie datum (uit walletTransactions)
- Streak berekening (al aanwezig)

### Voor Strategie Snapshot:
- Nieuwe database velden nodig:
  - strategy_type (DCA, lump_sum, etc.)
  - time_horizon (years)
  - sell_plan (text/null)
  - risk_profile (conservative, moderate, aggressive)
- Of: gebruik bestaande user metadata

### Voor Actie voor Vandaag:
- Maandelijkse storting status (al aanwezig)
- Portfolio balance vs targets
- Market position data (al aanwezig)

## Implementatie volgorde

1. ✅ Hernoem "Mijn doelen" → "Ritme & Discipline"
2. ✅ Voeg laatste storting datum toe
3. ✅ Maak Bitcoin Strategie Snapshot component
4. ✅ Maak Actie voor Vandaag component
5. ✅ Integreer in layout
6. ⚠️ Optioneel: Vertrouwenslaag component
