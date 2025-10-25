# 📧 TransIP Email Configuratie voor BitBeheer

## 🎯 Overzicht
Deze guide helpt je om TransIP email te configureren voor het versturen van bulk emails vanuit `update@bitbeheer.nl`.

## 📋 Stap-voor-stap Setup

### 1. TransIP Control Panel
- Ga naar: https://www.transip.nl/controlpanel/
- Log in met je TransIP account
- Navigeer naar "Email" sectie

### 2. Email Account Aanmaken
- **Email adres:** `update@bitbeheer.nl`
- **Wachtwoord:** Kies een sterk wachtwoord (bewaar dit!)
- **Mailbox grootte:** 1GB (standaard)
- **Spam filter:** Aan
- **Virus scanning:** Aan

### 3. SMTP Instellingen
- **SMTP Server:** `smtp.transip.nl`
- **Poort:** 587 (STARTTLS) of 465 (SSL)
- **Beveiliging:** STARTTLS (aanbevolen)
- **Authenticatie:** Vereist

### 4. Environment Variables
Voeg deze toe aan je `.env` bestand:

```env
# TransIP Email Configuratie
TRANSIP_EMAIL=update@bitbeheer.nl
TRANSIP_PASSWORD=jouw_sterke_wachtwoord

# Gmail Fallback (optioneel)
GMAIL_USER=update@bitbeheer.nl
GMAIL_APP_PASSWORD=jouw_gmail_app_password
```

### 5. Vercel Environment Variables
In je Vercel dashboard:
1. Ga naar je project settings
2. Klik op "Environment Variables"
3. Voeg toe:
   - `TRANSIP_EMAIL` = `update@bitbeheer.nl`
   - `TRANSIP_PASSWORD` = `jouw_wachtwoord`

## 🔧 Email Templates

### Standaard Templates
Het systeem heeft 3 standaard templates:

1. **Site Live Aankondiging** (`opening_website`)
   - Voor gebruikers die zich hebben aangemeld voor notificaties
   - Onderwerp: "BitBeheer is nu live! 🚀"

2. **Welkom Bericht** (`account_aanmelden`)
   - Voor nieuwe account registraties
   - Onderwerp: "Welkom bij BitBeheer! 👋"

3. **Herinnering** (`account_aanmelden`)
   - Voor gebruikers die nog niet zijn ingelogd
   - Onderwerp: "Vergeet niet om in te loggen op BitBeheer"

### Template Variabelen
- `{{name}}` - Gebruikersnaam
- `{{email}}` - Email adres
- `{{date}}` - Huidige datum

## 📊 Email Beheer Features

### Categorieën
- **`opening_website`** - Notificatie aanmeldingen
- **`account_aanmelden`** - Account registraties
- **`contact`** - Contact formulier
- **`support`** - Support aanvragen

### Bulk Email Functionaliteit
- **Template selectie** - Kies uit vooraf gedefinieerde templates
- **Custom berichten** - Schrijf je eigen berichten
- **Gebruiker selectie** - Selecteer specifieke gebruikers
- **Categorie filtering** - Filter per categorie
- **CSV export** - Export gebruikersdata

## 🚀 Test de Email Functionaliteit

### 1. Test Email Verzenden
```bash
# Test via API
curl -X POST https://www.bitbeheer.nl/api/send-bulk-email \
  -H "Content-Type: application/json" \
  -d '{
    "users": [{"email": "test@example.com", "name": "Test User"}],
    "message": "Test bericht",
    "subject": "Test Email",
    "fromEmail": "update@bitbeheer.nl"
  }'
```

### 2. Admin Dashboard
1. Ga naar https://www.bitbeheer.nl/admin
2. Klik op "Notificaties" tab
3. Selecteer gebruikers
4. Kies template of schrijf custom bericht
5. Klik "Verstuur"

## 🔒 Veiligheid

### Wachtwoord Beveiliging
- Gebruik een sterk, uniek wachtwoord
- Bewaar credentials veilig
- Gebruik environment variables
- Nooit hardcoded passwords

### Rate Limiting
- Max 100 emails per batch
- 1 seconde delay tussen emails
- Spam protection ingebouwd

### Spam Prevention
- Honeypot fields
- Form timing checks
- Math challenges
- User agent analysis

## 🛠️ Troubleshooting

### Probleem: "SMTP connection failed"
**Oplossing:**
1. Controleer TransIP credentials
2. Controleer firewall instellingen
3. Test met Gmail fallback

### Probleem: "Authentication failed"
**Oplossing:**
1. Controleer email en wachtwoord
2. Controleer TransIP account status
3. Reset wachtwoord indien nodig

### Probleem: "Emails not delivered"
**Oplossing:**
1. Controleer spam folder
2. Controleer email adressen
3. Controleer TransIP sending limits

## 📈 Monitoring

### Email Statistieken
- Totaal verzonden emails
- Succesvolle deliveries
- Failed deliveries
- Bounce rates

### Logs
- Alle email activiteit wordt gelogd
- Failed deliveries worden geregistreerd
- Performance metrics beschikbaar

## 🎯 Best Practices

### Email Content
- Gebruik duidelijke onderwerpen
- Persoonlijke aanhef
- Duidelijke call-to-action
- Mobile-friendly content

### Timing
- Verstuur tijdens kantooruren
- Vermijd weekenden
- Test eerst met kleine groep

### Compliance
- GDPR compliant
- Unsubscribe opties
- Privacy policy links
- Data retention policies

## 📞 Support

### TransIP Support
- Email: support@transip.nl
- Telefoon: 020-462-0800
- Documentatie: https://www.transip.nl/knowledgebase/

### BitBeheer Support
- Email: update@bitbeheer.nl
- Admin dashboard: https://www.bitbeheer.nl/admin
- Logs: Vercel function logs
