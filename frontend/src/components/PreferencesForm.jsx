// src/components/PreferencesForm.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button,
  Divider
} from '@mui/material';

const marksServing = [
  { value: 1, label: '1 pax' },
  { value: 2, label: '2 pax' },
  { value: 3, label: '<5 pax' },
  { value: 4, label: '>5 pax' },
];

const marksSpicy = [
  { value: 1, label: 'Little' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
];

const PreferencesForm = ({ preferences, setPreferences, onSubmit }) => {
  // Exactly the same logic you had before:
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences({ ...preferences, [name]: value });
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}               // your original onSubmit
      sx={{
        display: 'flex',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 800, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🍽 Recipe Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            {/* Serving Size slider */}
            <FormControl fullWidth>
              <Typography gutterBottom fontWeight="medium">
                Serving Size
              </Typography>
              <Slider
                name="servingSize"
                value={preferences.servingSize}
                onChange={(e, v) =>
                  setPreferences({ ...preferences, servingSize: v })
                }
                step={1}
                marks={marksServing}
                min={1}
                max={4}
              />
            </FormControl>

            {/* Cuisine & Meal Type selects */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cuisine Type</InputLabel>
                  <Select
                    name="cuisine"
                    value={preferences.cuisine}
                    label="Cuisine Type"
                    onChange={handleChange}       // unchanged
                  >
                    {['Indian','Chinese','Italian','Mediterranean','Continental','South Indian','Hyderabadi','Punjabi']
                      .map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Meal Type</InputLabel>
                  <Select
                    name="mealType"
                    value={preferences.mealType}
                    label="Meal Type"
                    onChange={handleChange}       // unchanged
                  >
                    {['Breakfast','Lunch','Evening Snacks','Dinner']
                      .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Diet & Allergies */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Diet</InputLabel>
                  <Select
                    name="diet"
                    value={preferences.diet}
                    label="Diet"
                    onChange={handleChange}       // unchanged
                  >
                    {['Veg','Non‑Veg','Jain','Vegan']
                      .map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="allergy"
                  label="Allergy (e.g. peanuts)"
                  value={preferences.allergy}
                  onChange={handleChange}       // unchanged
                />
              </Grid>
            </Grid>

            {/* Lactose & Diabetic */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Lactose Tolerant?</InputLabel>
                  <Select
                    name="lactose"
                    value={preferences.lactose}
                    label="Lactose Tolerant?"
                    onChange={handleChange}     // unchanged
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Diabetic?</InputLabel>
                  <Select
                    name="diabetic"
                    value={preferences.diabetic}
                    label="Diabetic?"
                    onChange={handleChange}     // unchanged
                  >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Cooking Time & Health Goal */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cooking Time</InputLabel>
                  <Select
                    name="cookingTime"
                    value={preferences.cookingTime}
                    label="Cooking Time"
                    onChange={handleChange}   // unchanged
                  >
                    {['<15 mins','<30 mins','Within an hour']
                      .map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="healthGoal"
                  label="Health Goal (e.g. high protein)"
                  value={preferences.healthGoal}
                  onChange={handleChange}   // unchanged
                />
              </Grid>
            </Grid>

            {/* Spicy Level slider */}
            <FormControl fullWidth>
              <Typography gutterBottom fontWeight="medium">
                Spicy Level
              </Typography>
              <Slider
                name="spicyLevel"
                value={preferences.spicyLevel}
                onChange={(e, v) =>
                  setPreferences({ ...preferences, spicyLevel: v })
                }
                step={1}
                marks={marksSpicy}
                min={1}
                max={3}
              />
            </FormControl>

            {/* Submit */}
            <Box textAlign="center" mt={2}>
              <Button
                type="submit"             // unchanged
                variant="contained"
                size="large"
                color="success"
                sx={{ textTransform: 'none', width: 240 }}
              >
                Generate Recipe
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PreferencesForm;
