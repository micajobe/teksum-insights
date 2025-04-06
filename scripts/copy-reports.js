const fs = require('fs');
const path = require('path');

// Define the source and destination directories
const sourceDir = path.join(process.cwd(), 'public', 'reports');
const destDir = path.join(process.cwd(), '.next', 'standalone', 'public', 'reports');

// Function to copy a directory recursively
function copyDir(src, dest) {
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Main function
function main() {
  console.log('Copying reports directory to build output...');
  console.log('Source:', sourceDir);
  console.log('Destination:', destDir);

  // Check if the source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error('Source directory does not exist:', sourceDir);
    process.exit(1);
  }

  try {
    // Copy the directory
    copyDir(sourceDir, destDir);
    console.log('Reports directory copied successfully!');
  } catch (error) {
    console.error('Error copying reports directory:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 