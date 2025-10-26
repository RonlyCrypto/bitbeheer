# BitBeheer Architectuur Documentatie

## 🏗️ **Huidige Architectuur (2025)**

### **Core Principe: Supabase-First Approach**
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Email Service:** Supabase Edge Functions + Resend API
- **Frontend:** React + Vite
- **Hosting:** Vercel (met API limiet management)

---

## 📊 **API Strategie**

### **Vercel APIs (Max 12 voor Hobby Plan)**
**Huidige APIs (10/12):**
1. `accounts.js` - Account management
2. `admin-auth.js` - Admin authenticatie
3. `categories.js` - Categorie beheer
4. `create-account.js` - Nieuwe accounts aanmaken
5. `save-user-profile.js` - User profile data
6. `simple-verify-email.js` - Email verificatie
7. `sync-users.js` - User synchronisatie
8. `users.js` - User data management
9. `send-email.js` - **VERWIJDERD** (vervangen door Edge Function)
10. `send-bulk-email.js` - **VERWIJDERD** (vervangen door Edge Function)

### **Supabase Edge Functions (Onbeperkt)**
- `send-email` - Email verzending via Resend API
- **Voordelen:** Geen Vercel limiet, veilige credentials, schaalbaar

---

## 🔐 **Security Model**

### **Credentials Opslag**
- ✅ **Supabase Edge Functions:** Alle API keys veilig opgeslagen
- ✅ **Vercel Environment Variables:** Alleen publieke configuratie
- ❌ **Frontend:** Geen credentials, alleen publieke keys

### **Email Service**
```
Frontend → Supabase Edge Function → Resend API → Email verzonden
```

### **Database Access**
```
Frontend → Supabase Client → Supabase Database
Backend APIs → Supabase Service Role Key → Supabase Database
```

---

## 🚀 **Deployment Strategie**

### **Frontend (Vercel)**
- **Build:** `npm run build`
- **Deploy:** `git push origin main` (automatisch)
- **Environment Variables:** `VITE_` prefix voor frontend

### **Backend (Supabase)**
- **Edge Functions:** `supabase functions deploy`
- **Database:** Via Supabase Dashboard of CLI
- **Credentials:** Via Supabase Secrets

---

## 📧 **Email Service Architectuur**

### **Edge Function: send-email**
- **URL:** `https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-email`
- **Authentication:** JWT uitgeschakeld voor testing
- **Provider:** Resend API
- **Fallback:** Email queue in database

### **Frontend Integration**
```typescript
// src/services/directEmailService.ts
const response = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify(emailData)
});
```

---

## 🗄️ **Database Schema**

### **Core Tables**
- `users` - Gebruikers data met verificatie
- `accounts` - Account management
- `categories` - Formulier categorieën
- `email_queue` - Failed email fallback
- `form_submissions` - Formulier data

### **Key Features**
- **Row Level Security (RLS)** - Veilige data toegang
- **Real-time updates** - Live data synchronisatie
- **Email verificatie** - 5-dagen limiet systeem
- **Admin protection** - Admin accounts altijd actief

---

## 🎯 **Development Workflow**

### **Nieuwe Features Toevoegen**
1. **Database changes:** Via Supabase Dashboard
2. **Email functionaliteit:** Via Edge Functions
3. **API endpoints:** Alleen als Vercel limiet toestaat
4. **Frontend:** Directe Supabase communicatie

### **Troubleshooting**
- **Email issues:** Check Edge Function logs in Supabase
- **Database issues:** Check Supabase Dashboard
- **API issues:** Check Vercel Function logs
- **Frontend issues:** Check browser console

---

## 📋 **Best Practices**

### **DO's**
- ✅ Gebruik Supabase Edge Functions voor email
- ✅ Directe Supabase communicatie vanuit frontend
- ✅ Veilige credential opslag in Supabase
- ✅ RLS policies voor database security
- ✅ Error handling en fallbacks

### **DON'Ts**
- ❌ Geen credentials in frontend code
- ❌ Geen hardcoded passwords
- ❌ Geen localStorage voor gevoelige data
- ❌ Geen onveilige API fallbacks
- ❌ Geen Vercel API overbelasting

---

## 🔄 **Migration History**

### **Van Vercel APIs naar Supabase Edge Functions**
- **Probleem:** Vercel 12 API limiet
- **Oplossing:** Email service naar Supabase Edge Functions
- **Resultaat:** Onbeperkte schaalbaarheid, betere security

### **Van Hardcoded naar Environment Variables**
- **Probleem:** Security risico's
- **Oplossing:** Alle credentials in Supabase/Vercel
- **Resultaat:** Veilige, professionele setup

---

## 📞 **Contact & Support**

- **Supabase Project:** clqbnkvnydlxtimiazqf
- **Vercel Project:** bitbeheer
- **Domain:** bitbeheer.nl
- **Email Service:** Resend API

---

**Laatste Update:** 2025-01-26
**Status:** ✅ Productie Ready
**Architectuur:** Supabase-First, Vercel-Hybrid
