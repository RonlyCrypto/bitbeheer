# 🔐 Supabase Admin Accounts Setup

## 📋 Stap-voor-stap Instructies

### 1. Ga naar Supabase Dashboard
- Open: https://supabase.com/dashboard
- Log in met je Supabase account
- Selecteer je project: `bitbeheer`

### 2. Navigeer naar Authentication
- Klik op "Authentication" in de sidebar
- Ga naar "Users" tab

### 3. Maak Admin Account Aan
- Klik op "Add user" of "Invite user"
- **Email:** `admin@bitbeheer.nl`
- **Password:** `admin123`
- **Email Confirm:** ✅ (vink aan)
- **User Metadata:**
  ```json
  {
    "name": "Admin",
    "role": "admin"
  }
  ```

### 4. Maak Test Account Aan
- Klik op "Add user" of "Invite user"
- **Email:** `test@bitbeheer.nl`
- **Password:** `test123`
- **Email Confirm:** ✅ (vink aan)
- **User Metadata:**
  ```json
  {
    "name": "Test User",
    "role": "test"
  }
  ```

### 5. Verifieer Accounts
- Beide accounts moeten "Confirmed" status hebben
- Als ze niet bevestigd zijn, klik op "Confirm" knop

## 🔑 Login Credentials

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@bitbeheer.nl | admin123 | admin |
| Test | test@bitbeheer.nl | test123 | test |

## 🚀 Test de Login

1. Ga naar https://www.bitbeheer.nl
2. Hover over het grijze cirkeltje rechtsonder
3. Klik op het "ezelsoortje"
4. Voer een van de wachtwoorden in:
   - `admin123` voor admin toegang
   - `test123` voor test toegang
5. Je wordt doorgestuurd naar https://www.bitbeheer.nl/admin

## ⚠️ Belangrijke Opmerkingen

- **Geen localStorage meer:** Alle authenticatie gaat via Supabase
- **Veiliger:** Wachtwoorden worden gehashed opgeslagen
- **Session management:** Automatische logout bij inactiviteit
- **Email verificatie:** Accounts zijn direct bevestigd

## 🛠️ Troubleshooting

### Probleem: "Invalid credentials"
- Controleer of accounts bestaan in Supabase
- Controleer of accounts "Confirmed" status hebben
- Controleer wachtwoorden: admin123 / test123

### Probleem: "Network error"
- Controleer Supabase URL in .env
- Controleer internetverbinding
- Controleer of Supabase project actief is

### Probleem: "404 NOT_FOUND" bij /admin
- Controleer of de site correct deployed is
- Controleer of alle routes correct zijn ingesteld
- Controleer Vercel deployment status
