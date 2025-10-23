# E-mail Setup voor BitBeheer

## 🔐 Beveiligde E-mail Functionaliteit

Het notificatie formulier is nu beveiligd met een backend API. Hier zijn de stappen om de e-mail functionaliteit volledig werkend te krijgen:

## 📧 E-mail Service Opties

### Optie 1: SendGrid (Aanbevolen)
```bash
npm install @sendgrid/mail
```

1. Maak account op [SendGrid](https://sendgrid.com)
2. Genereer API key
3. Voeg toe aan environment variables:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL=update@bitbeheer.nl`

### Optie 2: Mailgun
```bash
npm install mailgun-js
```

1. Maak account op [Mailgun](https://mailgun.com)
2. Voeg toe aan environment variables:
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`

### Optie 3: AWS SES
```bash
npm install aws-sdk
```

1. Configureer AWS SES
2. Voeg toe aan environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

## 🛠️ Implementatie

### Stap 1: Kies een e-mail service
Kies een van de bovenstaande opties en installeer de benodigde package.

### Stap 2: Update API route
Vervang de TODO sectie in `/api/send-notification.js` met de gekozen e-mail service.

### Stap 3: Environment Variables
Voeg de benodigde environment variables toe aan Vercel:
- Ga naar je Vercel dashboard
- Selecteer je project
- Ga naar Settings > Environment Variables
- Voeg de benodigde keys toe

### Stap 4: Test
Test de functionaliteit door het formulier in te vullen.

## 🔒 Beveiliging

### ✅ Wat is nu beveiligd:
- **HTTPS only**: Alle communicatie via HTTPS
- **Server-side processing**: E-mail wordt server-side verwerkt
- **Input validation**: E-mail format en required fields
- **Error handling**: Proper error responses
- **CORS protection**: Alleen toegestane origins

### 🚫 Wat is NIET meer:
- **Mailto links**: Onveilige client-side e-mail
- **Plain text**: Geen onversleutelde data
- **Public exposure**: Geen directe e-mail blootstelling

## 📝 E-mail Template

De e-mails die je ontvangt bevatten:
- **Onderwerp**: "Notificatie Aanvraag - BitBeheer"
- **Naam**: Van de bezoeker (optioneel)
- **E-mail**: Van de bezoeker
- **Bericht**: Extra bericht (optioneel)
- **Datum**: Wanneer de aanvraag is gedaan

## 🚀 Deployment

Na het instellen van de e-mail service:
1. Commit en push de wijzigingen
2. Vercel deployt automatisch
3. Test de functionaliteit op de live site

## 🆘 Troubleshooting

### E-mail komt niet aan:
1. Controleer spam folder
2. Controleer environment variables
3. Controleer API logs in Vercel dashboard

### Formulier werkt niet:
1. Controleer browser console voor errors
2. Controleer network tab voor API calls
3. Controleer Vercel function logs
