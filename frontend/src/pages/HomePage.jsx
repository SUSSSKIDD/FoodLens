import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from '../components/DarkModeToggle';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack
} from '@mui/material';

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card
        elevation={3}
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 2
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="flex-end">
            <DarkModeToggle />
          </Stack>

          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
          >
            {greeting}{user?.name ? `, ${user.name}` : ''} 👋
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            paragraph
          >
            Welcome to FoodLens, your AI‑powered cooking assistant!
          </Typography>

          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleLogout}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomePage;
