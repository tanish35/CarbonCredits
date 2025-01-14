const fs = require('fs');
const path = require('path');

function removeNodeModules(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && entry.name === 'node_modules') {
      console.log(`Removing: ${fullPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removeNodeModules(fullPath); // Recursively search in subdirectories
    }
  }
}

// Start the process from the repository root
const repoRoot = process.cwd();
console.log(`Searching for node_modules in: ${repoRoot}`);
removeNodeModules(repoRoot);
console.log('All node_modules directories have been removed.');
