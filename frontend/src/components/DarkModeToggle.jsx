// src/components/DarkModeToggle.jsx
import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { DarkModeContext } from '../context/DarkModeContext';

const DarkModeToggle = () => {
  const { isDark, setIsDark } = useContext(DarkModeContext);

  const handleToggle = () => {
    console.log('Current dark mode:', isDark);
    setIsDark(!isDark);
    console.log('New dark mode value:', !isDark);
  };

  return (
    <Button
      variant="outlined"
      startIcon={isDark ? <Brightness7 /> : <Brightness4 />}
      onClick={handleToggle}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        borderColor: 'grey.500',
        color: 'text.primary',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderColor: 'grey.700',
        },
      }}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
};

export default DarkModeToggle;
