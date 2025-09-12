#!/usr/bin/env node

/**
 * Theme Enforcement Runner
 * Orchestrates the complete theme enforcement process
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FRONTEND_DIR = path.join(__dirname, '..');

console.log('🎯 Starting Complete Theme Enforcement Process\n');

// Step 1: Run the strict enforcement script
console.log('📋 Step 1: Running Strict Theme Classes Enforcement...');
try {
  execSync('node scripts/enforce-theme-classes-strict.js', { 
    cwd: FRONTEND_DIR, 
    stdio: 'inherit' 
  });
  console.log('✅ Enforcement completed\n');
} catch (error) {
  console.error('❌ Enforcement failed:', error.message);
  process.exit(1);
}

// Step 2: Run ESLint to check for remaining issues
console.log('📋 Step 2: Running ESLint to detect remaining violations...');
try {
  execSync('npx eslint . --ext .js,.jsx --format=compact', { 
    cwd: FRONTEND_DIR, 
    stdio: 'inherit' 
  });
  console.log('✅ No ESLint violations found\n');
} catch (error) {
  console.log('⚠️  ESLint found some violations. Check the output above.\n');
}

// Step 3: Generate final report
console.log('📋 Step 3: Generating Final Report...');

const reportPath = path.join(FRONTEND_DIR, 'THEME_ENFORCEMENT_STRICT_REPORT.md');
if (fs.existsSync(reportPath)) {
  console.log(`📊 Report available at: ${reportPath}`);
} else {
  console.log('⚠️  Report not found');
}

// Step 4: Provide next steps
console.log('\n🎉 Theme Enforcement Process Complete!\n');
console.log('📋 Next Steps:');
console.log('1. Review the enforcement report');
console.log('2. Test your application: npm run dev');
console.log('3. Fix any remaining ESLint violations manually');
console.log('4. Run tests if available: npm test');
console.log('5. Commit your changes');

console.log('\n💡 Tips:');
console.log('- Use `classes.` prefix for all theme classes');
console.log('- Use `combineClasses()` for multiple classes');
console.log('- Check useThemeClasses hook documentation');
console.log('- Report any issues with the enforcement process');

console.log('\n🔧 Maintenance Commands:');
console.log('- Re-run enforcement: npm run enforce-theme');
console.log('- Check ESLint: npm run lint');
console.log('- Auto-fix ESLint: npm run lint:fix');
