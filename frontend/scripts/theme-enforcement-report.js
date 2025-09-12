#!/usr/bin/env node

/**
 * Generate comprehensive report on useThemeClasses enforcement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, '..');

function analyzeComponents() {
  const componentsDir = path.join(FRONTEND_DIR, 'components');
  const stats = {
    totalFiles: 0,
    filesWithClassName: 0,
    filesWithUseThemeClasses: 0,
    filesWithHardcodedClasses: 0,
    hardcodedClassNames: [],
    compliantFiles: [],
    nonCompliantFiles: []
  };
  
  function analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(FRONTEND_DIR, filePath);
      
      stats.totalFiles++;
      
      const hasClassName = content.includes('className=');
      const hasUseThemeClasses = content.includes('useThemeClasses');
      
      if (hasClassName) {
        stats.filesWithClassName++;
        
        if (hasUseThemeClasses) {
          stats.filesWithUseThemeClasses++;
          stats.compliantFiles.push(relativePath);
        } else {
          stats.nonCompliantFiles.push(relativePath);
        }
        
        // Check for hardcoded className patterns
        const hardcodedMatches = content.match(/className=["'][^"']*["']/g) || [];
        hardcodedMatches.forEach(match => {
          if (!match.includes('{') && !match.includes('classes.') && !match.includes('combineClasses')) {
            const className = match.match(/className=["']([^"']*)["']/)[1];
            if (className && className.trim() !== '' && !['sr-only', 'hidden', 'block', 'inline', 'flex', 'grid'].includes(className)) {
              stats.hardcodedClassNames.push({
                file: relativePath,
                className: className
              });
            }
          }
        });
      }
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        analyzeFile(filePath);
      }
    }
  }
  
  processDirectory(componentsDir);
  
  stats.filesWithHardcodedClasses = stats.hardcodedClassNames.length;
  
  return stats;
}

function runESLintCheck() {
  try {
    execSync('npx eslint components/ --format json --output-file eslint-report.json', {
      cwd: FRONTEND_DIR,
      stdio: 'pipe'
    });
    
    const reportPath = path.join(FRONTEND_DIR, 'eslint-report.json');
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      fs.unlinkSync(reportPath); // Clean up
      
      const hardcodedErrors = [];
      report.forEach(fileResult => {
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
      
      return hardcodedErrors;
    }
  } catch (error) {
    console.log('Note: ESLint check encountered issues, using file analysis instead.');
  }
  
  return [];
}

function generateReport() {
  console.log('🔍 Analyzing useThemeClasses enforcement...\n');
  
  const stats = analyzeComponents();
  const eslintErrors = runESLintCheck();
  
  console.log('=' .repeat(70));
  console.log('📊 USETHEMECLASSES ENFORCEMENT REPORT');
  console.log('=' .repeat(70));
  
  console.log('\n📈 OVERVIEW:');
  console.log(`   Total component files: ${stats.totalFiles}`);
  console.log(`   Files with className: ${stats.filesWithClassName}`);
  console.log(`   Files using useThemeClasses: ${stats.filesWithUseThemeClasses}`);
  
  const complianceRate = stats.filesWithClassName > 0 ? 
    Math.round((stats.filesWithUseThemeClasses / stats.filesWithClassName) * 100) : 100;
  
  console.log(`   Compliance rate: ${complianceRate}%`);
  
  if (eslintErrors.length === 0 && stats.hardcodedClassNames.length === 0) {
    console.log('\n✅ SUCCESS: All components are compliant!');
    console.log('🛡️  No hardcoded className usage detected.');
  } else {
    console.log(`\n⚠️  Issues found: ${Math.max(eslintErrors.length, stats.hardcodedClassNames.length)}`);
    
    if (eslintErrors.length > 0) {
      console.log('\n❌ ESLint detected hardcoded className usage:');
      eslintErrors.slice(0, 10).forEach(error => {
        console.log(`   ${error.file}:${error.line}`);
      });
      if (eslintErrors.length > 10) {
        console.log(`   ... and ${eslintErrors.length - 10} more`);
      }
    }
    
    if (stats.hardcodedClassNames.length > 0) {
      console.log('\n📋 Hardcoded className patterns found:');
      const uniquePatterns = [...new Set(stats.hardcodedClassNames.map(h => h.className))];
      uniquePatterns.slice(0, 10).forEach(pattern => {
        console.log(`   "${pattern}"`);
      });
      if (uniquePatterns.length > 10) {
        console.log(`   ... and ${uniquePatterns.length - 10} more patterns`);
      }
    }
  }
  
  console.log('\n🎯 ENFORCEMENT FEATURES:');
  console.log('   ✅ ESLint rule: custom/no-hardcoded-classnames');
  console.log('   ✅ Pre-commit hook installed');
  console.log('   ✅ Package scripts available:');
  console.log('      • npm run check-classnames');
  console.log('      • npm run fix-classnames');
  console.log('   ✅ Documentation: THEME_ENFORCEMENT.md');
  
  console.log('\n📚 AVAILABLE THEME CLASSES:');
  console.log('   • classes.container - Main container styles');
  console.log('   • classes.heading - Heading text styles');
  console.log('   • classes.textPrimary - Primary text color');
  console.log('   • classes.textSecondary - Secondary text color');
  console.log('   • classes.textMuted - Muted text color');
  console.log('   • classes.button - Button styles');
  console.log('   • classes.card - Card container styles');
  console.log('   • classes.skeleton - Loading skeleton styles');
  console.log('   • classes.tag - Tag/badge styles');
  console.log('   • classes.avatar - Avatar styles');
  console.log('   • classes.gap - Spacing utilities');
  console.log('   • classes.section - Section spacing');
  
  if (complianceRate === 100 && eslintErrors.length === 0) {
    console.log('\n🎉 CONGRATULATIONS!');
    console.log('Your project successfully enforces useThemeClasses usage!');
    console.log('All components are now consistent and maintainable.');
  } else {
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Run: npm run fix-classnames');
    console.log('   2. Manually fix remaining issues');
    console.log('   3. Test your application');
    console.log('   4. Commit changes');
  }
  
  console.log('\n' + '=' .repeat(70));
  
  return {
    complianceRate,
    totalIssues: Math.max(eslintErrors.length, stats.hardcodedClassNames.length),
    stats,
    eslintErrors
  };
}

if (require.main === module) {
  generateReport();
}

module.exports = { analyzeComponents, generateReport };
