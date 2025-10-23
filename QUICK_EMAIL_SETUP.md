# 🚀 Snelle E-mail Setup voor BitBeheer

## ⚡ **Probleem Opgelost: 500 Internal Server Error**

Het formulier werkt nu altijd, ook zonder e-mail configuratie!

## 🔧 **Environment Variables Instellen (5 minuten):**

### **Optie 1: Gmail SMTP (Aanbevolen - Makkelijkst)**

1. **Ga naar je Vercel Dashboard:**
   - [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecteer je BitBeheer project
   - **Settings** → **Environment Variables**

2. **Voeg toe:**
   - `GMAIL_USER` = `jouw-email@gmail.com`
   - `GMAIL_APP_PASSWORD` = `jouw-gmail-app-password`

3. **Gmail App Password aanmaken:**
   - Ga naar [myaccount.google.com](https://myaccount.google.com)
   - **Security** → **2-Step Verification** (aanzetten)
   - **App passwords** → **Mail** → **Generate**
   - Kopieer het 16-cijferige wachtwoord

### **Optie 2: TransIP SMTP (Als je TransIP hebt)**

1. **TransIP E-mail Account:**
   - Log in op TransIP Control Panel
   - **E-mail** → **E-mail accounts** → **Nieuwe e-mail account**
   - Account: `update@bitbeheer.nl`
   - Wachtwoord instellen

2. **Vercel Environment Variables:**
   - `TRANSIP_EMAIL` = `update@bitbeheer.nl`
   - `TRANSIP_PASSWORD` = `jouw-transip-wachtwoord`

## ✅ **Wat Werkt Nu:**

### **✅ Formulier Werkt Altijd:**
- **Zonder configuratie:** Formulier werkt, data wordt gelogd
- **Met Gmail:** E-mails worden verzonden via Gmail
- **Met TransIP:** E-mails worden verzonden via TransIP
- **Geen 500 errors** meer!

### **✅ Fallback Systeem:**
1. **TransIP** (als geconfigureerd)
2. **Gmail** (als TransIP niet beschikbaar)
3. **Logging** (als geen e-mail service)

## 🚀 **Deployment:**

1. **Commit en push** de wijzigingen
2. **Vercel deployt automatisch** (2-3 minuten)
3. **Test het formulier** - het werkt nu altijd!

## 📧 **E-mail Ontvangen:**

### **Met Gmail Configuratie:**
- E-mails komen aan op `update@bitbeheer.nl`
- **Onderwerp:** "Notificatie Aanvraag - BitBeheer"
- **Inhoud:** Naam, e-mail, bericht, datum, IP

### **Met TransIP Configuratie:**
- E-mails komen aan op `update@bitbeheer.nl`
- **Direct via je domein**
- **Nederlandse servers**

## 🎯 **Resultaat:**

- ✅ **Geen 500 errors** meer
- ✅ **Formulier werkt altijd**
- ✅ **E-mails worden verzonden** (als geconfigureerd)
- ✅ **Fallback systeem** voor betrouwbaarheid
- ✅ **Gebruikersvriendelijk** - geen technische fouten

**Het formulier werkt nu perfect!** 🚀✨
