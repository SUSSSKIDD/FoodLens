import React, { useState } from 'react';
import { predictImage, fetchGeminiRecipe } from './api';

const CameraInput = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [recipe, setRecipe] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

  // Personalization states
  const [diet, setDiet] = useState("vegetarian");
  const [spice, setSpice] = useState("medium");
  const [allergy, setAllergy] = useState("none");
  const [mealType, setMealType] = useState("lunch");
  const [timeLimit, setTimeLimit] = useState("<30");
  const [healthGoal, setHealthGoal] = useState("none");
  const [servings, setServings] = useState("2");
  const [cuisine, setCuisine] = useState("any");
  const [useCommon, setUseCommon] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setDetections([]);
    setError('');
    setRecipe('');

    const response = await predictImage(file);
    if (response?.detections?.length > 0) {
      setDetections(response.detections);
      const veggieList = response.detections.map(d => d.class);
      const recipeResponse = await fetchGeminiRecipe(
        veggieList, language, diet, spice, allergy, mealType, timeLimit, healthGoal, servings, cuisine, useCommon
      );
      setRecipe(recipeResponse);
    } else if (response?.detections?.length === 0) {
      setError("No vegetables detected.");
    } else {
      setError("Prediction failed or server not reachable.");
    }
  };

  const regenerateRecipe = async () => {
    if (detections.length === 0) return;
    const veggieList = detections.map(d => d.class);
    setRecipe('🔄 Generating another recipe...');
    const newRecipe = await fetchGeminiRecipe(
      veggieList, language, diet, spice, allergy, mealType, timeLimit, healthGoal, servings, cuisine, useCommon
    );
    setRecipe(newRecipe);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);

    if (detections.length > 0) {
      const veggieList = detections.map(d => d.class);
      fetchGeminiRecipe(
        veggieList, newLang, diet, spice, allergy, mealType, timeLimit, healthGoal, servings, cuisine, useCommon
      ).then(setRecipe);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={toggleLanguage}>
          🌐 Switch to {language === 'en' ? 'Hindi' : 'English'}
        </button>
      </div>

      <div style={{ textAlign: 'left', padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
        <label><b>🥗 Diet:</b></label>
        <select value={diet} onChange={(e) => setDiet(e.target.value)}>
          <option value="vegetarian">Vegetarian</option>
          <option value="non-vegetarian">Non-Vegetarian</option>
          <option value="jain">Jain</option>
        </select><br /><br />

        <label><b>🌶️ Spice Level:</b></label>
        <select value={spice} onChange={(e) => setSpice(e.target.value)}>
          <option value="mild">Mild</option>
          <option value="medium">Medium</option>
          <option value="spicy">Spicy</option>
        </select><br /><br />

        <label><b>🚫 Allergies:</b></label>
        <input type="text" value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="e.g. garlic, onion, none" /><br /><br />

        <label><b>🍽️ Meal Type:</b></label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select><br /><br />

        <label><b>⏱️ Time Limit:</b></label>
        <select value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}>
          <option value="<15">Less than 15 mins</option>
          <option value="<30">Less than 30 mins</option>
          <option value=">30">More than 30 mins</option>
        </select><br /><br />

        <label><b>❤️ Health Goal:</b></label>
        <input type="text" value={healthGoal} onChange={(e) => setHealthGoal(e.target.value)} placeholder="e.g. weight loss, high protein" /><br /><br />

        <label><b>👥 Servings:</b></label>
        <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} /><br /><br />

        <label><b>🍛 Cuisine Preference:</b></label>
        <input type="text" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Indian, Italian, Chinese" /><br /><br />

        <label>
          <input type="checkbox" checked={useCommon} onChange={(e) => setUseCommon(e.target.checked)} />
          Use only common Indian kitchen ingredients
        </label>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        style={{ margin: '1rem 0' }}
      />

      {imagePreview && (
        <img src={imagePreview} alt="preview" style={{ width: '90%', maxWidth: '320px', borderRadius: '12px' }} />
      )}

      {detections.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {detections.map((det, idx) => (
            <li key={idx} style={{ fontSize: '1.1rem' }}>
              ✅ <strong>{det.class}</strong> — {Math.round(det.confidence * 100)}%
            </li>
          ))}
        </ul>
      )}

      {recipe && (
        <div style={{ marginTop: '2rem', background: '#f8f8f8', padding: '1rem', borderRadius: '10px' }}>
          <h3>🍲 Suggested Recipe ({language === 'en' ? 'English' : 'Hindi'})</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe}</p>
          <button onClick={regenerateRecipe} style={{ marginTop: '1rem' }}>🔄 Generate Another</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CameraInput;
