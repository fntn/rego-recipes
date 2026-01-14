#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Find all recipe-* directories
const entries = fs.readdirSync(rootDir, { withFileTypes: true });
const recipeDirs = entries
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('recipe-'))
  .map((entry) => entry.name)
  .sort((a, b) => {
    const numA = parseInt(a.split('-')[1]);
    const numB = parseInt(b.split('-')[1]);
    return numA - numB;
  });

// Build exports object
const packageExports = {
  '.': './package.json',
  './package.json': './package.json',
};

// Add recipe exports
recipeDirs.forEach((dir) => {
  const policyPath = `./${dir}/policy.rego`;
  if (fs.existsSync(path.join(rootDir, dir, 'policy.rego'))) {
    packageExports[`./${dir}`] = policyPath;
  }
});

// Add huggingface-recipes if it exists
if (fs.existsSync(path.join(rootDir, 'huggingface-recipes', 'README.md'))) {
  packageExports['./huggingface-recipes'] = './huggingface-recipes/README.md';
}

// Update package.json
packageJson.exports = packageExports;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✓ Updated exports for ${recipeDirs.length} recipes`);
