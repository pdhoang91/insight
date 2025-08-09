#!/usr/bin/env node

/**
 * Migration Script for Design System
 * Automatically replaces common patterns with design system classes
 */

const fs = require('fs');
const path = require('path');

// Define replacement patterns
const patterns = [
  // Page containers
  {
    from: /className="min-h-screen bg-gray-900([^"]*?)"/g,
    to: 'className="page-container$1"',
    description: 'Replace page containers'
  },
  {
    from: /className="min-h-screen bg-slate-900([^"]*?)"/g,
    to: 'className="page-container$1"',
    description: 'Replace slate page containers'
  },
  
  // Content areas
  {
    from: /className="bg-white text-gray-900 min-h-\[80vh\] p-8([^"]*?)"/g,
    to: 'className="content-area$1"',
    description: 'Replace content areas'
  },
  {
    from: /className="max-w-4xl mx-auto p-6([^"]*?)"/g,
    to: 'className="page-content$1"',
    description: 'Replace page content containers'
  },
  
  // Loading states
  {
    from: /className="min-h-screen bg-gray-900 flex items-center justify-center p-4([^"]*?)"/g,
    to: 'className="loading-container$1"',
    description: 'Replace loading containers'
  },
  {
    from: /className="bg-white text-gray-900 font-mono p-8 max-w-md w-full text-center([^"]*?)"/g,
    to: 'className="loading-card$1"',
    description: 'Replace loading cards'
  },
  {
    from: /className="bg-white text-red-600 font-mono p-8([^"]*?)"/g,
    to: 'className="error-card$1"',
    description: 'Replace error cards'
  },
  
  // Headers
  {
    from: /className="mb-8 pb-6 border-b border-gray-200([^"]*?)"/g,
    to: 'className="page-header$1"',
    description: 'Replace page headers'
  },
  {
    from: /className="text-4xl font-bold mb-4 text-gray-900 leading-tight([^"]*?)"/g,
    to: 'className="page-title$1"',
    description: 'Replace page titles'
  },
  
  // Sidebar components
  {
    from: /className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6([^"]*?)"/g,
    to: 'className="sidebar$1"',
    description: 'Replace sidebar cards'
  },
  
  // Tech comments
  {
    from: /className="text-gray-600 font-mono([^"]*?)">\/\/ /g,
    to: 'className="tech-comment$1">',
    description: 'Replace tech comments'
  },
  {
    from: /className="text-gray-400 font-mono([^"]*?)">\/\/ /g,
    to: 'className="tech-comment$1">',
    description: 'Replace tech comments (gray-400)'
  }
];

// File extensions to process
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Directories to process
const directories = ['pages', 'components', 'context'];

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return fileExtensions.includes(ext);
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];

    patterns.forEach(pattern => {
      const matches = content.match(pattern.from);
      if (matches) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
        changes.push({
          pattern: pattern.description,
          count: matches.length
        });
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      changes.forEach(change => {
        console.log(`   - ${change.pattern}: ${change.count} replacements`);
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process directory recursively
 */
function processDirectory(dirPath) {
  let totalFiles = 0;
  let modifiedFiles = 0;

  function walkDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next
        if (item !== 'node_modules' && item !== '.next') {
          walkDirectory(itemPath);
        }
      } else if (shouldProcessFile(itemPath)) {
        totalFiles++;
        if (processFile(itemPath)) {
          modifiedFiles++;
        }
      }
    });
  }

  walkDirectory(dirPath);
  return { totalFiles, modifiedFiles };
}

/**
 * Main migration function
 */
function migrate() {
  console.log('🚀 Starting Design System Migration...\n');

  let totalFiles = 0;
  let totalModified = 0;

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    
    if (fs.existsSync(dirPath)) {
      console.log(`📁 Processing ${dir}/ directory...`);
      const { totalFiles: files, modifiedFiles: modified } = processDirectory(dirPath);
      totalFiles += files;
      totalModified += modified;
      console.log(`   Processed: ${files} files, Modified: ${modified} files\n`);
    } else {
      console.log(`⚠️  Directory ${dir}/ not found, skipping...\n`);
    }
  });

  console.log('📊 Migration Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files modified: ${totalModified}`);
  console.log(`   Success rate: ${totalFiles > 0 ? Math.round((totalModified / totalFiles) * 100) : 0}%`);
  
  if (totalModified > 0) {
    console.log('\n✨ Migration completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review the changes in your git diff');
    console.log('2. Test your application');
    console.log('3. Update any remaining manual patterns');
    console.log('4. Commit the changes');
  } else {
    console.log('\n💡 No files needed migration or all patterns already updated.');
  }
}

/**
 * Dry run function
 */
function dryRun() {
  console.log('🔍 Dry Run - Finding patterns to migrate...\n');
  
  let totalMatches = 0;
  const matchedFiles = [];

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    
    if (fs.existsSync(dirPath)) {
      function walkDirectory(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        items.forEach(item => {
          const itemPath = path.join(currentPath, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            if (item !== 'node_modules' && item !== '.next') {
              walkDirectory(itemPath);
            }
          } else if (shouldProcessFile(itemPath)) {
            try {
              const content = fs.readFileSync(itemPath, 'utf8');
              let fileMatches = 0;
              
              patterns.forEach(pattern => {
                const matches = content.match(pattern.from);
                if (matches) {
                  fileMatches += matches.length;
                }
              });
              
              if (fileMatches > 0) {
                matchedFiles.push({ file: itemPath, matches: fileMatches });
                totalMatches += fileMatches;
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        });
      }
      
      walkDirectory(dirPath);
    }
  });

  if (matchedFiles.length > 0) {
    console.log('📋 Files that will be modified:');
    matchedFiles.forEach(({ file, matches }) => {
      console.log(`   ${file} (${matches} patterns)`);
    });
    console.log(`\n📊 Total: ${totalMatches} patterns in ${matchedFiles.length} files`);
  } else {
    console.log('✅ No patterns found that need migration.');
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case '--dry-run':
    dryRun();
    break;
  case '--migrate':
    migrate();
    break;
  default:
    console.log('🎨 Design System Migration Tool\n');
    console.log('Usage:');
    console.log('  node migrate-design-system.js --dry-run    # Preview changes');
    console.log('  node migrate-design-system.js --migrate    # Apply changes');
    console.log('\n💡 Run --dry-run first to see what will be changed.');
}

module.exports = { migrate, dryRun, patterns }; 