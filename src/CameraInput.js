import React, { useState } from 'react';
import { predictImage, fetchGeminiRecipe } from './api';

const CameraInput = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [recipe, setRecipe] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

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
      const veggies = response.detections.map(d => d.class);
      const recipeResponse = await fetchGeminiRecipe(veggies, language, diet, spice, allergy, mealType, timeLimit, healthGoal, servings, cuisine, useCommon);
      setRecipe(recipeResponse);
    } else {
      setError(response?.detections ? "No vegetables detected." : "Prediction failed or server not reachable.");
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);

    if (detections.length > 0) {
      const veggies = detections.map(d => d.class);
      fetchGeminiRecipe(veggies, newLang, diet, spice, allergy, mealType, timeLimit, healthGoal, servings, cuisine, useCommon).then(setRecipe);
    }
  };

  const regenerateRecipe = async () => {
    if (detections.length === 0) return;
    const veggies = detections.map(d => d.class);
    setRecipe('Generating another recipe...');
    const newRecipe = await fetchGeminiRecipe(veggies, language, diet, spice, allergy, mealType, timeLimit, healthGoal, servings, cuisine, useCommon);
    setRecipe(newRecipe);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={toggleLanguage}>
          Switch to {language === 'en' ? 'Hindi' : 'English'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label><b>Diet Preference:</b></label>
        <select value={diet} onChange={e => setDiet(e.target.value)}>
          <option value="vegetarian">Vegetarian</option>
          <option value="non-vegetarian">Non-Vegetarian</option>
          <option value="jain">Jain</option>
        </select>

        <br /><br />
        <label><b>Spice Level:</b></label>
        <select value={spice} onChange={e => setSpice(e.target.value)}>
          <option value="mild">Mild</option>
          <option value="medium">Medium</option>
          <option value="spicy">Spicy</option>
        </select>

        <br /><br />
        <label><b>Allergy (optional):</b></label>
        <input
          type="text"
          placeholder="e.g. garlic, onion"
          value={allergy}
          onChange={(e) => setAllergy(e.target.value)}
          style={{ width: '70%', padding: '4px' }}
        />

        <br /><br />
        <label><b>Meal Type:</b></label>
        <select value={mealType} onChange={e => setMealType(e.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>

        <br /><br />
        <label><b>Cooking Time:</b></label>
        <select value={timeLimit} onChange={e => setTimeLimit(e.target.value)}>
          <option value="<15">Under 15 minutes</option>
          <option value="<30">Under 30 minutes</option>
          <option value=">30">More than 30 minutes</option>
        </select>

        <br /><br />
        <label><b>Health Goal:</b></label>
        <select value={healthGoal} onChange={e => setHealthGoal(e.target.value)}>
          <option value="none">None</option>
          <option value="low calorie">Low Calorie</option>
          <option value="high protein">High Protein</option>
          <option value="diabetic friendly">Diabetic Friendly</option>
          <option value="keto">Keto</option>
        </select>

        <br /><br />
        <label><b>Servings:</b></label>
        <input
          type="number"
          min="1"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          style={{ width: '70px', padding: '4px' }}
        />

        <br /><br />
        <label><b>Cuisine Preference:</b></label>
        <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
          <option value="any">Any</option>
          <option value="indian">Indian</option>
          <option value="chinese">Chinese</option>
          <option value="italian">Italian</option>
          <option value="south indian">South Indian</option>
        </select>

        <br /><br />
        <label>
          <input
            type="checkbox"
            checked={useCommon}
            onChange={() => setUseCommon(!useCommon)}
          /> Use only common kitchen ingredients
        </label>
      </div>

      <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} />

      {imagePreview && (
        <img src={imagePreview} alt="Captured" style={{
          width: '90%', maxWidth: '320px', borderRadius: '12px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)', marginTop: '1rem'
        }} />
      )}

      {detections.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {detections.map((det, idx) => (
            <li key={idx} style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>{det.class}</strong> — {Math.round(det.confidence * 100)}%
            </li>
          ))}
        </ul>
      )}

      {recipe && (
        <>
          <div style={{
            marginTop: '1.5rem', backgroundColor: '#f2f2f2', padding: '1rem',
            borderRadius: '10px', textAlign: 'left', maxWidth: '90%',
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            <h3>🍲 Suggested Recipe ({language === 'en' ? 'English' : 'Hindi'})</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{recipe}</p>
          </div>

          <button onClick={regenerateRecipe} style={{
            marginTop: '1rem', padding: '8px 16px',
            backgroundColor: '#007bff', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}>
            🔁 Generate Another Recipe
          </button>
        </>
      )}

      {error && (
        <p style={{ marginTop: '1rem', color: '#999', fontStyle: 'italic' }}>{error}</p>
      )}
    </div>
  );
};

export default CameraInput;