// src/components/SavedRecipesButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const SavedRecipesButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<MenuBookIcon />}
      onClick={() => navigate('/saved')}
      sx={{
        textTransform: 'none',
        fontWeight: 'medium',
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      Saved Recipes
    </Button>
  );
};

export default SavedRecipesButton;
