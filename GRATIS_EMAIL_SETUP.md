# 🆓 Gratis E-mail Setup voor BitBeheer

## ✅ **Gmail SMTP (Aanbevolen - Volledig Gratis!)**

### **Stap 1: Gmail App Password Aanmaken**

1. **Ga naar je Google Account**: [myaccount.google.com](https://myaccount.google.com)
2. **Security** → **2-Step Verification** (moet aan staan)
3. **App passwords** → **Select app** → **Mail**
4. **Generate** → Kopieer het 16-cijferige wachtwoord

### **Stap 2: Vercel Environment Variables**

Ga naar je Vercel dashboard:
1. **Project Settings** → **Environment Variables**
2. Voeg toe:
   - `GMAIL_USER` = `jouw-email@gmail.com`
   - `GMAIL_APP_PASSWORD` = `het-16-cijferige-wachtwoord`

### **Stap 3: Klaar!**
De API gebruikt nu je Gmail account om e-mails te versturen naar `update@bitbeheer.nl`

---

## 🆓 **Alternatieve Gratis Opties:**

### **Option A: TransIP SMTP (Als je TransIP hosting hebt)**
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.transip.nl',
  port: 587,
  secure: false,
  auth: {
    user: 'jouw-email@jouw-domein.nl',
    pass: 'jouw-transip-wachtwoord'
  }
});
```

### **Option B: Outlook/Hotmail SMTP (Gratis)**
```javascript
const transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: 'jouw-email@outlook.com',
    pass: 'jouw-outlook-wachtwoord'
  }
});
```

### **Option C: Yahoo SMTP (Gratis)**
```javascript
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: 'jouw-email@yahoo.com',
    pass: 'jouw-yahoo-app-password'
  }
});
```

---

## 🚀 **Implementatie Stappen:**

### **1. Kies je gratis optie**
- **Gmail** (meest betrouwbaar)
- **TransIP** (als je TransIP hosting hebt)
- **Outlook** (Microsoft account)

### **2. Update API route**
Vervang de transporter configuratie in `/api/send-notification.js` met je gekozen optie.

### **3. Environment Variables**
Voeg de benodigde credentials toe aan Vercel.

### **4. Test**
Test het formulier - je ontvangt e-mails op `update@bitbeheer.nl`

---

## 💰 **Kosten Overzicht:**

| Service | Kosten | Limiet per dag |
|---------|--------|---------------|
| **Gmail SMTP** | 🆓 Gratis | 500 e-mails |
| **TransIP SMTP** | 🆓 Gratis | Onbeperkt* |
| **Outlook SMTP** | 🆓 Gratis | 300 e-mails |
| **Yahoo SMTP** | 🆓 Gratis | 500 e-mails |

*Afhankelijk van je TransIP hosting plan

---

## 🔒 **Beveiliging:**

### **✅ Wat is beveiligd:**
- **HTTPS-only** communicatie
- **Server-side** e-mail verwerking
- **App passwords** (niet je hoofdwachtwoord)
- **Environment variables** (niet in code)

### **🚫 Wat is NIET meer:**
- **Mailto links** (onveilig)
- **Client-side** e-mail (onveilig)
- **Plain text** wachtwoorden

---

## 🆘 **Troubleshooting:**

### **"Authentication failed"**
- Controleer of 2FA aan staat op Gmail
- Controleer of je App Password gebruikt (niet hoofdwachtwoord)
- Controleer environment variables in Vercel

### **"Connection timeout"**
- Controleer firewall instellingen
- Probeer andere SMTP service
- Controleer Vercel function logs

### **E-mails komen niet aan**
- Controleer spam folder
- Controleer of `update@bitbeheer.nl` bestaat
- Controleer SMTP logs in Vercel

---

## 🎯 **Aanbeveling:**

**Gebruik Gmail SMTP** - het is:
- ✅ Volledig gratis
- ✅ Zeer betrouwbaar  
- ✅ Makkelijk te configureren
- ✅ Goede deliverability
- ✅ 500 e-mails per dag (meer dan genoeg)

**Voor BitBeheer is dit perfect!** 🚀
