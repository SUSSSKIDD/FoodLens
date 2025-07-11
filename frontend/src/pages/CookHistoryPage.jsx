// frontend/src/pages/CookHistoryPage.jsx
import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeToggle from '../components/DarkModeToggle';
import HomeButton from '../components/HomeButton';
import LogoutButton from '../components/LogoutButton';

const CookHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState({});
  const [inlineLangModal, setInlineLangModal] = useState({ open: false, recipe: null, step: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/recipe/cooked`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.history);
      } catch (err) {
        console.error(err);
        alert('Failed to load cook history');
      }
    };
    fetchHistory();
  }, []);

  const getLanguageContent = (recipe, lang) => {
    const parts = recipe.content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    return lang === 'hi'
      ? parts[1]?.trim() || '❌ Hindi version not available.'
      : parts[0]?.trim();
  };

  const toggleLanguage = (id) => {
    setLanguage(prev => ({ ...prev, [id]: prev[id] === 'hi' ? 'en' : 'hi' }));
    localStorage.setItem('cookingLang', language[id] === 'hi' ? 'en' : 'hi');
  };

  const extractSections = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const text = lang === 'hi' ? parts[1] : parts[0];
    if (!text) return { ingredients: [], steps: [] };
    const ingMatch = text.match(/\*\*(?:Ingredients|सामग्री):\*\*\s*\n([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|$)/i);
    const ingredients = ingMatch
      ? ingMatch[1].split('\n').filter(l => l.startsWith('*')).map(l => l.replace(/^\*\s*/, '').trim())
      : [];
    const stepMatch = text.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*)/i);
    const steps = stepMatch
      ? stepMatch[1].split('\n').filter(l => /^\d+\./.test(l)).map(l => l.replace(/^\d+\.\s*/, '').trim())
      : [];
    return { ingredients, steps };
  };

  const getLastStep = id => {
    const p = localStorage.getItem(`cookingProgress_${id}`);
    try { return JSON.parse(p).currentStep || 0 } catch { return 0; }
  };

  const handlePromptLanguage = (recipe) => {
    const step = getLastStep(recipe._id);
    const defaultLang = localStorage.getItem('cookingLang') || 'en';
    setInlineLangModal({ open: true, recipe, step, defaultLang });
  };

  const handleSelectLang = (lang) => {
    if (!inlineLangModal.recipe) return;
    const { recipe, step } = inlineLangModal;
    localStorage.setItem('cookingProgress', JSON.stringify({ recipe, currentStep: step, lang }));
    localStorage.setItem('cookingLang', lang);
    navigate('/cook', { state: { recipe, lang } });
    setInlineLangModal({ open: false, recipe: null, step: 0 });
  };

  const handleRecook = async (recipe, lang) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/recipe/cooked/${recipe._id}`,
        { currentStep: 0, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const key = recipe.title.replace(/\s+/g, '_');
      localStorage.setItem(`cookingProgress_${key}`, JSON.stringify({ recipe, currentStep: 0, lang, lastLeftAt: new Date().toISOString(), completed: false }));
      localStorage.setItem('cookingProgress', JSON.stringify({ recipe, currentStep: 0, lang }));
      localStorage.setItem('cookingLang', lang);
      navigate('/cook', { state: { recipe, lang, currentStep: 0 } });
    } catch {
      alert('Failed to start recooking');
    }
  };

  const handleSaveToSavedRecipes = async (recipe) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/recipe/save`, { title: recipe.title, content: recipe.content, completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Recipe saved to your saved recipes!');
    } catch {
      alert('❌ Failed to save recipe. Please login.');
    }
  };

  return (
    <Box>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cook History
          </Typography>
          <Stack direction="row" spacing={1}>
            {/* <DarkModeToggle /> */}
            {/* <HomeButton /> */}
            {/* <LogoutButton /> */}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {history.length === 0 ? (
          <Typography align="center" color="text.secondary">
            You haven't cooked any recipes yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {history.map(r => {
              const lang = language[r._id] || r.language || 'en';
              const { ingredients, steps } = extractSections(r.content, lang);
              const completed = steps.length > 0 && getLastStep(r._id) >= steps.length - 1;
              return (
                <Grid item key={r._id} xs={12} sm={6} md={4}>
                  <Card elevation={3}>
                    <CardHeader
                      title={r.title}
                      subheader={`Last step: ${getLastStep(r._id) + 1}/${steps.length}`}
                      action={
                        <IconButton onClick={() => toggleLanguage(r._id)}>
                          <LanguageIcon />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="subtitle2">Ingredients</Typography>
                      <List dense>
                        {ingredients.map((ing, i) => (
                          <ListItem key={i} disableGutters>
                            <ListItemText primary={ing} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      {!completed ? (
                        <Button
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handlePromptLanguage(r)}
                        >
                          Continue
                        </Button>
                      ) : (
                        <Button
                          startIcon={<RestartAltIcon />}
                          onClick={() => handleRecook(r, lang)}
                        >
                          Recook
                        </Button>
                      )}
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveToSavedRecipes(r)}
                      >
                        Save
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Inline Language Dialog */}
      <Dialog open={inlineLangModal.open} onClose={() => setInlineLangModal({ open: false, recipe: null, step: 0 })}>
        <DialogTitle>Select Language</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
            <Button
              variant={inlineLangModal.defaultLang === 'en' ? 'contained' : 'outlined'}
              onClick={() => handleSelectLang('en')}
            >
              English
            </Button>
            <Button
              variant={inlineLangModal.defaultLang === 'hi' ? 'contained' : 'outlined'}
              onClick={() => handleSelectLang('hi')}
            >
              हिंदी
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInlineLangModal({ open: false, recipe: null, step: 0 })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CookHistoryPage;
