import axios from 'axios';

const BASE_URL = 'https://foodlens-api-105131501134.us-central1.run.app';

export const fetchSavedRecipes = async (token) => {
  try {
    const res = await axios.get(`${BASE_URL}/my_recipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Fetch recipes error:', err);
    return null;
  }
};

export const updateRecipe = async (data, token) => {
  try {
    const res = await axios.post(`${BASE_URL}/update_recipe`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Update recipe error:', err);
    return null;
  }
};

export const deleteRecipe = async (title, token) => {
  try {
    const res = await axios.delete(`${BASE_URL}/delete_recipe`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { title }
    });
    return res.data;
  } catch (err) {
    console.error('Delete recipe error:', err);
    return null;
  }
};
