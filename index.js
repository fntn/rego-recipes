const fs = require('fs');
const path = require('path');

/**
 * Load a Rego recipe file by recipe number
 * @param {number|string} recipeNumber - The recipe number (e.g., 1, 2, 3)
 * @returns {string} The content of the recipe policy file
 */
function loadRecipe(recipeNumber) {
  const recipePath = path.join(
    __dirname,
    `recipe-${recipeNumber}`,
    'policy.rego'
  );
  return fs.readFileSync(recipePath, 'utf-8');
}

/**
 * Load all recipes as an object
 * @returns {Object} Object with recipe numbers as keys and recipe content as values
 */
function loadAllRecipes() {
  const files = fs.readdirSync(__dirname);
  const recipeNumbers = files
    .filter((f) => f.startsWith('recipe-') && !f.includes('.'))
    .map((f) => parseInt(f.replace('recipe-', '')))
    .sort((a, b) => a - b);

  const recipes = {};

  recipeNumbers.forEach((num) => {
    try {
      recipes[`recipe-${num}`] = loadRecipe(num);
    } catch (err) {
      console.warn(`Could not load recipe-${num}:`, err.message);
    }
  });

  return recipes;
}

module.exports = {
  loadRecipe,
  loadAllRecipes,
};
