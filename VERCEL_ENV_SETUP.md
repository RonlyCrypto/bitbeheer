# 🚀 Vercel Environment Variables Setup

## ⚠️ BELANGRIJK: Vite vs React Environment Variables

**Vite gebruikt `VITE_` prefix, niet `REACT_APP_`!**

---

## 🔧 Environment Variables voor Vercel

### **Frontend Variables (VITE_ prefix):**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **Backend Variables (REACT_APP_ prefix voor API endpoints):**
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### **Email Variables:**
```
TRANSIP_EMAIL=update@bitbeheer.nl
TRANSIP_PASSWORD=your_transip_password
TRANSIP_EMAIL_UPDATE=update@bitbeheer.nl
TRANSIP_PASSWORD_UPDATE=your_transip_password
TRANSIP_EMAIL_INFO=info@bitbeheer.nl
TRANSIP_PASSWORD_INFO=your_transip_password
TRANSIP_EMAIL_NOREPLY=noreply@bitbeheer.nl
TRANSIP_PASSWORD_NOREPLY=your_noreply_password
```

---

## 📋 Stap-voor-Stap Setup

### **1. Ga naar Vercel Dashboard**
- Project Settings → Environment Variables

### **2. Voeg Frontend Variables toe:**
| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` | Production, Preview, Development |

### **3. Voeg Backend Variables toe:**
| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key_here` | Production, Preview, Development |

### **4. Voeg Email Variables toe:**
| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `TRANSIP_EMAIL` | `update@bitbeheer.nl` | Production, Preview, Development |
| `TRANSIP_PASSWORD` | `your_transip_password` | Production, Preview, Development |
| `TRANSIP_EMAIL_UPDATE` | `update@bitbeheer.nl` | Production, Preview, Development |
| `TRANSIP_PASSWORD_UPDATE` | `your_transip_password` | Production, Preview, Development |
| `TRANSIP_EMAIL_INFO` | `info@bitbeheer.nl` | Production, Preview, Development |
| `TRANSIP_PASSWORD_INFO` | `your_transip_password` | Production, Preview, Development |
| `TRANSIP_EMAIL_NOREPLY` | `noreply@bitbeheer.nl` | Production, Preview, Development |
| `TRANSIP_PASSWORD_NOREPLY` | `your_noreply_password` | Production, Preview, Development |

### **5. Deploy opnieuw**
- Na het toevoegen van alle variables
- Ga naar Deployments → Redeploy

---

## 🔍 Test de Setup

### **1. Supabase Test:**
```
https://www.bitbeheer.nl/supabase-test
```

### **2. API Test:**
```
https://www.bitbeheer.nl/api/test-supabase
```

### **3. Mail Formulieren:**
- Notificatie formulier op homepage
- Registratie formulier via login modal
- Contact formulier via admin dashboard

---

## 🚨 Troubleshooting

### **"Missing Supabase credentials" Error:**
- Controleer of `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` zijn ingesteld
- Controleer of de values correct zijn gekopieerd
- Redeploy na het toevoegen van variables

### **"Failed to fetch" Error:**
- Controleer of `REACT_APP_SUPABASE_URL` en `REACT_APP_SUPABASE_ANON_KEY` zijn ingesteld
- Controleer of `SUPABASE_SERVICE_ROLE_KEY` is ingesteld
- Controleer Supabase project status

### **Mail formulieren werken niet:**
- Controleer of alle TRANSIP_* variables zijn ingesteld
- Controleer TransIP credentials
- Test via Supabase test pagina

---

## ✅ Checklist

- [ ] `VITE_SUPABASE_URL` toegevoegd
- [ ] `VITE_SUPABASE_ANON_KEY` toegevoegd  
- [ ] `REACT_APP_SUPABASE_URL` toegevoegd
- [ ] `REACT_APP_SUPABASE_ANON_KEY` toegevoegd
- [ ] `SUPABASE_SERVICE_ROLE_KEY` toegevoegd
- [ ] Alle TRANSIP_* variables toegevoegd
- [ ] Redeploy uitgevoerd
- [ ] Supabase test succesvol
- [ ] Mail formulieren werken

**Na deze setup zou alles moeten werken!** 🎉
