#!/bin/bash

# Script to deploy the create-appointment Edge Function to Supabase

echo "🚀 Deploying create-appointment Edge Function to Supabase..."
echo ""

# Check if logged in
if ! supabase projects list &>/dev/null; then
  echo "❌ Not logged in to Supabase CLI"
  echo "📝 Please run: supabase login"
  echo "   Then run this script again"
  exit 1
fi

# Link to project if not already linked
if [ ! -d ".supabase" ]; then
  echo "🔗 Linking to Supabase project..."
  supabase link --project-ref clqbnkvnydlxtimiazqf
fi

# Deploy the function
echo "📦 Deploying create-appointment function..."
supabase functions deploy create-appointment --project-ref clqbnkvnydlxtimiazqf

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Edge Function successfully deployed!"
  echo ""
  echo "⚠️  Don't forget to set the SUPABASE_SERVICE_ROLE_KEY in Supabase Dashboard:"
  echo "   1. Go to Project Settings → Edge Functions"
  echo "   2. Add secret: SUPABASE_SERVICE_ROLE_KEY"
  echo "   3. Value: Your service role key from Supabase Dashboard"
else
  echo ""
  echo "❌ Deployment failed. Check the error above."
  exit 1
fi

