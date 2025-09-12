#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix common syntax errors from the automated replacement
const syntaxFixes = [
  // Fix combineClasses without quotes
  [/className=\{combineClasses\(([^"'][^)]*)\)\}/g, 'className={combineClasses("$1")}'],
  
  // Fix template literals that got broken
  [/className=\{combineClasses\("([^"]*)\$\{([^}]+)\}([^"]*)"\)\}/g, 'className={`$1${$2}$3`}'],
  
  // Fix simple template literals
  [/className=\{combineClasses\("([^"]*)\$\{([^}]+)\}"\)\}/g, 'className={`$1${$2}`}'],
  
  // Fix missing quotes in combineClasses
  [/combineClasses\(([^"'][^)]*)\)/g, 'combineClasses("$1")'],
  
  // Fix broken template literals
  [/className=\{([^"'][^}]*\$\{[^}]+\}[^}]*)\}/g, 'className={`$1`}'],
];

function fixSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    for (const [pattern, replacement] of syntaxFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed syntax errors in: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findComponentFiles() {
  const componentsDir = path.join(__dirname, '../components');
  const files = [];
  
  function traverse(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(componentsDir);
  return files;
}

function main() {
  console.log('🔧 Fixing syntax errors...');
  const files = findComponentFiles();
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixSyntaxErrors(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✨ Fixed syntax errors in ${fixedCount} files`);
}

if (require.main === module) {
  main();
}

module.exports = { fixSyntaxErrors };
