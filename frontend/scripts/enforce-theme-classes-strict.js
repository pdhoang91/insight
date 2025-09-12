#!/usr/bin/env node

/**
 * Strict Theme Classes Enforcement Script
 * Forces all components to use useThemeClasses hook instead of hardcoded classNames
 * 
 * This script will:
 * 1. Scan all components for hardcoded classNames
 * 2. Automatically add useThemeClasses import if missing
 * 3. Replace hardcoded classes with theme equivalents
 * 4. Generate comprehensive report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENTS_DIR = path.join(__dirname, '../components');
const PAGES_DIR = path.join(__dirname, '../pages');
const REPORT_FILE = path.join(__dirname, '../THEME_ENFORCEMENT_STRICT_REPORT.md');

// Theme class mappings for common patterns
const THEME_MAPPINGS = {
  // Layout & Containers
  'flex': 'classes.layout.flexColumn',
  'flex flex-col': 'classes.layout.flexColumn', 
  'flex flex-row': 'classes.layout.flexRow',
  'grid': 'classes.responsive.gridMobileSingle',
  'grid grid-cols-1': 'classes.responsive.gridMobileSingle',
  'grid grid-cols-2': 'classes.responsive.gridTabletDouble',
  'grid grid-cols-3': 'classes.responsive.gridDesktopTriple',
  'container': 'classes.layout.container',
  'max-w-4xl mx-auto': 'classes.layout.container',
  'max-w-6xl mx-auto': 'classes.layout.containerWide',
  'min-h-screen': 'classes.layout.fullHeight',
  
  // Typography
  'text-xl font-bold': 'classes.heading.h3',
  'text-2xl font-bold': 'classes.heading.h2', 
  'text-3xl font-bold': 'classes.heading.h1',
  'text-lg font-semibold': 'classes.heading.h4',
  'text-base': 'classes.text.body',
  'text-sm': 'classes.text.bodySmall',
  'text-xs': 'classes.text.bodyTiny',
  'font-bold': 'classes.typography.weightBold',
  'font-semibold': 'classes.typography.weightSemibold',
  'font-medium': 'classes.typography.weightMedium',
  
  // Colors
  'text-gray-600': 'classes.text.secondary',
  'text-gray-500': 'classes.text.muted',
  'text-gray-900': 'classes.text.primary',
  'text-white': 'classes.text.white',
  'bg-white': 'classes.bg.primary',
  'bg-gray-50': 'classes.bg.secondary',
  'bg-gray-100': 'classes.bg.card',
  'text-green-600': 'classes.text.accent',
  'bg-green-600': 'classes.bg.accent',
  'hover:bg-green-700': 'classes.bg.accentHover',
  'border-gray-300': 'classes.border.primary',
  'border-green-500': 'classes.border.accent',
  
  // Interactive Elements
  'hover:shadow-lg': 'classes.interactions.cardHover',
  'transition-all duration-200': 'classes.animations.smooth',
  'transition-colors': 'classes.animations.smooth',
  'cursor-pointer': 'classes.interactive.base',
  'focus:outline-none': 'classes.interactive.base',
  'focus:ring-2': 'classes.interactive.base',
  
  // Buttons
  'px-4 py-2 bg-blue-600 text-white rounded': 'classes.button.primary',
  'px-4 py-2 border border-gray-300 rounded': 'classes.button.secondary',
  'px-3 py-1 text-sm': 'classes.button.primarySmall',
  'px-6 py-3 text-lg': 'classes.button.primaryLarge',
  
  // Cards
  'bg-white shadow rounded-lg p-6': 'classes.card.base',
  'border border-gray-200 rounded-lg p-4': 'classes.card.base',
  'shadow-sm hover:shadow-md': 'classes.card.hover',
  
  // Spacing
  'p-4': 'classes.spacing.card',
  'p-6': 'classes.spacing.cardLarge', 
  'p-2': 'classes.spacing.cardSmall',
  'py-8': 'classes.spacing.section',
  'py-12': 'classes.spacing.sectionLarge',
  'gap-4': 'classes.spacing.gap',
  'gap-6': 'classes.spacing.gapLarge',
  'space-y-4': 'classes.spacing.stack',
  'space-y-6': 'classes.spacing.stackLarge',
  
  // Forms
  'w-full border border-gray-300 rounded px-3 py-2': 'classes.input.medium',
  'border-gray-300 rounded': 'classes.input.medium',
  
  // Responsive
  'hidden md:block': 'classes.responsive.desktopOnly',
  'block md:hidden': 'classes.responsive.mobileOnly',
  'w-full lg:w-1/4': 'classes.responsive.sidebarWidth',
  
  // Common utilities
  'rounded': 'classes.effects.rounded',
  'rounded-lg': 'classes.effects.rounded',
  'rounded-full': 'classes.effects.roundedFull',
  'shadow': 'classes.effects.shadow',
  'shadow-lg': 'classes.effects.shadowLarge',
};

// Patterns that should be replaced with dynamic theme classes
const DYNAMIC_PATTERNS = [
  {
    pattern: /className="([^"]*(?:text-|bg-|border-)[^"]*)"/, 
    replacement: (match, classes) => {
      const mapped = THEME_MAPPINGS[classes.trim()];
      if (mapped) return `className={${mapped}}`;
      
      // Try to map individual classes
      const classArray = classes.trim().split(/\s+/);
      const mappedClasses = classArray.map(cls => {
        // Color classes
        if (cls.startsWith('text-gray-')) return 'classes.text.secondary';
        if (cls.startsWith('bg-gray-')) return 'classes.bg.secondary';
        if (cls.startsWith('border-gray-')) return 'classes.border.primary';
        if (cls.includes('green')) return 'classes.text.accent';
        return `"${cls}"`;
      });
      
      if (mappedClasses.length === 1 && !mappedClasses[0].startsWith('"')) {
        return `className={${mappedClasses[0]}}`;
      }
      
      return `className={combineClasses(${mappedClasses.join(', ')})}`;
    }
  },
  {
    pattern: /className=\{`([^`]*(?:text-|bg-|border-)[^`]*)`\}/,
    replacement: (match, classes) => {
      // Handle template literals - more complex logic needed
      return match; // Keep as is for now, manual review needed
    }
  }
];

class ThemeEnforcer {
  constructor() {
    this.results = {
      processed: 0,
      updated: 0,
      errors: 0,
      files: [],
      summary: {
        totalHardcodedClasses: 0,
        replacedClasses: 0,
        addedImports: 0,
        addedHooks: 0
      }
    };
  }

  // Get all component files
  getAllComponentFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          files.push(fullPath);
        }
      });
    };
    
    scanDirectory(COMPONENTS_DIR);
    scanDirectory(PAGES_DIR);
    
    return files;
  }

  // Check if file has useThemeClasses import
  hasThemeClassesImport(content) {
    return content.includes('useThemeClasses') && 
           (content.includes("from '../hooks/useThemeClasses'") || 
            content.includes("from '../../hooks/useThemeClasses'") ||
            content.includes("from '../../../hooks/useThemeClasses'"));
  }

  // Check if file uses useThemeClasses hook
  hasThemeClassesUsage(content) {
    return /const\s+\{[^}]*classes[^}]*\}\s*=\s*useThemeClasses\(\)/.test(content) ||
           /const\s+classes\s*=\s*useThemeClasses\(\)/.test(content);
  }

  // Add useThemeClasses import to file
  addThemeClassesImport(content, filePath) {
    // Determine relative path to hooks
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, '../hooks'));
    const importPath = relativePath.replace(/\\/g, '/') + '/useThemeClasses';
    
    // Find the last import statement
    const importRegex = /import\s+.*?from\s+['"][^'"]*['"];?\s*\n/g;
    const imports = content.match(importRegex) || [];
    
    if (imports.length === 0) {
      // No imports found, add at the top
      return `import { useThemeClasses } from '${importPath}';\n\n${content}`;
    }
    
    // Add after the last import
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;
    
    const newImport = `import { useThemeClasses } from '${importPath}';\n`;
    
    return content.slice(0, insertIndex) + newImport + content.slice(insertIndex);
  }

  // Add useThemeClasses hook usage to component
  addThemeClassesUsage(content) {
    // Find the component function
    const functionMatch = content.match(/(export\s+default\s+function\s+\w+|function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/);
    
    if (!functionMatch) {
      console.warn('Could not find component function to add hook usage');
      return content;
    }
    
    const functionStart = functionMatch.index + functionMatch[0].length;
    
    // Add the hook usage after the function declaration
    const hookUsage = '\n  const { classes, combineClasses } = useThemeClasses();\n';
    
    return content.slice(0, functionStart) + hookUsage + content.slice(functionStart);
  }

  // Replace hardcoded classNames with theme classes
  replaceHardcodedClasses(content) {
    let updatedContent = content;
    let replacementCount = 0;
    
    // Apply all dynamic patterns
    DYNAMIC_PATTERNS.forEach(({ pattern, replacement }) => {
      const matches = updatedContent.match(new RegExp(pattern.source, 'g'));
      if (matches) {
        replacementCount += matches.length;
        updatedContent = updatedContent.replace(new RegExp(pattern.source, 'g'), replacement);
      }
    });
    
    // Direct mappings
    Object.entries(THEME_MAPPINGS).forEach(([hardcoded, themeClass]) => {
      const pattern = new RegExp(`className="\\s*${hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*"`, 'g');
      const matches = updatedContent.match(pattern);
      if (matches) {
        replacementCount += matches.length;
        updatedContent = updatedContent.replace(pattern, `className={${themeClass}}`);
      }
    });
    
    return { content: updatedContent, replacementCount };
  }

  // Process a single file
  processFile(filePath) {
    const fileResult = {
      path: filePath,
      status: 'processed',
      changes: [],
      errors: []
    };

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Skip if file doesn't contain JSX
      if (!content.includes('className')) {
        fileResult.status = 'skipped';
        return fileResult;
      }

      let hasChanges = false;
      
      // Check and add import if missing
      if (!this.hasThemeClassesImport(content)) {
        content = this.addThemeClassesImport(content, filePath);
        fileResult.changes.push('Added useThemeClasses import');
        this.results.summary.addedImports++;
        hasChanges = true;
      }
      
      // Check and add hook usage if missing
      if (!this.hasThemeClassesUsage(content)) {
        content = this.addThemeClassesUsage(content);
        fileResult.changes.push('Added useThemeClasses hook usage');
        this.results.summary.addedHooks++;
        hasChanges = true;
      }
      
      // Replace hardcoded classes
      const { content: updatedContent, replacementCount } = this.replaceHardcodedClasses(content);
      if (replacementCount > 0) {
        content = updatedContent;
        fileResult.changes.push(`Replaced ${replacementCount} hardcoded className(s)`);
        this.results.summary.replacedClasses += replacementCount;
        hasChanges = true;
      }
      
      // Write file if changes were made
      if (hasChanges && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileResult.status = 'updated';
        this.results.updated++;
      }
      
    } catch (error) {
      fileResult.status = 'error';
      fileResult.errors.push(error.message);
      this.results.errors++;
      console.error(`Error processing ${filePath}:`, error.message);
    }

    return fileResult;
  }

  // Generate comprehensive report
  generateReport() {
    const report = `# Strict Theme Classes Enforcement Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Files Processed**: ${this.results.processed}
- **Files Updated**: ${this.results.updated}
- **Files with Errors**: ${this.results.errors}
- **Imports Added**: ${this.results.summary.addedImports}
- **Hooks Added**: ${this.results.summary.addedHooks}
- **Classes Replaced**: ${this.results.summary.replacedClasses}

## Enforcement Status

${this.results.files.map(file => {
  const status = file.status === 'updated' ? '✅' : 
                file.status === 'error' ? '❌' : 
                file.status === 'skipped' ? '⏭️' : '✔️';
  
  return `### ${status} ${path.relative(COMPONENTS_DIR, file.path)}

**Status**: ${file.status.toUpperCase()}

${file.changes.length > 0 ? `**Changes Made**:
${file.changes.map(change => `- ${change}`).join('\n')}` : ''}

${file.errors.length > 0 ? `**Errors**:
${file.errors.map(error => `- ${error}`).join('\n')}` : ''}
`;
}).join('\n')}

## Next Steps

1. **Review Updated Files**: Check all updated files for correctness
2. **Run ESLint**: \`npm run lint\` to catch any remaining issues
3. **Test Components**: Ensure all components still work correctly
4. **Manual Review**: Some complex className patterns may need manual adjustment

## Theme Class Mappings Used

${Object.entries(THEME_MAPPINGS).map(([hardcoded, theme]) => 
  `- \`${hardcoded}\` → \`${theme}\``
).join('\n')}

## ESLint Integration

The custom ESLint rule \`no-hardcoded-classnames\` will now catch any remaining hardcoded classes.
Run \`npm run lint\` to see violations.

---

*This report was generated by the Strict Theme Classes Enforcement Script*
`;

    fs.writeFileSync(REPORT_FILE, report, 'utf8');
    console.log(`\n📊 Report generated: ${REPORT_FILE}`);
  }

  // Run the enforcement
  async run() {
    console.log('🚀 Starting Strict Theme Classes Enforcement...\n');
    
    const files = this.getAllComponentFiles();
    console.log(`📁 Found ${files.length} component files\n`);
    
    // Process each file
    for (const filePath of files) {
      console.log(`Processing: ${path.relative(process.cwd(), filePath)}`);
      const result = this.processFile(filePath);
      this.results.files.push(result);
      this.results.processed++;
      
      if (result.status === 'updated') {
        console.log(`  ✅ Updated (${result.changes.length} changes)`);
      } else if (result.status === 'error') {
        console.log(`  ❌ Error: ${result.errors[0]}`);
      } else if (result.status === 'skipped') {
        console.log(`  ⏭️  Skipped (no className found)`);
      } else {
        console.log(`  ✔️  No changes needed`);
      }
    }
    
    // Generate report
    this.generateReport();
    
    // Summary
    console.log('\n🎉 Enforcement Complete!');
    console.log(`📊 ${this.results.updated}/${this.results.processed} files updated`);
    console.log(`🔧 ${this.results.summary.replacedClasses} classes replaced`);
    console.log(`📦 ${this.results.summary.addedImports} imports added`);
    console.log(`🪝 ${this.results.summary.addedHooks} hooks added`);
    
    if (this.results.errors > 0) {
      console.log(`⚠️  ${this.results.errors} files had errors`);
    }
    
    console.log('\n🔍 Next steps:');
    console.log('1. Review the generated report');
    console.log('2. Run `npm run lint` to check for remaining issues');
    console.log('3. Test your components');
    console.log('4. Commit the changes');
  }
}

// Run if called directly
if (require.main === module) {
  const enforcer = new ThemeEnforcer();
  enforcer.run().catch(console.error);
}

module.exports = ThemeEnforcer;
