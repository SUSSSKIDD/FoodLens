import React, { useState } from 'react';
import { updateRecipe, deleteRecipe } from '../../api/recipes';

const RecipeCard = ({ recipe, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState(recipe.notes || '');

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    const response = await updateRecipe({
      title: recipe.title,
      text: recipe.text,
      notes: newNote,
    }, token);
    if (response?.msg) {
      setEditing(false);
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    const confirmed = window.confirm(`Delete recipe: ${recipe.title}?`);
    if (!confirmed) return;
    const response = await deleteRecipe(recipe.title, token);
    if (response?.msg) onUpdate();
  };

  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <p><b>Ingredients:</b> {recipe.ingredients.join(', ')}</p>
      <p><b>Instructions:</b> {recipe.text}</p>
      <p><b>Language:</b> {recipe.language}</p>

      {editing ? (
        <div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows="3"
            style={{ width: '100%' }}
          />
          <button onClick={handleUpdate}>💾 Save Note</button>
          <button onClick={() => setEditing(false)}>❌ Cancel</button>
        </div>
      ) : (
        <div>
          <p><b>Note:</b> {recipe.notes || 'No notes yet'}</p>
          <button onClick={() => setEditing(true)}>✏️ Edit Note</button>
          <button onClick={handleDelete}>🗑️ Delete Recipe</button>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
