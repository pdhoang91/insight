#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapping of hardcoded classes to useThemeClasses equivalents
const classReplacements = {
  // Background colors
  'bg-medium-bg-primary': 'classes.bg.primary',
  'bg-medium-bg-secondary': 'classes.bg.secondary', 
  'bg-medium-bg-card': 'classes.bg.primary',
  'bg-medium-accent-green': 'classes.bg.accent',
  'hover:bg-medium-accent-green': 'classes.bg.accentHover',
  'bg-medium-accent-green/20': 'classes.bg.accentLight',
  
  // Text colors
  'text-medium-text-primary': 'classes.text.primary',
  'text-medium-text-secondary': 'classes.text.secondary',
  'text-medium-text-muted': 'classes.text.muted',
  'text-medium-accent-green': 'classes.text.accent',
  'hover:text-medium-accent-green': 'classes.text.accentHover',
  
  // Border colors
  'border-medium-border': 'classes.border.primary',
  'border-medium-accent-green': 'classes.border.accent',
  'border-medium-accent-green/40': 'classes.border.accentLight',
  
  // Common patterns
  'hover:bg-medium-hover': 'hover:bg-medium-hover', // Keep as is for now
  'bg-medium-hover': 'bg-medium-hover', // Keep as is for now
};

// Typography replacements
const typographyReplacements = {
  'text-xl font-bold': 'classes.heading.h3',
  'text-2xl font-bold': 'classes.heading.h2', 
  'text-3xl font-bold': 'classes.heading.h1',
  'text-lg font-semibold': 'classes.heading.h4',
  'text-base': 'classes.text.body',
  'text-sm': 'classes.text.bodySmall',
  'text-xs': 'classes.text.bodyTiny',
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check if file already imports useThemeClasses
    const hasUseThemeClasses = content.includes('useThemeClasses');
    
    if (!hasUseThemeClasses) {
      // Add import if not present
      const importMatch = content.match(/import.*from.*['"].*hooks.*['"];?\n/);
      if (importMatch) {
        const importLine = "import { useThemeClasses } from '../../hooks/useThemeClasses';\n";
        content = content.replace(importMatch[0], importMatch[0] + importLine);
        updated = true;
      } else {
        // Add import at the top after other imports
        const lastImportMatch = content.match(/import.*from.*['"].*['"];?\n(?=\n)/);
        if (lastImportMatch) {
          const importLine = "import { useThemeClasses } from '../../hooks/useThemeClasses';\n";
          content = content.replace(lastImportMatch[0], lastImportMatch[0] + importLine);
          updated = true;
        }
      }
      
      // Add hook usage in component
      const componentMatch = content.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/);
      if (componentMatch) {
        const hookLine = "  const { classes, combineClasses } = useThemeClasses();\n\n";
        content = content.replace(componentMatch[0], componentMatch[0] + '\n' + hookLine);
        updated = true;
      }
    }
    
    // Replace hardcoded classes
    for (const [oldClass, newClass] of Object.entries(classReplacements)) {
      const regex = new RegExp(`"([^"]*\\s)?${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s[^"]*)?"`,'g');
      if (content.match(regex)) {
        content = content.replace(regex, (match) => {
          const cleanMatch = match.slice(1, -1); // Remove quotes
          const parts = cleanMatch.split(/\s+/);
          const index = parts.indexOf(oldClass);
          if (index !== -1) {
            parts[index] = `\${${newClass}}`;
            return `{combineClasses("${parts.join(' ')}")}`;
          }
          return match;
        });
        updated = true;
      }
    }
    
    // Replace typography patterns
    for (const [oldPattern, newClass] of Object.entries(typographyReplacements)) {
      const regex = new RegExp(`"([^"]*\\s)?${oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s[^"]*)?"`,'g');
      if (content.match(regex)) {
        content = content.replace(regex, (match) => {
          const cleanMatch = match.slice(1, -1);
          const replacement = cleanMatch.replace(oldPattern, `\${${newClass}}`);
          return `{combineClasses("${replacement}")}`;
        });
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function findJSFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.js') && !item.includes('.test.') && !item.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function main() {
  const componentsDir = path.join(__dirname, '../components');
  
  if (!fs.existsSync(componentsDir)) {
    console.error('Components directory not found:', componentsDir);
    process.exit(1);
  }
  
  console.log('🔍 Finding JavaScript component files...');
  const jsFiles = findJSFiles(componentsDir);
  
  console.log(`📁 Found ${jsFiles.length} JavaScript files`);
  
  let updatedCount = 0;
  
  for (const file of jsFiles) {
    if (updateFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✨ Updated ${updatedCount} files`);
  console.log(`📊 Total files processed: ${jsFiles.length}`);
  
  if (updatedCount > 0) {
    console.log('\n🎯 Next steps:');
    console.log('1. Review the changes');
    console.log('2. Test the components');
    console.log('3. Run linting to fix any issues');
    console.log('4. Commit the changes');
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, findJSFiles };
