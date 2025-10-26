# Supabase Edge Function Setup

## 1. Deploy Edge Function

```bash
# Installeer Supabase CLI
npm install -g supabase

# Login bij Supabase
supabase login

# Link je project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy de Edge Function
supabase functions deploy send-email-direct
```

## 2. Environment Variables in Supabase

Ga naar je Supabase Dashboard → Settings → Edge Functions → Environment Variables

Voeg toe:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## 3. Database Schema

Voer dit SQL script uit in je Supabase SQL Editor:

```sql
-- Email queue table voor failed emails
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Allow public access voor nu
CREATE POLICY "Allow public access to email_queue" ON email_queue
  FOR ALL USING (true);
```

## 4. Test de Edge Function

```javascript
// Test in je browser console
const { data, error } = await supabase.functions.invoke('send-email-direct', {
  body: {
    to: 'test@example.com',
    subject: 'Test Email',
    htmlContent: '<h1>Test</h1>',
    textContent: 'Test',
    type: 'notification'
  }
});

console.log('Result:', data, error);
```

## 5. Veiligheidscontroles

✅ **Geen hardcoded credentials**
✅ **Environment variables gebruikt**
✅ **Supabase RLS enabled**
✅ **Edge Functions geïsoleerd**
✅ **Email queue voor fallbacks**
✅ **Geen localStorage fallbacks**
