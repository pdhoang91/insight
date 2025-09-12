#!/usr/bin/env node

/**
 * Fix incorrect import paths for useThemeClasses hook
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

function getCorrectImportPath(filePath) {
  const relativePath = path.relative(FRONTEND_DIR, filePath);
  const pathParts = relativePath.split('/');
  
  // Count how many levels deep we are from frontend root
  const depth = pathParts.length - 1; // -1 for the filename itself
  
  // Calculate correct relative path to hooks/useThemeClasses
  const backSteps = '../'.repeat(depth);
  return `${backSteps}hooks/useThemeClasses`;
}

function fixImportPath(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has useThemeClasses import
    if (!content.includes('useThemeClasses')) {
      return false;
    }
    
    const correctPath = getCorrectImportPath(filePath);
    
    // Fix any existing useThemeClasses import
    const importPattern = /import\s*{\s*useThemeClasses\s*}\s*from\s*['"][^'"]*['"];?/g;
    
    let wasFixed = false;
    
    if (importPattern.test(content)) {
      content = content.replace(importPattern, `import { useThemeClasses } from '${correctPath}';`);
      wasFixed = true;
    }
    
    if (wasFixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.relative(FRONTEND_DIR, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (fixImportPath(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

function main() {
  console.log('🔧 Fixing useThemeClasses import paths...\n');
  
  const componentsDir = path.join(FRONTEND_DIR, 'components');
  const fixedCount = processDirectory(componentsDir);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files fixed: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n✅ All import paths have been corrected!');
    console.log('🚀 Try running your application again.');
  } else {
    console.log('\n💡 No incorrect import paths found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixImportPath, getCorrectImportPath };
