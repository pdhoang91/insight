#!/usr/bin/env node

/**
 * Simple Hardcoded Classes Checker
 * Scans for remaining hardcoded className usage after enforcement
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../components');
const PAGES_DIR = path.join(__dirname, '../pages');

// Patterns to detect hardcoded classes
const HARDCODED_PATTERNS = [
  /className="[^"]*(?:text-|bg-|border-|p-|m-|flex|grid|w-|h-)[^"]*"/g,
  /className=\{`[^`]*(?:text-|bg-|border-|p-|m-|flex|grid|w-|h-)[^`]*`\}/g,
];

// Allowed patterns (basic utilities)
const ALLOWED_PATTERNS = [
  /^(hidden|block|inline|flex|grid|absolute|relative|fixed|static|sticky|sr-only)$/,
  /^$/,
  /^\s*$/
];

class HardcodedClassChecker {
  constructor() {
    this.violations = [];
    this.totalFiles = 0;
    this.violationFiles = 0;
  }

  getAllFiles() {
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

  isAllowedClass(className) {
    return ALLOWED_PATTERNS.some(pattern => pattern.test(className.trim()));
  }

  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileViolations = [];
    
    HARDCODED_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const fullMatch = match[0];
        
        // Extract className content
        let classContent = '';
        if (fullMatch.includes('className="')) {
          classContent = fullMatch.match(/className="([^"]*)"/)[1];
        } else if (fullMatch.includes('className={`')) {
          classContent = fullMatch.match(/className=\{`([^`]*)`\}/)[1];
        }
        
        // Check if it's an allowed class
        if (!this.isAllowedClass(classContent)) {
          const lines = content.substring(0, match.index).split('\n');
          const lineNumber = lines.length;
          const columnNumber = lines[lines.length - 1].length + 1;
          
          fileViolations.push({
            line: lineNumber,
            column: columnNumber,
            className: classContent,
            fullMatch: fullMatch
          });
        }
      }
    });
    
    if (fileViolations.length > 0) {
      this.violations.push({
        file: filePath,
        violations: fileViolations
      });
      this.violationFiles++;
    }
    
    this.totalFiles++;
  }

  generateReport() {
    console.log('\n🔍 Hardcoded Classes Check Report\n');
    console.log(`📊 Files Scanned: ${this.totalFiles}`);
    console.log(`❌ Files with Violations: ${this.violationFiles}`);
    console.log(`✅ Clean Files: ${this.totalFiles - this.violationFiles}`);
    
    if (this.violations.length === 0) {
      console.log('\n🎉 No hardcoded className violations found!');
      console.log('All components are using useThemeClasses properly.');
      return;
    }
    
    console.log('\n📋 Violations Found:\n');
    
    this.violations.forEach(({ file, violations }) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`📄 ${relativePath}`);
      
      violations.forEach(({ line, column, className, fullMatch }) => {
        console.log(`  ❌ Line ${line}:${column} - "${className}"`);
        console.log(`     ${fullMatch}`);
      });
      console.log('');
    });
    
    console.log('💡 To fix these violations:');
    console.log('1. Replace hardcoded classes with theme classes');
    console.log('2. Use useThemeClasses hook: const { classes } = useThemeClasses()');
    console.log('3. Use classes.* or combineClasses() for styling');
    console.log('4. Re-run: npm run enforce-theme-strict');
  }

  run() {
    console.log('🔍 Scanning for hardcoded className usage...\n');
    
    const files = this.getAllFiles();
    
    files.forEach(file => {
      process.stdout.write(`Checking: ${path.relative(process.cwd(), file)}\r`);
      this.checkFile(file);
    });
    
    console.log('\n'); // Clear the progress line
    this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new HardcodedClassChecker();
  checker.run();
}

module.exports = HardcodedClassChecker;
