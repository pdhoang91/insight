#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring files from backup...\n');

const backupDir = path.join(__dirname, 'backup-unused-files');

if (!fs.existsSync(backupDir)) {
  console.log('❌ Backup directory not found!');
  console.log('   Make sure you have run the cleanup script first.');
  process.exit(1);
}

// Function to recursively get all files from backup directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const backupFiles = getAllFiles(backupDir);
let restoredCount = 0;

console.log(`Found ${backupFiles.length} files in backup...\n`);

backupFiles.forEach(backupFilePath => {
  // Get relative path from backup directory
  const relativePath = path.relative(backupDir, backupFilePath);
  const restorePath = path.join(__dirname, relativePath);
  const restoreDir = path.dirname(restorePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(restoreDir)) {
    fs.mkdirSync(restoreDir, { recursive: true });
  }
  
  // Copy file back
  fs.copyFileSync(backupFilePath, restorePath);
  console.log(`✅ Restored: ${relativePath}`);
  restoredCount++;
});

console.log(`\n✨ Restore completed!`);
console.log(`📊 ${restoredCount} files restored successfully`);

console.log('\n🔧 Next steps:');
console.log('   1. Run: npm run build (to verify everything works)');
console.log('   2. Run: npm run dev (to test the application)');
console.log('   3. You can now delete the backup folder if everything works');

console.log('\n💡 To delete backup folder:');
console.log('   rm -rf backup-unused-files'); 