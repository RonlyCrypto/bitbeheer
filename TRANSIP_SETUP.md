# 🏠 TransIP SMTP Setup voor BitBeheer

## ✅ **TransIP E-mail Configuratie (Volledig Gratis!)**

### **Stap 1: TransIP E-mail Account Aanmaken**

1. **Log in op TransIP Control Panel**
   - Ga naar [transip.nl](https://transip.nl)
   - Log in met je TransIP account

2. **E-mail Account Aanmaken**
   - Ga naar **E-mail** → **E-mail accounts**
   - Klik **"Nieuwe e-mail account"**
   - Maak account aan: `update@bitbeheer.nl`
   - Stel wachtwoord in (bewaar dit goed!)

### **Stap 2: SMTP Instellingen Verkrijgen**

TransIP SMTP instellingen:
- **Host:** `smtp.transip.nl`
- **Port:** `587` (STARTTLS)
- **Security:** STARTTLS
- **Username:** `update@bitbeheer.nl`
- **Password:** Het wachtwoord dat je hebt ingesteld

### **Stap 3: Vercel Environment Variables**

Ga naar je Vercel dashboard:
1. **Project Settings** → **Environment Variables**
2. Voeg toe:
   - `TRANSIP_EMAIL` = `update@bitbeheer.nl`
   - `TRANSIP_PASSWORD` = `jouw-transip-wachtwoord`

### **Stap 4: Test de Configuratie**

Test of alles werkt:
1. Ga naar `https://bitbeheer.nl`
2. Vul het notificatie formulier in
3. Controleer of je e-mail ontvangt op `update@bitbeheer.nl`

---

## 🔒 **Beveiliging Features**

### **✅ Wat is Nu Beveiligd:**

#### **Rate Limiting:**
- **1 minuut cooldown** per IP adres
- **Client-side rate limiting** (localStorage)
- **Server-side rate limiting** (global store)

#### **Input Validation:**
- **E-mail format validatie** (server-side)
- **Lengte beperkingen** (email: 254 chars, naam: 100 chars, bericht: 1000 chars)
- **XSS bescherming** (HTML tags worden gefilterd)
- **Input sanitization** (trim, lowercase, special chars)

#### **CSRF Protection:**
- **X-Requested-With header** verificatie
- **XMLHttpRequest** alleen toegestaan
- **Origin validation** via CORS

#### **Data Security:**
- **HTTPS-only** communicatie
- **Server-side processing** van alle data
- **IP logging** voor monitoring
- **User Agent logging** voor tracking

---

## 📧 **E-mail Template**

Wanneer iemand het formulier invult, krijg je een beveiligde e-mail met:

### **Onderwerp:** "Notificatie Aanvraag - BitBeheer"

### **Inhoud:**
- **Naam:** Van de bezoeker (optioneel)
- **E-mail:** Van de bezoeker
- **Bericht:** Extra bericht (optioneel)
- **Datum:** Wanneer de aanvraag is gedaan
- **IP Adres:** Voor monitoring
- **User Agent:** Voor tracking

---

## 🚀 **Deployment**

### **Automatische Deployment:**
1. **Commit en push** de wijzigingen
2. **Vercel deployt automatisch** (2-3 minuten)
3. **Test de functionaliteit** op live site

### **Environment Variables Controleren:**
- Ga naar Vercel dashboard
- Controleer of `TRANSIP_EMAIL` en `TRANSIP_PASSWORD` zijn ingesteld
- **Redeploy** indien nodig

---

## 🆘 **Troubleshooting**

### **"Authentication failed"**
- Controleer TransIP e-mail account
- Controleer wachtwoord in environment variables
- Controleer of e-mail account actief is

### **"Connection timeout"**
- Controleer TransIP SMTP instellingen
- Controleer firewall instellingen
- Probeer port 465 (SSL) als alternatief

### **E-mails komen niet aan**
- Controleer spam folder
- Controleer TransIP e-mail logs
- Controleer Vercel function logs

### **Rate limit errors**
- Wacht 1 minuut tussen submissions
- Controleer of er geen andere processen spam versturen
- Controleer IP adres in logs

---

## 📊 **Monitoring**

### **E-mail Logs:**
- Controleer TransIP e-mail logs
- Controleer Vercel function logs
- Monitor IP adressen voor verdachte activiteit

### **Rate Limiting:**
- 1 minuut cooldown per IP
- Client-side en server-side bescherming
- Automatische cleanup van rate limit store

---

## 🎯 **Voordelen van TransIP Setup:**

- ✅ **Volledig gratis** met TransIP hosting
- ✅ **Nederlandse service** - snelle support
- ✅ **Onbeperkte e-mails** (afhankelijk van plan)
- ✅ **Direct via je domein** - `update@bitbeheer.nl`
- ✅ **Hoge deliverability** - Nederlandse servers
- ✅ **Geen externe dependencies** - alles via TransIP

**Perfect voor BitBeheer!** 🚀
