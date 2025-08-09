#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up unused components and hooks...\n');

// Unused components to delete
const unusedComponents = [
  'components/Shared/HeroSection.js',
  'components/Shared/TabSwitcher.js', 
  'components/Utils/SearchSection.js',
  'components/Shared/Footer.js',
  'components/Shared/SearchBar.js',
  'components/Utils/ToggleButton.js',
  'components/Shared/ProfileRightSidebar.js'
];

// Unused hooks to delete
const unusedHooks = [
  'hooks/useOptimizedSWR.js',
  'hooks/useFormValidation.js',
  'hooks/useInfiniteFollows.js',
  'hooks/useInfiniteScroll.js',
  'hooks/useUserProfile.js',
  'hooks/useImage.js',
  'hooks/useUser.js',
  'hooks/useTabNavigation.js',
  'hooks/useReadingList.js',
  'hooks/useLatestPosts.js',
  'hooks/useFollowingPosts.js',
  'hooks/usePosts.js',
  'hooks/useUserPosts.js'
];

// Combine all files to delete
const filesToDelete = [...unusedComponents, ...unusedHooks];

// Create backup directory
const backupDir = path.join(__dirname, 'backup-unused-files');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('📦 Creating backup of files to be deleted...');

// Backup and delete files
filesToDelete.forEach((filePath) => {
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
    console.log(`✅ Backed up: ${filePath}`);
    
    // Delete original file
    fs.unlinkSync(fullPath);
    console.log(`🗑️  Deleted: ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✨ Cleanup completed!');
console.log(`📦 Backup files saved in: ${backupDir}`);
console.log('\n📋 Summary:');
console.log(`   • ${unusedComponents.length} unused components deleted`);
console.log(`   • ${unusedHooks.length} unused hooks deleted`);
console.log(`   • Total files deleted: ${filesToDelete.length}`);

console.log('\n🔧 Next steps:');
console.log('   1. Run: npm run build (to check for any errors)');
console.log('   2. Run: npm run dev (to test the application)');
console.log('   3. If everything works, you can delete the backup folder');
console.log('   4. If issues occur, restore from backup folder');

console.log('\n💡 To restore a file from backup:');
console.log('   cp backup-unused-files/[file-path] [file-path]'); 