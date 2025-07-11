import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/PreferencesForm';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import { API_URL } from '../config';

const RecipePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const detectedVeggies = location.state?.detectedVeggies || [];
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [preferences, setPreferences] = useState({
    servingSize: 2,
    cuisine: 'Indian',
    mealType: 'Lunch',
    diet: 'Veg',
    allergy: '',
    lactose: 'Yes',
    diabetic: 'No',
    cookingTime: '<30 mins',
    healthGoal: '',
    spicyLevel: 2
  });

  const [recipe, setRecipe] = useState(null);
  const [recipeId, setRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    if (lastRequestTime && now - lastRequestTime < 60000) { // Within last minute
      if (requestCount >= 55) {
        alert('Hang tight! Our CodeChefs are busy preparing your dishes. Please wait for a minute');
        return;
      }
    } else {
      // Reset counter if more than a minute has passed
      setRequestCount(0);
      setLastRequestTime(now);
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/recipe/generate`, {
        ingredients: detectedVeggies.map((d) => d.label),
        preferences
      });
      setRecipe(res.data.recipe);
      setRequestCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to generate recipe');
    }
    setLoading(false);
  };

  const handleSaveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      const title = recipe.split('\n')[0];
      const res = await axios.post(
        `${API_URL}/api/recipe/save`,
        { title, content: recipe },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecipeId(res.data.recipe._id);
      alert('✅ Recipe saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Please Login to save recipe');
    }
  };

  const handleStartCooking = async (language) => {
    try {
      const token = localStorage.getItem('token');
      const title = recipe.split('\n')[0];
      const content = recipe.split('\n').slice(1).join('\n');
      // Save to cook history
      await axios.post(
        `${API_URL}/api/recipe/cooked`,
        { 
          title, 
          content,
          language 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Set up localStorage progress for this recipe
      const recipeKey = title.replace(/\s+/g, '_');
      localStorage.setItem(
        `cookingProgress_${recipeKey}`,
        JSON.stringify({
          recipe: { title, content },
          currentStep: 0,
          lang: language,
          lastLeftAt: new Date().toISOString()
        })
      );
      localStorage.setItem('cookingProgress', JSON.stringify({
        recipe: { title, content },
        currentStep: 0,
        lang: language
      }));
      localStorage.setItem('cookingLang', language);
      // Navigate to cooking page
      navigate('/cook', { 
        state: { 
          recipe: { title, content },
          lang: language
        }
      });
    } catch (err) {
      console.error(err);
      alert('Please Login to start cooking');
    }
  };

  if (detectedVeggies.length === 0) {
    return (
      <div className="p-4 text-red-600 font-semibold">
        ❌ No vegetables detected. Please go back and scan first.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Recipe Page</h2>
        {/* Detected Vegetables Section */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-3">Detected Vegetables:</h3>
          <div className="flex flex-wrap gap-2">
            {detectedVeggies.map((veggie, index) => (
              <div 
                key={index} 
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                {veggie.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mb-4 w-full max-w-2xl">
          <div className="flex-1">
            <PreferencesForm
              preferences={preferences}
              setPreferences={setPreferences}
              onSubmit={handleSubmit}
            />
          </div>
          <button
            onClick={() => navigate('/camera')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 h-[42px] w-[200px] flex items-center justify-center"
          >
            🔄 Go Back to Scan
          </button>
        </div>
        {loading && <p className="mt-4">🔄 Generating recipe...</p>}
        {recipe && (
          <>
            <div className="mt-6 bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">👨‍🍳 Generated Recipe</h2>
              <pre className="whitespace-pre-wrap">{recipe}</pre>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={handleSaveRecipe}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  💾 Save Recipe
                </button>

                <button
                  onClick={() => setShowLanguageSelect(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  🍳 Let's get our meal ready
                </button>
              </div>

              {showLanguageSelect && (
                <div className="mt-4 p-4 bg-white rounded shadow">
                  <h3 className="text-lg font-semibold mb-3">Select Language</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStartCooking('en')}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      English 🇬🇧
                    </button>
                    <button
                      onClick={() => handleStartCooking('hi')}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Hindi 🇮🇳
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RecipePage;
