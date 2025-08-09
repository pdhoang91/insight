#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Deep cleanup: Removing additional unused files...\n');

// Additional unused files found in deep scan
const additionalUnusedFiles = [
  // Duplicate LoadingSpinner (keep the better one in Shared)
  'components/Utils/LoadingSpinner.js',
  
  // Unused ShareMenu (only Utils version is used)
  'components/Shared/ShareMenu.js',
  
  // Unused CSS modules
  'styles/SidebarRight.module.css',
  'styles/LoginModal.module.css',
  
  // Unused animation file (not imported anywhere)
  'animations/animation.js',
  
  // Unused ModalContext (defined but never used)
  'context/ModalContext.js',
  
  // Migration script (one-time use, can be removed after migration)
  'migrate-design-system.js'
];

// Documentation files that might be outdated (optional cleanup)
const documentationFiles = [
  'COMPACT_COMMENTS_INTEGRATION.md',
  'INLINE_COMMENTS_UPDATE.md', 
  'COMMENT_LIMITATION_IMPLEMENTATION.md',
  'WRITE_PAGE_FIX.md',
  'UI_CONSISTENCY_REPORT.md',
  'DESIGN_SYSTEM_MIGRATION_REPORT.md',
  'ENHANCED_POST_REDESIGN.md',
  'UX_UI_TECH_BLOG_REVIEW.md',
  'TRADITIONAL_BLOG_LAYOUT.md',
  'IMAGE_HANDLING_FIX.md',
  'LAYOUT_IMPROVEMENTS.md',
  'MIGRATION_SUMMARY.md',
  'REFACTORING_MIGRATION_GUIDE.md',
  'REDUX_GUIDE.md',
  'STATE_MANAGEMENT.md'
];

// Create backup directory
const backupDir = path.join(__dirname, 'backup-additional-cleanup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('📦 Creating backup of additional files to be deleted...');

let deletedCount = 0;

// Function to backup and delete file
function backupAndDelete(filePath, category) {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    // Create backup
    const backupPath = path.join(backupDir, filePath);
    const backupDirPath = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    // Copy to backup
    fs.copyFileSync(fullPath, backupPath);
    console.log(`✅ Backed up (${category}): ${filePath}`);
    
    // Delete original file
    fs.unlinkSync(fullPath);
    console.log(`🗑️  Deleted: ${filePath}`);
    deletedCount++;
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
}

// Delete additional unused files
console.log('\n🧹 Cleaning up duplicate and unused files...');
additionalUnusedFiles.forEach(filePath => {
  backupAndDelete(filePath, 'code');
});

// Ask user about documentation files
console.log('\n📚 Found documentation files that might be outdated:');
documentationFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   • ${file}`);
  }
});

console.log('\n💡 To clean up documentation files, run:');
console.log('   node cleanup-additional-unused.js --docs');

// Check if user wants to delete docs
if (process.argv.includes('--docs')) {
  console.log('\n🗂️  Cleaning up documentation files...');
  documentationFiles.forEach(filePath => {
    backupAndDelete(filePath, 'docs');
  });
}

console.log('\n✨ Additional cleanup completed!');
console.log(`📦 Backup files saved in: ${backupDir}`);
console.log(`📊 Files deleted: ${deletedCount}`);

console.log('\n🔧 What was cleaned up:');
console.log('   • Duplicate LoadingSpinner (kept Shared version)');
console.log('   • Unused ShareMenu (kept Utils version)'); 
console.log('   • Unused CSS modules');
console.log('   • Unused animation file');
console.log('   • Unused ModalContext');
console.log('   • Migration script (one-time use)');

if (process.argv.includes('--docs')) {
  console.log('   • Outdated documentation files');
}

console.log('\n🚨 Important: Update imports!');
console.log('   SearchResults.js needs to import LoadingSpinner from Shared instead of Utils');

console.log('\n🔧 Next steps:');
console.log('   1. Fix import in SearchResults.js');
console.log('   2. Run: npm run build');
console.log('   3. Run: npm run dev');
console.log('   4. Test the application'); 