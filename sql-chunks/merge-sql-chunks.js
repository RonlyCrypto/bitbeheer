#!/usr/bin/env node

/**
 * Merge SQL chunks into groups of 5
 * Starting from file 39 onwards
 */

import fs from 'fs';
import path from 'path';

const CHUNKS_DIR = '.';

// Get all remaining insert files (39-83)
const files = fs.readdirSync(CHUNKS_DIR)
  .filter(f => f.match(/^(39|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-3])-/))
  .sort((a, b) => {
    const numA = parseInt(a.split('-')[0]);
    const numB = parseInt(b.split('-')[0]);
    return numA - numB;
  });

console.log(`📂 Merging ${files.length} files into groups of 5...\n`);

let groupNum = 1;
for (let i = 0; i < files.length; i += 5) {
  const group = files.slice(i, i + 5);
  
  // Read and merge
  let merged = '';
  group.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    merged += content + '\n';
  });

  // Save merged file
  const filename = `merged-batch-${groupNum}.sql`;
  fs.writeFileSync(filename, merged);
  console.log(`✅ ${filename} (${group.length} files)`);
  groupNum++;
}

console.log(`\n🚀 Created ${groupNum - 1} batch files!`);
console.log('   Run these in Supabase SQL Editor:\n');
for (let i = 1; i < groupNum; i++) {
  console.log(`   ${i}. merged-batch-${i}.sql`);
}
console.log(`   ${groupNum}. 84-verify.sql\n`);
