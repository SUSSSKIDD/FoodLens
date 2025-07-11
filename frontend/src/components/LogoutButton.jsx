// src/components/LogoutButton.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Button
      variant="contained"
      color="error"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
      sx={{
        textTransform: 'none',
        fontWeight: 'medium',
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
