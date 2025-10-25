# 🔒 Security Setup - BitBeheer

## ⚠️ KRITIEK: Geen Credentials naar GitHub!

**Alle Supabase keys en wachtwoorden moeten veilig worden opgeslagen en NOOIT naar GitHub worden gestuurd.**

---

## 🛡️ Environment Variables Setup

### 1. **Lokaal Ontwikkelen (.env bestand)**

Maak een `.env` bestand in je project root:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin Passwords
REACT_APP_ADMIN_PASSWORD=your_secure_admin_password
REACT_APP_TEST_PASSWORD=your_secure_test_password

# Email Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
TRANSIP_EMAIL=your_email@transip.nl
TRANSIP_PASSWORD=your_transip_password
```

### 2. **Productie (Vercel Environment Variables)**

Ga naar je Vercel dashboard → Project Settings → Environment Variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | `your_anon_key_here` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_service_role_key_here` | Production, Preview, Development |
| `REACT_APP_ADMIN_PASSWORD` | `your_secure_password` | Production, Preview, Development |
| `REACT_APP_TEST_PASSWORD` | `your_secure_password` | Production, Preview, Development |

---

## 🔐 Supabase Keys Uitleg

### **Anon Key (Client-side)**
- **Gebruik:** Frontend applicatie
- **Rechten:** Beperkt, alleen wat je toestaat via RLS policies
- **Veilig:** Kan in frontend code (maar beter in env vars)

### **Service Role Key (Server-side)**
- **Gebruik:** Backend/API endpoints
- **Rechten:** Volledige database toegang
- **⚠️ KRITIEK:** NOOIT in frontend code of GitHub!

---

## 🚨 Security Checklist

### ✅ **Wat WEL te doen:**
- [ ] Gebruik `.env` bestanden lokaal
- [ ] Zet `.env` in `.gitignore`
- [ ] Gebruik Vercel Environment Variables voor productie
- [ ] Gebruik alleen Anon Key in frontend
- [ ] Service Role Key alleen in API endpoints
- [ ] Regelmatig keys roteren

### ❌ **Wat NOOIT te doen:**
- [ ] Hardcoded credentials in code
- [ ] Credentials in GitHub (ook niet in private repos)
- [ ] Service Role Key in frontend
- [ ] Credentials in console.log statements
- [ ] Keys delen via email/chat

---

## 🔧 Setup Instructies

### **Stap 1: Lokaal Setup**
```bash
# Kopieer env.example naar .env
cp env.example .env

# Bewerk .env met je echte credentials
nano .env

# Test lokaal
npm run dev
```

### **Stap 2: Vercel Setup**
1. Ga naar Vercel Dashboard
2. Selecteer je project
3. Ga naar Settings → Environment Variables
4. Voeg alle variabelen toe
5. Deploy opnieuw

### **Stap 3: Test Setup**
```bash
# Test Supabase connectie
curl https://your-domain.vercel.app/api/test-supabase

# Of ga naar
https://your-domain.vercel.app/supabase-test
```

---

## 🆘 Troubleshooting

### **"Missing Supabase credentials" Error**
- Controleer of alle environment variables zijn ingesteld
- Controleer of de keys correct zijn gekopieerd
- Test met `/api/test-supabase` endpoint

### **"Failed to fetch" Error**
- Controleer Supabase URL
- Controleer of de database online is
- Controleer RLS policies

### **"Authentication failed" Error**
- Controleer of de keys correct zijn
- Controleer of de keys niet zijn geëxpireerd
- Controleer of de keys de juiste rechten hebben

---

## 📞 Support

Als je problemen hebt met de setup:
1. Controleer de Supabase test pagina: `/supabase-test`
2. Controleer de Vercel logs
3. Controleer of alle environment variables zijn ingesteld
4. Controleer of de Supabase project actief is

**Remember: Security first! 🔒**
