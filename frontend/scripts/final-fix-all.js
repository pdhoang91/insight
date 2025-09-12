#!/usr/bin/env node

/**
 * Final comprehensive fix for all useThemeClasses issues
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

function analyzeAndFixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check what the file uses
    const usesClasses = content.includes('classes.');
    const usesCombineClasses = content.includes('combineClasses(');
    const hasImport = content.includes('useThemeClasses');
    const hasHookCall = content.includes('useThemeClasses()');
    
    // If file doesn't use theme classes, skip
    if (!usesClasses && !usesCombineClasses) {
      return { fixed: false, reason: 'No theme classes used' };
    }
    
    let issues = [];
    
    // Fix 1: Add import if missing
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
        issues.push('Added import');
      }
    }
    
    // Fix 2: Add hook call if missing
    if (!hasHookCall) {
      // Find component function start
      const componentRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/;
      const match = content.match(componentRegex);
      
      if (match) {
        const hookLine = '  const { classes, combineClasses } = useThemeClasses();\n\n';
        const insertIndex = match.index + match[0].length;
        content = content.slice(0, insertIndex) + '\n' + hookLine + content.slice(insertIndex);
        issues.push('Added hook call');
      }
    }
    
    // Fix 3: Replace undefined variables with fallbacks
    if (usesClasses && !hasHookCall) {
      // Replace classes. with fallback
      content = content.replace(/classes\./g, '(classes || {}).');
      issues.push('Added classes fallback');
    }
    
    if (usesCombineClasses && !hasHookCall) {
      // Replace combineClasses( with fallback
      content = content.replace(/combineClasses\(/g, '(combineClasses || ((a, b) => `${a} ${b}`)).call(null, ');
      issues.push('Added combineClasses fallback');
    }
    
    // Fix 4: Remove unused hook declarations
    const unusedHookPattern = /const\s*{\s*classes,?\s*combineClasses?\s*}\s*=\s*useThemeClasses\(\);\s*\n/g;
    if (!usesClasses && !usesCombineClasses && hasHookCall) {
      content = content.replace(unusedHookPattern, '');
      issues.push('Removed unused hook');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return { 
        fixed: true, 
        reason: issues.join(', '),
        usesClasses,
        usesCombineClasses,
        hasImport,
        hasHookCall
      };
    }
    
    return { fixed: false, reason: 'No changes needed' };
  } catch (error) {
    return { fixed: false, reason: `Error: ${error.message}` };
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...processDirectory(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const result = analyzeAndFixFile(filePath);
      if (result.fixed) {
        results.push({
          file: path.relative(FRONTEND_DIR, filePath),
          ...result
        });
      }
    }
  }
  
  return results;
}

function main() {
  console.log('🔧 Running final comprehensive fix...\n');
  
  const componentsDir = path.join(FRONTEND_DIR, 'components');
  const results = processDirectory(componentsDir);
  
  console.log('📊 RESULTS:\n');
  
  if (results.length === 0) {
    console.log('✅ No issues found - all files are properly configured!');
  } else {
    results.forEach(result => {
      console.log(`✅ ${result.file}`);
      console.log(`   Fixed: ${result.reason}`);
      console.log(`   Uses classes: ${result.usesClasses}, Uses combineClasses: ${result.usesCombineClasses}`);
      console.log(`   Has import: ${result.hasImport}, Has hook: ${result.hasHookCall}\n`);
    });
    
    console.log(`📈 Summary: Fixed ${results.length} files`);
  }
  
  console.log('\n🚀 Try building your application now!');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeAndFixFile };
