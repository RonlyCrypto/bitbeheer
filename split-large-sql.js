#!/usr/bin/env node

/**
 * Split large SQL file into smaller chunks
 * This helps when the file is too large for Supabase SQL Editor
 */

import fs from 'fs';
import path from 'path';

const inputFile = '/Users/giovanni/AI code/DCA platform/rebuild-from-2014-yahoo.sql';
const outputDir = '/Users/giovanni/AI code/DCA platform/sql-chunks';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📂 Splitting large SQL file...\n');

// Read the file
const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.split('\n');

console.log(`   Total lines: ${lines.length}`);
console.log(`   File size: ${(content.length / 1024 / 1024).toFixed(2)} MB\n`);

// Find key sections
let setupEndLine = 0;
let insertStartLine = 0;
let verifyStartLine = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('DELETE FROM bitcoin_price_data')) {
    setupEndLine = i + 1;
  }
  if (lines[i].includes('INSERT INTO bitcoin_price_data') && insertStartLine === 0) {
    insertStartLine = i;
  }
  if (lines[i].includes('RE-ENABLE TRIGGERS')) {
    verifyStartLine = i;
  }
}

console.log(`   Setup section: lines 1-${setupEndLine}`);
console.log(`   Insert section: lines ${insertStartLine}-${verifyStartLine}`);
console.log(`   Verify section: lines ${verifyStartLine}-${lines.length}\n`);

// Create chunk 1: Setup (disable triggers, delete old data)
const chunk1 = lines.slice(0, setupEndLine).join('\n');
fs.writeFileSync(path.join(outputDir, '1-setup.sql'), chunk1);
console.log(`✅ Created: 1-setup.sql (${chunk1.split('\n').length} lines)`);

// Create chunks 2+: Split inserts into manageable sizes
const insertLines = lines.slice(insertStartLine, verifyStartLine);
const chunkSize = 500; // ~500 lines per chunk = ~50 inserts
let chunkNum = 2;

for (let i = 0; i < insertLines.length; i += chunkSize) {
  const chunk = insertLines.slice(i, i + chunkSize).join('\n');
  const filename = `${chunkNum}-insert-${Math.floor(i / chunkSize) + 1}.sql`;
  fs.writeFileSync(path.join(outputDir, filename), chunk);
  console.log(`✅ Created: ${filename} (${chunk.split('\n').length} lines)`);
  chunkNum++;
}

// Create final chunk: Verify/re-enable triggers
const finalChunk = lines.slice(verifyStartLine).join('\n');
fs.writeFileSync(path.join(outputDir, `${chunkNum}-verify.sql`), finalChunk);
console.log(`✅ Created: ${chunkNum}-verify.sql (${finalChunk.split('\n').length} lines)\n`);

console.log('🚀 Instructions:');
console.log(`   1. Run each file in order: 1-setup.sql, 2-insert-*.sql, ${chunkNum}-verify.sql`);
console.log(`   2. Each file is small enough for Supabase SQL Editor`);
console.log(`   3. Check output directory: ${outputDir}`);

