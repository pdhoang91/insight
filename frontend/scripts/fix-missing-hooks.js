#!/usr/bin/env node

/**
 * Fix components that use classes/combineClasses but don't call useThemeClasses()
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

function fixMissingHook(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses classes or combineClasses but doesn't have useThemeClasses()
    const usesClasses = content.includes('classes.') || content.includes('combineClasses(');
    const hasHook = content.includes('useThemeClasses()');
    const hasImport = content.includes('useThemeClasses');
    
    if (!usesClasses) {
      return false;
    }
    
    let wasFixed = false;
    
    // Add import if missing
    if (!hasImport) {
      const relativePath = path.relative(FRONTEND_DIR, filePath);
      const pathParts = relativePath.split('/');
      const depth = pathParts.length - 1;
      const backSteps = '../'.repeat(depth);
      const importPath = `${backSteps}hooks/useThemeClasses`;
      
      const importRegex = /import.*from.*['"].*['"];?\n/g;
      const imports = content.match(importRegex) || [];
      
      if (imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const importIndex = content.indexOf(lastImport) + lastImport.length;
        
        const newImport = `import { useThemeClasses } from '${importPath}';\n`;
        content = content.slice(0, importIndex) + newImport + content.slice(importIndex);
        wasFixed = true;
      }
    }
    
    // Add hook call if missing
    if (!hasHook) {
      // Find component function start
      const componentRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/;
      const match = content.match(componentRegex);
      
      if (match) {
        const hookLine = '  const { classes, combineClasses } = useThemeClasses();\n\n';
        const insertIndex = match.index + match[0].length;
        content = content.slice(0, insertIndex) + '\n' + hookLine + content.slice(insertIndex);
        wasFixed = true;
      }
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
      if (fixMissingHook(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

function main() {
  console.log('🔧 Fixing missing useThemeClasses hooks...\n');
  
  const componentsDir = path.join(FRONTEND_DIR, 'components');
  const fixedCount = processDirectory(componentsDir);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files fixed: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n✅ All missing hooks have been added!');
  } else {
    console.log('\n💡 No missing hooks found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixMissingHook };
