#!/bin/bash

# Supabase connection details
DB_HOST="db.clqbnkvnydlxtimiazqf.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Check if password is provided
if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: DB_PASSWORD environment variable not set"
  echo "   Run: export DB_PASSWORD='your_password'"
  exit 1
fi

echo "🚀 Pushing SQL chunks to Supabase..."
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo ""

cd "/Users/giovanni/AI code/DCA platform/sql-chunks" || exit

# Run files in order
for file in 1-setup.sql 2-insert-*.sql 84-verify.sql; do
  for f in $file; do
    if [ -f "$f" ]; then
      echo "▶️  Running: $f"
      
      # Execute SQL file
      PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$f" \
        2>&1 | tail -5
      
      if [ $? -eq 0 ]; then
        echo "   ✅ Success"
      else
        echo "   ❌ Error - stopping"
        exit 1
      fi
      echo ""
    fi
  done
done

echo "🎉 All SQL chunks executed successfully!"
