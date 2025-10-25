# Supabase Auth Configuratie

## Email Verificatie Instellen

### 1. Supabase Dashboard
Ga naar je Supabase project dashboard en navigeer naar:
- **Authentication** → **Settings** → **Auth**

### 2. Email Templates
Configureer de volgende email templates:

#### **Confirm signup**
```
Subject: Bevestig je account bij BitBeheer

Hallo {{ .Email }},

Welkom bij BitBeheer! Klik op de onderstaande link om je account te activeren:

{{ .ConfirmationURL }}

Deze link is 24 uur geldig.

Met vriendelijke groet,
Het BitBeheer team
```

#### **Reset password**
```
Subject: Wachtwoord reset voor BitBeheer

Hallo {{ .Email }},

Je hebt een wachtwoord reset aangevraagd. Klik op de onderstaande link om een nieuw wachtwoord in te stellen:

{{ .ConfirmationURL }}

Deze link is 1 uur geldig.

Met vriendelijke groet,
Het BitBeheer team
```

### 3. Site URL Configuratie
Stel de volgende URLs in:

- **Site URL**: `https://bitbeheer.nl`
- **Redirect URLs**: 
  - `https://bitbeheer.nl/auth/callback`
  - `https://bitbeheer.nl/admin`
  - `https://bitbeheer.nl/user-dashboard`

### 4. Email Settings
- **Enable email confirmations**: ✅ Aan
- **Enable email change confirmations**: ✅ Aan
- **Enable password reset**: ✅ Aan

### 5. SMTP Configuratie (Optioneel)
Voor custom email provider:

- **SMTP Host**: `smtp.gmail.com` (voor Gmail)
- **SMTP Port**: `587`
- **SMTP User**: `your-email@gmail.com`
- **SMTP Pass**: `your-app-password`
- **SMTP Admin Email**: `update@bitbeheer.nl`

### 6. Security Settings
- **Enable email confirmations**: ✅ Aan
- **Enable phone confirmations**: ❌ Uit
- **Enable anonymous sign-ins**: ❌ Uit
- **Enable email change confirmations**: ✅ Aan

## Database Setup

### 1. Run Database Schema
```bash
# Run de database setup scripts
psql -h your-db-host -U postgres -d postgres -f database-schema.sql
psql -h your-db-host -U postgres -d postgres -f database-categories-schema.sql
psql -h your-db-host -U postgres -d postgres -f database-admin-accounts.sql
```

### 2. Setup Admin Accounts
```bash
# Run de admin accounts setup
node setup-admin-accounts.js
```

## Environment Variables

Zorg ervoor dat de volgende environment variabelen zijn ingesteld:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Testing

### 1. Test Email Verificatie
1. Ga naar de website
2. Klik op "Inloggen" → "Account Aanmaken"
3. Vul je gegevens in
4. Controleer je email voor verificatie link
5. Klik op de link om je account te activeren

### 2. Test Login
1. Na email verificatie, probeer in te loggen
2. Je zou succesvol moeten kunnen inloggen

### 3. Test Admin Login
1. Admin account: `admin@bitbeheer.nl` / `admin123`
2. Test account: `test@bitbeheer.nl` / `test123`
