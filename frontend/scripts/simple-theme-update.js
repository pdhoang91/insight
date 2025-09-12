#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple replacements for common hardcoded classes
const simpleReplacements = [
  // Background colors
  ['className="bg-medium-bg-primary"', 'className={classes.bg.primary}'],
  ['className="bg-medium-bg-secondary"', 'className={classes.bg.secondary}'],
  ['className="bg-medium-bg-card"', 'className={classes.bg.primary}'],
  ['className="bg-medium-accent-green"', 'className={classes.bg.accent}'],
  
  // Text colors  
  ['className="text-medium-text-primary"', 'className={classes.text.primary}'],
  ['className="text-medium-text-secondary"', 'className={classes.text.secondary}'],
  ['className="text-medium-text-muted"', 'className={classes.text.muted}'],
  ['className="text-medium-accent-green"', 'className={classes.text.accent}'],
  
  // Border colors
  ['className="border-medium-border"', 'className={classes.border.primary}'],
  ['className="border-medium-accent-green"', 'className={classes.border.accent}'],
  
  // Common patterns with combineClasses
  ['className={`', 'className={combineClasses('],
  ['`}', ')}'],
];

function updateFileSimple(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check if file needs useThemeClasses import
    const needsImport = content.includes('className={classes.') && !content.includes('useThemeClasses');
    
    if (needsImport) {
      // Add import
      const importRegex = /import.*from.*['"].*hooks.*['"];?\n/;
      const importMatch = content.match(importRegex);
      
      if (importMatch) {
        const importLine = "import { useThemeClasses } from '../../hooks/useThemeClasses';\n";
        content = content.replace(importMatch[0], importMatch[0] + importLine);
      } else {
        // Add after last import
        const lastImportRegex = /import.*from.*['"][^'"]*['"];?\n(?=\n|$)/g;
        const matches = [...content.matchAll(lastImportRegex)];
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const importLine = "import { useThemeClasses } from '../../hooks/useThemeClasses';\n";
          content = content.replace(lastMatch[0], lastMatch[0] + importLine);
        }
      }
      
      // Add hook usage
      const componentRegex = /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/;
      const componentMatch = content.match(componentRegex);
      
      if (componentMatch) {
        const hookLine = "  const { classes, combineClasses } = useThemeClasses();\n\n";
        content = content.replace(componentMatch[0], componentMatch[0] + '\n' + hookLine);
      }
      
      updated = true;
    }
    
    // Apply simple replacements
    for (const [oldPattern, newPattern] of simpleReplacements) {
      if (content.includes(oldPattern)) {
        content = content.replaceAll(oldPattern, newPattern);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
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
      } else if (item.endsWith('.js') && !item.includes('test') && !item.includes('spec')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(componentsDir);
  return files;
}

function main() {
  console.log('🔍 Finding component files...');
  const files = findComponentFiles();
  
  console.log(`📁 Found ${files.length} component files`);
  
  let updatedCount = 0;
  
  for (const file of files) {
    if (updateFileSimple(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✨ Updated ${updatedCount} files out of ${files.length}`);
  
  if (updatedCount > 0) {
    console.log('\n🎯 Changes applied:');
    console.log('- Added useThemeClasses imports where needed');
    console.log('- Replaced hardcoded theme classes with theme variables');
    console.log('- Updated className patterns to use combineClasses');
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateFileSimple };
