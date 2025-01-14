import { existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

function removeNodeModules(dir) {
  if (!existsSync(dir)) return;

  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory() && entry.name === 'node_modules') {
      console.log(`Removing: ${fullPath}`);
      rmSync(fullPath, { recursive: true, force: true });
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
