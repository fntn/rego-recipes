const fs = require('fs');
const path = require('path');

/**
 * Load a Rego policy file by recipe number
 * @param {number|string} recipeNumber - The recipe number (e.g., 1, 2, 3)
 * @returns {string} The content of the policy.rego file
 */
function loadPolicy(recipeNumber) {
  const recipePath = path.join(
    __dirname,
    `recipe-${recipeNumber}`,
    'policy.rego'
  );
  return fs.readFileSync(recipePath, 'utf-8');
}

/**
 * Get all available recipe numbers
 * @returns {number[]} Array of recipe numbers
 */
function getAvailableRecipes() {
  const files = fs.readdirSync(__dirname);
  return files
    .filter((f) => f.startsWith('recipe-') && !f.includes('.'))
    .map((f) => parseInt(f.replace('recipe-', '')))
    .sort((a, b) => a - b);
}

/**
 * Load all policies as an object
 * @returns {Object} Object with recipe numbers as keys and policy content as values
 */
function loadAllPolicies() {
  const recipes = getAvailableRecipes();
  const policies = {};

  recipes.forEach((num) => {
    try {
      policies[`recipe-${num}`] = loadPolicy(num);
    } catch (err) {
      console.warn(`Could not load recipe-${num}:`, err.message);
    }
  });

  return policies;
}

module.exports = {
  loadPolicy,
  getAvailableRecipes,
  loadAllPolicies,
};
