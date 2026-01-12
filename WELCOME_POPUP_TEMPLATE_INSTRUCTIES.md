# Welkom Popup Template Toevoegen

## 📋 Overzicht

De welkomst popup die wordt getoond bij aanmelden is nu toegevoegd als een beheerbare template in de Email Templates sectie.

## 🚀 Stappen om Template Toe te Voegen

### Optie 1: Via Supabase Dashboard (Aanbevolen)

1. Ga naar je Supabase Dashboard: https://supabase.com/dashboard
2. Selecteer je project: `bitbeheer`
3. Klik op "SQL Editor" in de sidebar
4. Open het bestand `add-welcome-popup-template.sql`
5. Kopieer de volledige inhoud
6. Plak het in de SQL Editor
7. Klik op "Run" om het script uit te voeren

### Optie 2: Via Supabase CLI

```bash
# Als je Supabase CLI hebt geïnstalleerd
supabase db execute --file add-welcome-popup-template.sql
```

## ✅ Verificatie

Na het uitvoeren van het script:

1. Ga naar je admin dashboard
2. Navigeer naar "E-mail Beheer" → "Email Templates"
3. Je zou nu een nieuwe template moeten zien: **`welcome_popup`**
4. Deze template heeft:
   - **Naam:** `welcome_popup`
   - **Onderwerp:** `🎉 Welkom bij BitBeheer!`
   - **Beschrijving:** `Welkomst popup die wordt getoond bij eerste inlog na aanmelding`
   - **Variabelen:** `{{userName}}` - Naam van de gebruiker

## 📝 Template Inhoud

De template bevat:
- Welkomstbericht met persoonlijke groet
- Overzicht van wat BitBeheer doet
- Volgende stappen voor nieuwe gebruikers
- Contact informatie

## 🔧 Template Bewerken

Je kunt de template nu bewerken via:
- Admin Dashboard → E-mail Beheer → Email Templates
- Klik op "Bewerken" bij de `welcome_popup` template
- Pas de inhoud aan zoals je wilt
- Sla op

## 📌 Opmerking

**Let op:** De WelcomePopup React component gebruikt momenteel nog hardcoded inhoud. Om de template volledig te gebruiken, zou de WelcomePopup component moeten worden aangepast om de inhoud uit de database te laden. Dit is een toekomstige verbetering.

Voor nu is de template zichtbaar in de Email Templates sectie zodat je de inhoud kunt beheren en aanpassen.

