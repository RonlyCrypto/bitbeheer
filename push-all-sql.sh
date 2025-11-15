#!/bin/bash

# Direct SQL via psql connection string
# Install: brew install postgresql

PASSWORD="${DB_PASSWORD:-}"
HOST='db.clqbnkvnydlxtimiazqf.supabase.co'

if [ -z "$PASSWORD" ]; then
  echo "❌ Error: DB_PASSWORD environment variable not set"
  echo "   Run: export DB_PASSWORD='your_password'"
  exit 1
fi
USER='postgres'
DB='postgres'

echo "🚀 Pushing Bitcoin data to Supabase..."
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "❌ psql not found. Install PostgreSQL:"
  echo "   brew install postgresql"
  exit 1
fi

cd sql-chunks

# Count files
TOTAL=$(ls *.sql | wc -l)
COUNT=0

# Run in order
for f in $(ls *.sql | sort -V); do
  COUNT=$((COUNT + 1))
  echo "[$COUNT/$TOTAL] Running: $f"
  
  PGPASSWORD="$PASSWORD" psql -h "$HOST" -U "$USER" -d "$DB" -f "$f" > /dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    echo "  ✅ OK"
  else
    echo "  ❌ Failed"
  fi
done

echo ""
echo "🎉 Done! Hard refresh browser (Cmd+Shift+R)"
