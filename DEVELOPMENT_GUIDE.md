# BitBeheer Development Guide

## 🎯 **Snelle Referentie voor Giovanni**

### **Hoe Voeg Ik Nieuwe Features Toe?**

#### **1. Email Functionaliteit**
```bash
# Nieuwe Edge Function maken
cd supabase/functions
mkdir nieuwe-email-functie
# Code schrijven in index.ts
# Deployen via CLI
supabase functions deploy nieuwe-email-functie --project-ref clqbnkvnydlxtimiazqf
```

#### **2. Database Wijzigingen**
- **Via Supabase Dashboard:** https://supabase.com/dashboard/project/clqbnkvnydlxtimiazqf
- **SQL Editor:** Direct SQL uitvoeren
- **Table Editor:** Visuele database beheer

#### **3. Frontend Features**
- **Directe Supabase communicatie** (geen Vercel APIs)
- **Gebruik:** `src/lib/supabase.js` voor database calls
- **Gebruik:** `src/services/directEmailService.ts` voor emails

---

## 🚨 **Belangrijke Regels**

### **Vercel API Limiet: MAX 12**
**Huidige APIs (10/12):**
- accounts.js
- admin-auth.js  
- categories.js
- create-account.js
- save-user-profile.js
- simple-verify-email.js
- sync-users.js
- users.js

**❌ NOOIT meer dan 12 APIs toevoegen!**

### **Email Service: ALTIJD via Supabase Edge Functions**
```typescript
// ✅ GOED - Via Edge Function
const response = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify(emailData)
});

// ❌ FOUT - Via Vercel API (gebruikt limiet)
const response = await fetch('/api/send-email', { ... });
```

---

## 🔧 **Veelgebruikte Commands**

### **Development**
```bash
# Website lokaal starten
npm run dev

# Build voor productie
npm run build

# TypeScript check
npm run type-check
```

### **Deployment**
```bash
# Code committen en deployen
git add .
git commit -m "Beschrijving van wijzigingen"
git push origin main
# Vercel deployt automatisch
```

### **Supabase Edge Functions**
```bash
# Edge Function deployen
export SUPABASE_ACCESS_TOKEN="sbp_be945f795c087383878dcc15877c86fb1a5480fd"
supabase functions deploy send-email --project-ref clqbnkvnydlxtimiazqf

# Edge Function testen
curl -X POST "https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-email" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","htmlContent":"<h1>Test</h1>","textContent":"Test"}'
```

---

## 📁 **Project Structuur**

```
src/
├── components/          # React componenten
│   ├── AdminDashboard.tsx
│   ├── NotificatieBeheer.tsx
│   └── ...
├── services/           # Business logic
│   └── directEmailService.ts
├── lib/               # Utilities
│   └── supabase.js
└── pages/             # Pagina's
    ├── FrontPage.tsx
    └── ...

api/                   # Vercel APIs (MAX 12!)
├── accounts.js
├── users.js
└── ...

supabase/
└── functions/         # Edge Functions (onbeperkt)
    └── send-email/
        └── index.ts
```

---

## 🐛 **Troubleshooting**

### **Email Werkt Niet**
1. **Check Edge Function logs:** Supabase Dashboard → Edge Functions → send-email → Logs
2. **Test Edge Function:** Gebruik curl command hierboven
3. **Check Resend API:** Log in op Resend dashboard

### **Database Issues**
1. **Check Supabase Dashboard:** https://supabase.com/dashboard/project/clqbnkvnydlxtimiazqf
2. **Check RLS policies:** Table Editor → Policies
3. **Check logs:** Logs → Database

### **Frontend Issues**
1. **Check browser console:** F12 → Console
2. **Check network tab:** F12 → Network
3. **Check Supabase logs:** Supabase Dashboard → Logs

---

## 🔐 **Security Checklist**

### **Voor Elke Wijziging:**
- [ ] Geen hardcoded passwords
- [ ] Geen credentials in frontend
- [ ] Alle secrets in Supabase/Vercel
- [ ] RLS policies correct
- [ ] Error handling geïmplementeerd

### **Code Review:**
- [ ] Geen `console.log` met gevoelige data
- [ ] Geen `localStorage` voor credentials
- [ ] Proper error handling
- [ ] TypeScript types correct

---

## 📞 **Hulp Nodig?**

### **Supabase Issues:**
- **Dashboard:** https://supabase.com/dashboard/project/clqbnkvnydlxtimiazqf
- **Documentation:** https://supabase.com/docs

### **Vercel Issues:**
- **Dashboard:** https://vercel.com/dashboard
- **Function Logs:** Vercel Dashboard → Functions

### **Development Issues:**
- **Check deze guide eerst**
- **Check ARCHITECTURE.md voor details**
- **Test lokaal voordat je deployt**

---

**Laatste Update:** 2025-01-26
**Versie:** 1.0
**Status:** ✅ Actief
