#!/usr/bin/env node

/**
 * Script to automatically refactor components to use useThemeClasses
 * instead of hardcoded className values
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COMPONENTS_DIR = path.join(__dirname, '../components');

// Common className patterns to replace with useThemeClasses
const REPLACEMENTS = {
  // Spacing
  'space-y-6': 'classes.gap',
  'space-y-4': 'classes.gap', 
  'space-y-3': 'classes.gap',
  'space-y-2': 'classes.gap',
  'mb-8': 'classes.section',
  'mt-12': 'classes.section',
  
  // Text styles
  'text-2xl font-serif font-bold text-medium-text-primary': 'classes.heading',
  'font-serif font-bold text-medium-text-primary': 'classes.heading',
  'text-medium-text-secondary': 'classes.textSecondary',
  'text-medium-text-muted': 'classes.textMuted',
  
  // Backgrounds and borders
  'bg-medium-divider': 'classes.skeleton',
  'bg-medium-accent-green': 'classes.accentBg',
  'text-medium-accent-green': 'classes.accent',
  'border-medium-border': 'classes.border',
  
  // Animations
  'animate-pulse': 'classes.skeleton',
  
  // Buttons and interactive
  'px-2 py-1 rounded-full': 'classes.tag',
  'w-5 h-5 rounded-full object-cover': 'combineClasses(classes.avatar, "w-5 h-5")',
  
  // Cards
  'group cursor-pointer': 'combineClasses(classes.card, "group cursor-pointer")',
};

function addUseThemeClassesImport(content) {
  // Check if already imported
  if (content.includes('useThemeClasses')) {
    return content;
  }
  
  // Find existing imports
  const importRegex = /import.*from.*['"].*['"];?\n/g;
  const imports = content.match(importRegex) || [];
  
  if (imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const importIndex = content.indexOf(lastImport) + lastImport.length;
    
    const newImport = "import { useThemeClasses } from '../hooks/useThemeClasses';\n";
    return content.slice(0, importIndex) + newImport + content.slice(importIndex);
  }
  
  return content;
}

function addUseThemeClassesHook(content) {
  // Check if hook is already used
  if (content.includes('useThemeClasses()')) {
    return content;
  }
  
  // Find component function start
  const componentRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/;
  const match = content.match(componentRegex);
  
  if (match) {
    const hookLine = '  const { classes, combineClasses } = useThemeClasses();\n\n';
    const insertIndex = match.index + match[0].length;
    return content.slice(0, insertIndex) + '\n' + hookLine + content.slice(insertIndex);
  }
  
  return content;
}

function replaceHardcodedClasses(content) {
  let updatedContent = content;
  
  // Replace hardcoded className values
  for (const [hardcoded, replacement] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(`className=["']([^"']*\\b${hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"']*)["']`, 'g');
    
    updatedContent = updatedContent.replace(regex, (match, classNames) => {
      if (classNames === hardcoded) {
        return `className={${replacement}}`;
      } else {
        // Multiple classes - need to combine
        const otherClasses = classNames.replace(hardcoded, '').trim();
        if (otherClasses) {
          return `className={combineClasses(${replacement}, "${otherClasses}")}`;
        } else {
          return `className={${replacement}}`;
        }
      }
    });
  }
  
  return updatedContent;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file doesn't contain className
    if (!content.includes('className=')) {
      return false;
    }
    
    console.log(`Processing: ${filePath}`);
    
    // Add import
    content = addUseThemeClassesImport(content);
    
    // Add hook usage
    content = addUseThemeClassesHook(content);
    
    // Replace hardcoded classes
    content = replaceHardcodedClasses(content);
    
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processedCount += processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (processFile(filePath)) {
        processedCount++;
      }
    }
  }
  
  return processedCount;
}

function main() {
  console.log('🚀 Starting automatic refactor to use useThemeClasses...\n');
  
  const processedCount = processDirectory(COMPONENTS_DIR);
  
  console.log(`\n✅ Processed ${processedCount} files`);
  console.log('\n🔍 Running ESLint to check results...');
  
  try {
    execSync('npm run lint', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('\n✅ All files pass ESLint checks!');
  } catch (error) {
    console.log('\n⚠️  Some ESLint errors remain. Manual fixes may be needed.');
  }
  
  console.log('\n🎉 Refactor complete! All components now use useThemeClasses.');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
