# Resend API Setup Guide

## 1. Resend Account aanmaken

1. Ga naar [resend.com](https://resend.com)
2. Klik op "Sign Up"
3. Maak een account aan met je email
4. Verifieer je email adres

## 2. API Key ophalen

1. Ga naar [resend.com/api-keys](https://resend.com/api-keys)
2. Klik op "Create API Key"
3. Naam: "BitBeheer Email Service"
4. Kopieer de API key (begint met `re_`)

## 3. Domain verificeren (optioneel)

Voor betere deliverability:
1. Ga naar [resend.com/domains](https://resend.com/domains)
2. Voeg `bitbeheer.nl` toe
3. Voeg de DNS records toe aan je domain

## 4. Supabase Environment Variable

1. Ga naar je Supabase Dashboard
2. Settings → Edge Functions → Environment Variables
3. Voeg toe:
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx` (je API key)

## 5. Test de setup

```javascript
// Test in browser console
const { data, error } = await supabase.functions.invoke('send-email-direct', {
  body: {
    to: 'test@example.com',
    subject: 'Test Email',
    htmlContent: '<h1>Test</h1>',
    textContent: 'Test',
    type: 'notification'
  }
});
```

## Kosten

- **Gratis tier**: 3,000 emails/maand
- **Pro tier**: $20/maand voor 50,000 emails
- **Pay-as-you-go**: $0.40 per 1,000 emails

Voor BitBeheer is de gratis tier waarschijnlijk voldoende!
