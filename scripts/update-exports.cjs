#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Recursively find all .rego files
function findRegoFiles(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .git, and other common directories to ignore
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.husky'].includes(entry.name)) {
        continue;
      }
      results.push(...findRegoFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.rego')) {
      const relativePath = path.relative(baseDir, fullPath);
      results.push(relativePath);
    }
  }

  return results;
}

// Build exports object - only export the manifest
const packageExports = {
  './manifest': './manifest.json',
};

// Update package.json
packageJson.exports = packageExports;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✓ Updated exports (manifest only)`);
