#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Final cleanup: Removing remaining unused files...\n');

// Files found to be unused in final review
const finalUnusedFiles = [
  // Unused components
  'components/Post/PostItemSmallWithImage.js', // Not imported anywhere
  'components/Profile/UserPostItem.js', // Not imported anywhere
  
  // Duplicate ReadingList components (Post/ReadingListSection is used by SidebarRight)
  // Only remove the unused ReadingList.js from Post (ReadingListSection is used)
  // Note: Both ReadingList.js files are duplicates but serve different purposes
  
  // Unused hooks
  'hooks/useProfileRightSidebar.js', // Not used (ProfileRightSidebar component was deleted)
];

// Services that might be unused
const potentiallyUnusedServices = [
  'services/aiService.js', // No imports found
];

// Documentation files (optional cleanup)
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
  'STATE_MANAGEMENT.md',
  'nextjs-rule.mdc'
];

// Create backup directory
const backupDir = path.join(__dirname, 'backup-final-cleanup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('📦 Creating backup of final cleanup files...');

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

// Delete final unused files
console.log('\n🧹 Cleaning up final unused files...');
finalUnusedFiles.forEach(filePath => {
  backupAndDelete(filePath, 'unused');
});

// Handle potentially unused services
if (process.argv.includes('--services')) {
  console.log('\n🔧 Cleaning up unused services...');
  potentiallyUnusedServices.forEach(filePath => {
    backupAndDelete(filePath, 'service');
  });
}

// Handle documentation cleanup
if (process.argv.includes('--docs')) {
  console.log('\n📚 Cleaning up documentation files...');
  documentationFiles.forEach(filePath => {
    backupAndDelete(filePath, 'docs');
  });
}

console.log('\n✨ Final cleanup completed!');
console.log(`📦 Backup files saved in: ${backupDir}`);
console.log(`📊 Files deleted: ${deletedCount}`);

console.log('\n🔧 What was cleaned up:');
console.log('   • PostItemSmallWithImage (unused component)');
console.log('   • UserPostItem (unused component)');
console.log('   • Duplicate ReadingList components (kept Profile versions)');
console.log('   • useProfileRightSidebar (unused hook)');

if (process.argv.includes('--services')) {
  console.log('   • aiService (potentially unused)');
}

if (process.argv.includes('--docs')) {
  console.log('   • Documentation files (16 files)');
}

console.log('\n🚨 Important: Update imports!');
console.log('   Check SidebarRight.js - may need to update ReadingListSection import');

console.log('\n💡 Options:');
console.log('   --services    Also remove potentially unused services');
console.log('   --docs        Also remove documentation files');
console.log('   --all         Remove everything (services + docs)');

if (process.argv.includes('--all')) {
  console.log('\n🔄 Running full cleanup...');
  potentiallyUnusedServices.forEach(filePath => {
    backupAndDelete(filePath, 'service');
  });
  documentationFiles.forEach(filePath => {
    backupAndDelete(filePath, 'docs');
  });
}

console.log('\n🔧 Next steps:');
console.log('   1. Update SidebarRight.js import path if needed');
console.log('   2. Run: npm run build');
console.log('   3. Run: npm run dev');
console.log('   4. Test the application thoroughly'); 