# 🗄️ Database Setup - BitBeheer

## 🎯 **Aanbevolen: Supabase**

### **Waarom Supabase?**
- ✅ **PostgreSQL** - Krachtige relationele database
- ✅ **Real-time** - Live updates voor admin dashboard
- ✅ **Authentication** - Ingebouwde user management
- ✅ **Gratis tier** - Perfect voor ontwikkeling
- ✅ **Nederlandse servers** - Snelle response times
- ✅ **Dashboard** - Visuele database management

## 🚀 **Setup Stappen:**

### **1. Supabase Account Aanmaken**
1. Ga naar [supabase.com](https://supabase.com)
2. Klik "Start your project"
3. Maak account aan
4. Klik "New Project"

### **2. Project Configuratie**
- **Name:** bitbeheer
- **Database Password:** [sterk wachtwoord]
- **Region:** Europe (Amsterdam)
- **Pricing:** Free tier

### **3. Database Schema**
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  message TEXT,
  category VARCHAR(100) DEFAULT 'livegang',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_date TIMESTAMP WITH TIME ZONE
);

-- Accounts table
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'account_aanmelden',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_test BOOLEAN DEFAULT FALSE
);

-- Page visibility settings
CREATE TABLE page_visibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name VARCHAR(100) UNIQUE NOT NULL,
  visible_to_public BOOLEAN DEFAULT FALSE,
  visible_to_admin BOOLEAN DEFAULT TRUE,
  visible_to_test BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **4. Environment Variables**
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database URL (voor serverless functions)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

## 🔧 **Implementatie:**

### **1. Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

### **2. Supabase Client Setup**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### **3. Database Functions**
```javascript
// Users
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Accounts
export const getAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
```

## 📊 **Voordelen van Database:**

### **1. Data Persistentie**
- ✅ **Geen data verlies** bij browser refresh
- ✅ **Backup** automatisch
- ✅ **Recovery** mogelijk

### **2. Scalability**
- ✅ **Meerdere gebruikers** tegelijk
- ✅ **Real-time updates** mogelijk
- ✅ **Performance** optimalisatie

### **3. Security**
- ✅ **Row Level Security** (RLS)
- ✅ **Encrypted** data storage
- ✅ **Access control** per gebruiker

### **4. Analytics**
- ✅ **User behavior** tracking
- ✅ **Performance** metrics
- ✅ **Usage** statistics

## 🎯 **Migratie Plan:**

### **Fase 1: Setup**
1. Supabase project aanmaken
2. Database schema implementeren
3. Environment variables configureren

### **Fase 2: API Updates**
1. Update `/api/users` voor Supabase
2. Update `/api/accounts` voor Supabase
3. Update `/api/emails` voor Supabase

### **Fase 3: Frontend Updates**
1. Update components voor database
2. Real-time updates implementeren
3. Error handling verbeteren

## 💰 **Kosten:**
- **Free tier:** 500MB database, 2GB bandwidth
- **Pro tier:** $25/maand voor meer resources
- **Perfect** voor BitBeheer gebruik

Wil je dat ik de Supabase setup implementeer?
