// frontend/src/pages/SavedRecipesPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from '../components/DarkModeToggle';
import LogoutButton from '../components/LogoutButton';
import HomeButton from '../components/HomeButton';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Paper
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import DeleteIcon from '@mui/icons-material/Delete';

const SavedRecipesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [recipes, setRecipes] = useState([]);
  const [language, setLanguage] = useState({});
  const [showLanguageSelect, setShowLanguageSelect] = useState({});
  const [cookingHistory, setCookingHistory] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/recipe/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data.recipes);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch saved recipes');
      }
    };

    const fetchCookingHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/recipe/cooked`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCookingHistory(res.data.history || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecipes();
    fetchCookingHistory();
  }, []);

  const updateRecipe = async (id, title, content) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/recipe/${id}`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('✅ Recipe updated!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update recipe');
    }
  };

  const deleteRecipe = async (id) => {
    const confirm = window.confirm('Delete this recipe?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/recipe/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete recipe');
    }
  };

  const handleChange = (id, field, value) => {
    setRecipes((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
    );
  };

  const toggleLanguage = (id) => {
    setLanguage((prev) => ({
      ...prev,
      [id]: prev[id] === 'hi' ? 'en' : 'hi',
    }));
  };

  const getLanguageContent = (recipe, lang) => {
    const parts = recipe.content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    return lang === 'hi'
      ? parts[1]?.trim() || '❌ Hindi version not available.'
      : parts[0]?.trim();
  };

  const extractTitle = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const text = lang === 'hi' ? parts[1] : parts[0];
    if (!text) return 'Untitled Recipe';
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) =>
          line && !line.toLowerCase().includes('translation')
      );
    for (let line of lines) {
      if (lang === 'hi') {
        const match = line.match(/^\*\*नाम:\*\*\s*(.+)$/);
        if (match) return match[1].trim();
      } else {
        const match = line.match(/^\*\*Name:\*\*\s*(.+)$/);
        if (match) return match[1].trim();
      }
    }
    return 'Untitled Recipe';
  };

  const extractNutrition = (content) => {
    const nutritionBlock = content.match(
      /\*\*Approximate Nutritional Value\*\*([^*]+)/
    );
    if (!nutritionBlock) return [];

    return nutritionBlock[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('*'))
      .map((line) => {
        const [label, value] = line.replace('*', '').split(':').map((s) => s.trim());
        return { label, value };
      })
      .filter((item) => item.label && item.value);
  };

  const handleStartCooking = async (recipe, selectedLang) => {
    try {
      const token = localStorage.getItem('token');
      const existingRecipe = cookingHistory.find(
        (h) => h.title === recipe.title
      );
      if (existingRecipe) {
        const continueCooking = window.confirm(
          'This recipe is already in your cooking history. Would you like to continue cooking from where you left off?'
        );
        if (continueCooking) {
          const recipeKey = recipe.title.replace(/\s+/g, '_');
          const progress = localStorage.getItem(`cookingProgress_${recipeKey}`);
          const lastStep = progress ? JSON.parse(progress).currentStep : 0;
          navigate('/cook', {
            state: {
              recipe: { title: recipe.title, content: recipe.content },
              lang: selectedLang,
              currentStep: lastStep,
            },
          });
          return;
        }
      }

      await axios.post(
        `${API_URL}/api/recipe/cooked`,
        {
          title: recipe.title,
          content: recipe.content,
          language: selectedLang,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const recipeKey = recipe.title.replace(/\s+/g, '_');
      localStorage.setItem(
        `cookingProgress_${recipeKey}`,
        JSON.stringify({
          recipe: { title: recipe.title, content: recipe.content },
          currentStep: 0,
          lang: selectedLang,
          lastLeftAt: new Date().toISOString(),
        })
      );
      localStorage.setItem(
        'cookingProgress',
        JSON.stringify({
          recipe: { title: recipe.title, content: recipe.content },
          currentStep: 0,
          lang: selectedLang,
        })
      );
      localStorage.setItem('cookingLang', selectedLang);

      navigate('/cook', {
        state: {
          recipe: { title: recipe.title, content: recipe.content },
          lang: selectedLang,
        },
      });
    } catch (err) {
      console.error(err);
      alert('Please Login to start cooking');
    }
  };

  const extractSections = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const text = lang === 'hi' ? parts[1] : parts[0];
    if (!text) return { ingredients: [], steps: [] };
    const ingredientsMatch = text.match(
      /\*\*(?:Ingredients|सामग्री):\*\*\s*\n([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|$)/
    );
    const ingredients = ingredientsMatch
      ? ingredientsMatch[1]
          .split('\n')
          .filter((line) => line.trim().startsWith('*'))
          .map((line) => line.replace(/^\*\s*/, '').trim())
      : [];
    const stepsMatch = text.match(
      /\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*)/i
    );
    const steps = stepsMatch
      ? stepsMatch[1]
          .split('\n')
          .filter((line) => line.trim().match(/^\d+\./))
          .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      : [];
    return { ingredients, steps };
  };

  return (
    <Box>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {greeting}, {user?.name}!
          </Typography>
          <Stack direction="row" spacing={1}>
            {/* <DarkModeToggle /> */}
            {/* <HomeButton /> */}
            {/* <LogoutButton /> */}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          <RestaurantMenuIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Saved Recipes
        </Typography>

        {recipes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No saved recipes yet.
            </Typography>
            <Typography color="text.secondary" paragraph>
              Let’s start cooking to save your favorite recipes!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/camera')}
            >
              Start Cooking
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {recipes.map((recipe) => {
              const lang = language[recipe._id] || 'en';
              const { ingredients, steps } = extractSections(
                recipe.content,
                lang
              );
              return (
                <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                  <Card elevation={3}>
                    <CardHeader
                      title={extractTitle(recipe.content, lang)}
                      action={
                        <IconButton
                          onClick={() => toggleLanguage(recipe._id)}
                          size="small"
                        >
                          <LanguageIcon />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      {extractNutrition(recipe.content).length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Nutritional Information
                          </Typography>
                          <Grid container spacing={1}>
                            {extractNutrition(recipe.content).map(
                              (item, idx) => (
                                <Grid item xs={6} key={idx}>
                                  <Typography variant="body2">
                                    <strong>{item.label}:</strong> {item.value}
                                  </Typography>
                                </Grid>
                              )
                            )}
                          </Grid>
                          <Divider sx={{ my: 2 }} />
                        </>
                      )}

                      <Typography variant="subtitle2">Ingredients</Typography>
                      <List dense>
                        {ingredients.length > 0 ? (
                          ingredients.map((ing, idx) => (
                            <ListItem key={idx} disableGutters>
                              <ListItemText primary={ing} />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem disableGutters>
                            <ListItemText primary="No ingredients found." />
                          </ListItem>
                        )}
                      </List>

                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Steps
                      </Typography>
                      <List dense>
                        {steps.length > 0 ? (
                          steps.map((step, idx) => (
                            <ListItem key={idx} disableGutters>
                              <ListItemText primary={`${idx + 1}. ${step}`} />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem disableGutters>
                            <ListItemText primary="No steps found." />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        color="success"
                        onClick={() =>
                          handleStartCooking(recipe, lang)
                        }
                      >
                        Start Cooking
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteRecipe(recipe._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default SavedRecipesPage;