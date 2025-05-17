import React, { useEffect, useState } from 'react';
import RecipeCard from './RecipeCard';
import './SavedRecipes.css';
import { fetchSavedRecipes } from '../../api/recipes';

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  const loadRecipes = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to see your recipes.');
      return;
    }
    const response = await fetchSavedRecipes(token);
    if (response?.recipes) {
      setRecipes(response.recipes);
    } else {
      setError('Unable to load recipes.');
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return (
    <div className="saved-recipes-container">
      <h2>📚 Your Saved Recipes</h2>
      {error && <p className="error">{error}</p>}
      {recipes.length === 0 && !error && <p>No recipes saved yet.</p>}
      {recipes.map((recipe, index) => (
        <RecipeCard key={index} recipe={recipe} onUpdate={loadRecipes} />
      ))}
    </div>
  );
};

export default SavedRecipes;
