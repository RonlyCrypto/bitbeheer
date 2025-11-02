# Email Systeem Test Checklist

## ✅ Wat al gedaan is:
1. ✅ SQL script uitgevoerd - Database heeft `body_content` kolom
2. ✅ Basis email layout systeem geïmplementeerd (`src/utils/emailLayout.ts`)
3. ✅ Email Templates component werkt met body_content
4. ✅ DirectEmailService gebruikt automatisch base layout
5. ✅ NotificatieBeheer gebruikt templates met base layout
6. ✅ Nieuwe template `account_activation` toegevoegd

## 🧪 Test stappen:

### 1. Email Templates bekijken
- Ga naar Admin Dashboard → Email Templates
- Controleer of je de volgende templates ziet:
  - ✅ `live_announcement` - BitBeheer is nu live! 🚀
  - ✅ `welcome` - Welkom bij BitBeheer!
  - ✅ `verification` - Bevestig je email adres
  - ✅ `appointment_confirmed` - Je afspraak is bevestigd
  - ✅ `account_activation` - Bevestig je BitBeheer account - 5 dagen om te activeren

### 2. Template bewerken
- Klik op een template → "Bewerken"
- Controleer of je alleen de "Email Inhoud (Body Content)" ziet (niet de volledige HTML)
- Pas iets aan en sla op
- Klik op "Preview" om te zien hoe het eruit ziet met base layout

### 3. Basis layout aanpassen (optioneel)
- Open `src/utils/emailLayout.ts`
- Wijzig iets in `getEmailBaseLayout()` functie (bijvoorbeeld header kleur)
- Alle emails zouden automatisch deze aanpassing moeten krijgen

### 4. Live email versturen testen
- Ga naar Admin Dashboard → Notificaties
- Selecteer een template uit de dropdown
- Selecteer een gebruiker
- Klik "Verstuur"
- Check de email inbox - de email zou de base layout moeten hebben

### 5. Account activatie template gebruiken
- De nieuwe `account_activation` template is klaar voor gebruik
- Gebruik deze template bij account registraties
- De template bevat automatisch de "5 dagen om te activeren" waarschuwing

## 📝 Belangrijke notities:

### Basis Layout aanpassen
**Locatie:** `src/utils/emailLayout.ts` → `getEmailBaseLayout()` functie

Als je de basis layout aanpast (header, footer, styling), worden ALLE emails automatisch bijgewerkt. Je hoeft dit maar 1x te doen!

### Templates beheren
- Gebruik alleen "Email Inhoud (Body Content)" veld bij het bewerken
- De base layout wordt automatisch toegevoegd
- Variabelen zoals `{{name}}`, `{{email}}`, `{{date}}` werken automatisch

### Variabelen beschikbaar
- `{{name}}` - Gebruikersnaam
- `{{email}}` - Email adres  
- `{{date}}` - Huidige datum
- `{{verification_link}}` - Email verificatie link
- `{{teams_link}}` - Microsoft Teams link (optioneel)
- `{{activation_deadline}}` - Deadline voor activatie (standaard "5 dagen")

## ⚠️ Let op:
- Edge Functions (zoals `send-verification-email`) gebruiken nog hun eigen templates
- Deze kunnen eventueel ook worden aangepast om de base layout te gebruiken
- Voor nu werkt alles via DirectEmailService en NotificatieBeheer correct

