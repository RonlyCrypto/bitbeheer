#!/usr/bin/env node

/**
 * Security Check Script
 * Controleert of er geen hardcoded credentials in de code staan
 */

const fs = require('fs');
const path = require('path');

// Patterns die NOOIT in code mogen staan
const DANGEROUS_PATTERNS = [
  /sb_publishable_[A-Za-z0-9_-]+/g,
  /sb_secret_[A-Za-z0-9_-]+/g,
  /https:\/\/[a-z0-9-]+\.supabase\.co/g,
  /sk-[A-Za-z0-9_-]+/g,
  /pk_[A-Za-z0-9_-]+/g,
  /password\s*=\s*['"][^'"]+['"]/g,
  /api[_-]?key\s*=\s*['"][^'"]+['"]/g,
  /secret\s*=\s*['"][^'"]+['"]/g,
  /token\s*=\s*['"][^'"]+['"]/g
];

// Patterns die genegeerd mogen worden (placeholders)
const IGNORE_PATTERNS = [
  /\[SET_IN_ENV_VARS\]/g,
  /your_.*_here/g,
  /dummy_/g,
  /placeholder/g,
  /example/g,
  /SET_IN_ENV_VARS/g
];

// Bestanden die gecontroleerd moeten worden
const FILES_TO_CHECK = [
  'src/**/*.js',
  'src/**/*.ts',
  'src/**/*.tsx',
  'api/**/*.js',
  '*.js',
  '*.ts',
  '*.tsx'
];

// Bestanden die genegeerd mogen worden
const IGNORE_FILES = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'scripts',
  'SECURITY_SETUP.md',
  'env.example'
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_FILES.some(pattern => filePath.includes(pattern))) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (filePath.match(/\.(js|ts|tsx)$/)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function checkFileForCredentials(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  DANGEROUS_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Check if this match should be ignored (placeholder)
        const shouldIgnore = IGNORE_PATTERNS.some(ignorePattern => 
          ignorePattern.test(match)
        );
        
        if (!shouldIgnore) {
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          
          issues.push({
            file: filePath,
            line: lineNumber,
            pattern: pattern.toString(),
            match: match,
            severity: 'HIGH'
          });
        }
      });
    }
  });
  
  return issues;
}

function main() {
  console.log('🔒 Security Check - BitBeheer Credentials Scan\n');
  
  const allFiles = getAllFiles('.');
  const allIssues = [];
  
  allFiles.forEach(file => {
    const issues = checkFileForCredentials(file);
    allIssues.push(...issues);
  });
  
  if (allIssues.length === 0) {
    console.log('✅ Geen hardcoded credentials gevonden!');
    console.log('🔒 Je code is veilig voor GitHub upload.');
    process.exit(0);
  } else {
    console.log(`❌ ${allIssues.length} potentiële security issues gevonden:\n`);
    
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}:${issue.line}`);
      console.log(`   Pattern: ${issue.pattern}`);
      console.log(`   Match: ${issue.match}`);
      console.log(`   Severity: ${issue.severity}\n`);
    });
    
    console.log('🚨 ACTIE VEREIST:');
    console.log('- Verwijder alle hardcoded credentials');
    console.log('- Gebruik environment variables');
    console.log('- Controleer .env bestand is in .gitignore');
    console.log('- Test lokaal met .env bestand');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFileForCredentials, getAllFiles };
