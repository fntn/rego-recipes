#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, 'recipes-manifest.json');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Recursively find all .rego files
function findRegoFiles(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.husky', 'scripts'].includes(entry.name)) {
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

const regoFiles = findRegoFiles(rootDir);

// Build manifest
const recipes = regoFiles.map((file) => {
  const parsedPath = path.parse(file);
  const id = file.replace('.rego', '').replace(/\\/g, '/');
  const exportKey = `./${id}`;

  const parts = file.split(path.sep);
  const folder = parts[0];
  const fileName = parsedPath.name;

  // Read the .rego file contents
  const fullPath = path.join(rootDir, file);
  const code = fs.readFileSync(fullPath, 'utf8');

  return {
    id: id,
    name: fileName.replace(/_/g, ' ').replace(/-/g, ' '),
    path: `./${file.replace(/\\/g, '/')}`,
    export: exportKey,
    category: folder.startsWith('recipe-') ? 'recipe' : folder,
    code: code,
  };
});

const manifest = {
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  totalRecipes: recipes.length,
  recipes: recipes,
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`✓ Generated manifest with ${recipes.length} recipes`);
