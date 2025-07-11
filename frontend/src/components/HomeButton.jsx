// src/components/HomeButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const HomeButton = ({ lang = 'en' }) => {
  const navigate = useNavigate();
  const label = lang === 'hi' ? 'होम' : 'Home';

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<HomeIcon />}
      onClick={() => navigate('/camera')}
      sx={{
        textTransform: 'none',
        fontWeight: 'medium',
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      {label}
    </Button>
  );
};

export default HomeButton;
