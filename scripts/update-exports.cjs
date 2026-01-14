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
const packageExports = {};

// Add recipe exports - find all .rego files in each recipe directory
let totalExports = 0;
recipeDirs.forEach((dir) => {
  const dirPath = path.join(rootDir, dir);
  const files = fs.readdirSync(dirPath);
  const regoFiles = files.filter((file) => file.endsWith('.rego'));

  regoFiles.forEach((file) => {
    const exportKey = `./${dir}/${file.replace('.rego', '')}`;
    const exportPath = `./${dir}/${file}`;
    packageExports[exportKey] = exportPath;
    totalExports++;
  });
});

// Update package.json
packageJson.exports = packageExports;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(
  `✓ Updated ${totalExports} exports from ${recipeDirs.length} recipe directories`
);
