#!/usr/bin/env node

/**
 * Complete script to enforce useThemeClasses across all components
 * This will scan and fix ALL remaining hardcoded className issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, '..');

// Enhanced replacements for all common patterns
const COMPREHENSIVE_REPLACEMENTS = {
  // Image classes
  'w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300': 'w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300',
  
  // Icon classes  
  'w-2.5 h-2.5 text-white': 'w-2.5 h-2.5 text-white',
  'w-5 h-5 rounded-full object-cover': 'combineClasses(classes.avatar, "w-5 h-5")',
  
  // Layout classes
  'text-center mt-12': 'combineClasses("text-center", classes.section)',
  'group cursor-pointer': 'combineClasses(classes.card, "group cursor-pointer")',
  'mb-4 overflow-hidden rounded-lg': 'mb-4 overflow-hidden rounded-lg',
  
  // Spacing
  'space-y-6': 'classes.gap',
  'space-y-4': 'classes.gap', 
  'space-y-3': 'classes.gap',
  'space-y-2': 'classes.gap',
  'mb-8': 'classes.section',
  'mt-12': 'classes.section',
  
  // Text styles
  'text-2xl font-serif font-bold text-medium-text-primary mb-2': 'combineClasses(classes.heading, "text-2xl mb-2")',
  'font-serif font-bold text-medium-text-primary group-hover:text-medium-accent-green transition-colors leading-tight': 'combineClasses(classes.heading, "group-hover:text-medium-accent-green transition-colors leading-tight")',
  'text-medium-text-secondary text-sm leading-relaxed line-clamp-2': 'combineClasses(classes.textSecondary, "text-sm leading-relaxed line-clamp-2")',
  'flex items-center justify-between text-xs text-medium-text-muted': 'combineClasses(classes.textMuted, "flex items-center justify-between text-xs")',
  
  // Backgrounds and borders
  'h-6 bg-medium-divider rounded w-48 animate-pulse': 'combineClasses(classes.skeleton, "h-6 w-48")',
  'w-16 h-0.5 bg-medium-accent-green': 'combineClasses(classes.accent, "w-16 h-0.5")',
  'px-2 py-1 rounded-full': 'combineClasses(classes.tag, "px-2 py-1")',
  
  // Animations and states
  'animate-pulse space-y-4': 'combineClasses(classes.skeleton, "animate-pulse")',
  'h-48 bg-medium-divider rounded-lg': 'combineClasses(classes.skeleton, "h-48 rounded-lg")',
  'w-5 h-5 bg-medium-divider rounded-full': 'combineClasses(classes.skeleton, "w-5 h-5 rounded-full")',
  'h-3 bg-medium-divider rounded w-20': 'combineClasses(classes.skeleton, "h-3 w-20")',
  'h-3 bg-medium-divider rounded w-16': 'combineClasses(classes.skeleton, "h-3 w-16")',
  'h-5 bg-medium-divider rounded': 'combineClasses(classes.skeleton, "h-5")',
  'h-3 bg-medium-divider rounded': 'combineClasses(classes.skeleton, "h-3")',
  'h-3 bg-medium-divider rounded w-3/4': 'combineClasses(classes.skeleton, "h-3 w-3/4")',
  'h-3 bg-medium-divider rounded w-12': 'combineClasses(classes.skeleton, "h-3 w-12")',
};

function addUseThemeClassesImport(content) {
  if (content.includes('useThemeClasses')) {
    return content;
  }
  
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
  if (content.includes('useThemeClasses()')) {
    return content;
  }
  
  const componentRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/;
  const match = content.match(componentRegex);
  
  if (match) {
    const hookLine = '  const { classes, combineClasses } = useThemeClasses();\n\n';
    const insertIndex = match.index + match[0].length;
    return content.slice(0, insertIndex) + '\n' + hookLine + content.slice(insertIndex);
  }
  
  return content;
}

function replaceAllHardcodedClasses(content) {
  let updatedContent = content;
  
  // Replace all hardcoded className values with useThemeClasses
  for (const [hardcoded, replacement] of Object.entries(COMPREHENSIVE_REPLACEMENTS)) {
    const escapedPattern = hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match exact className values
    const exactRegex = new RegExp(`className=["']${escapedPattern}["']`, 'g');
    updatedContent = updatedContent.replace(exactRegex, `className={${replacement}}`);
    
    // Match className values that contain this pattern
    const partialRegex = new RegExp(`className=["']([^"']*\\b${escapedPattern}\\b[^"']*)["']`, 'g');
    updatedContent = updatedContent.replace(partialRegex, (match, classNames) => {
      if (classNames === hardcoded) {
        return `className={${replacement}}`;
      } else {
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
    
    if (!content.includes('className=')) {
      return false;
    }
    
    const originalContent = content;
    
    // Add import
    content = addUseThemeClassesImport(content);
    
    // Add hook usage  
    content = addUseThemeClassesHook(content);
    
    // Replace hardcoded classes
    content = replaceAllHardcodedClasses(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${path.relative(FRONTEND_DIR, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanAllComponents() {
  const componentsDir = path.join(FRONTEND_DIR, 'components');
  let processedCount = 0;
  let totalFiles = 0;
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        totalFiles++;
        if (processFile(filePath)) {
          processedCount++;
        }
      }
    }
  }
  
  processDirectory(componentsDir);
  
  return { processedCount, totalFiles };
}

function runComprehensiveCheck() {
  console.log('\n🔍 Running comprehensive className check...');
  
  try {
    const result = execSync('npx eslint components/ --format json', {
      cwd: FRONTEND_DIR,
      encoding: 'utf8'
    });
    
    const eslintResults = JSON.parse(result);
    const hardcodedErrors = [];
    
    eslintResults.forEach(fileResult => {
      fileResult.messages.forEach(message => {
        if (message.ruleId === 'custom/no-hardcoded-classnames') {
          hardcodedErrors.push({
            file: path.relative(FRONTEND_DIR, fileResult.filePath),
            line: message.line,
            message: message.message
          });
        }
      });
    });
    
    if (hardcodedErrors.length === 0) {
      console.log('✅ No hardcoded className usage detected!');
      return true;
    } else {
      console.log(`⚠️  Found ${hardcodedErrors.length} hardcoded className issues:`);
      hardcodedErrors.forEach(error => {
        console.log(`   ${error.file}:${error.line} - ${error.message}`);
      });
      return false;
    }
  } catch (error) {
    console.log('⚠️  ESLint check failed, but continuing...');
    return false;
  }
}

function main() {
  console.log('🚀 Starting comprehensive useThemeClasses enforcement...\n');
  
  const { processedCount, totalFiles } = scanAllComponents();
  
  console.log(`\n📊 Scan Results:`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files updated: ${processedCount}`);
  
  const allClean = runComprehensiveCheck();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 COMPREHENSIVE THEME ENFORCEMENT COMPLETE!');
  console.log('='.repeat(60));
  
  if (allClean) {
    console.log('\n✅ SUCCESS: All components now use useThemeClasses!');
    console.log('🛡️  No hardcoded className usage detected.');
  } else {
    console.log('\n⚠️  Some issues may require manual attention.');
    console.log('💡 Check the ESLint output above for specific files.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('   • Test your application to ensure everything works');
  console.log('   • Run: npm run check-classnames to verify');
  console.log('   • Commit changes with confidence!');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, scanAllComponents, runComprehensiveCheck };
