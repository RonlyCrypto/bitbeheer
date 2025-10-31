# 🔍 Instructies: Check Admin Account en Appointments

## Stap 1: Check of Admin Account bestaat in Supabase Auth

1. Ga naar: **Supabase Dashboard → SQL Editor**
2. Voer dit uit:

```sql
SELECT email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'admin@bitbeheer.nl';
```

**Als dit 0 resultaten geeft:**
- Je admin account staat NIET in Supabase Auth
- Je moet het aanmaken via: **Supabase Dashboard → Authentication → Users → Add user**

**Als het WEL bestaat:**
- Noteer de `email_confirmed_at` datum
- Ga door naar Stap 2

---

## Stap 2: Check Browser Console Logs

1. Open de website: `https://www.bitbeheer.nl`
2. Log in als admin: `admin@bitbeheer.nl`
3. Ga naar: **Admin Dashboard → Afspraken**
4. Open Browser Console (F12 → Console tab)
5. Zoek naar deze logs:

### Wat je moet zien:

```
🔐 Admin loading data - Session: {
  email: "admin@bitbeheer.nl",  ← MOET admin@bitbeheer.nl zijn
  isAdmin: true,                 ← MOET true zijn
  hasSession: true,             ← MOET true zijn
  hasToken: true                ← MOET true zijn
}
```

### Als `email` NIET `admin@bitbeheer.nl` is:

- Je bent niet correct ingelogd als admin
- Log uit en opnieuw in
- Check of je via Supabase Auth inlogt (niet via localStorage)

### Als `email` WEL `admin@bitbeheer.nl` is, maar appointments zijn leeg:

- Kijk naar deze log:
  ```
  📥 Query response received: {
    hasData: false,
    dataLength: 0,
    error: {...}  ← Check deze error
  }
  ```

**Als er een RLS error is (code: 42501):**
- Voer `fix-all-appointments-rls.sql` uit in Supabase SQL Editor

**Als er GEEN error is, maar wel 0 appointments:**
- Check of appointments bestaan in de database:
  ```sql
  SELECT COUNT(*) FROM public.appointments;
  ```

---

## Stap 3: Directe Database Check

Voer dit uit in **Supabase SQL Editor**:

```sql
-- Check appointments count
SELECT COUNT(*) as total_appointments FROM public.appointments;

-- Check appointments data
SELECT id, user_email, date, start_time, status 
FROM public.appointments 
ORDER BY created_at DESC 
LIMIT 5;
```

**Als je appointments ziet hier maar NIET in de admin dashboard:**
- Dan is het een RLS probleem
- Voer `fix-all-appointments-rls.sql` uit

---

## Stap 4: Test Admin Session Direct

In de browser console (F12), voer dit uit:

```javascript
// Check session
const { data: session } = await supabase.auth.getSession();
console.log('Session:', session?.session?.user?.email);

// Try to read appointments
const { data, error } = await supabase
  .from('appointments')
  .select('*')
  .limit(5);

console.log('Appointments:', data);
console.log('Error:', error);
```

**Als `session?.session?.user?.email` NIET `admin@bitbeheer.nl` is:**
- Je admin account staat niet in Supabase Auth
- Maak het aan via Supabase Dashboard

---

## Samenvatting

**Meest waarschijnlijke oorzaken:**
1. ❌ Admin account staat niet in Supabase Auth → Maak aan via Dashboard
2. ❌ RLS policies zijn incorrect → Voer `fix-all-appointments-rls.sql` uit
3. ❌ Je bent niet ingelogd als admin → Log opnieuw in

**Stuur de volgende informatie:**
- Output van Stap 1 (SQL query)
- Browser console logs (`🔐 Admin loading data - Session:`)
- Browser console logs (`📥 Query response received:`)
- Eventuele errors

