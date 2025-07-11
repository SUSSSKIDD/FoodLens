// src/components/CookHistoryButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const CookHistoryButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<HistoryIcon />}
      onClick={() => navigate('/history')}
      sx={{
        textTransform: 'none',          // keep the text readable
        fontWeight: 'medium',
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      Cook History
    </Button>
  );
};

export default CookHistoryButton;
