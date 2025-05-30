import axios from 'axios';

// 🌐 API Endpoints
const PREDICTION_API_URL = 'https://foodlens-api-105131501134.us-central1.run.app/predict';
const BASE_API_URL = 'https://foodlens-api-105131501134.us-central1.run.app';
const GEMINI_API_KEY = 'AIzaSyA_BAO-KctLMlNSMKuZtPNguy2x89m5-Ro'; // ✅ Replace with env var in prod
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// 🔍 Prediction Endpoint
export const predictImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post(PREDICTION_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.error('Prediction error:', err);
    return null;
  }
};
export const registerUser = async (email, password) => {
  try {
    const res = await axios.post(`${BASE_API_URL}/register`, null, {
      params: { email, password }
    });
    return res.data;
  } catch (err) {
    console.error('Registration error:', err.response?.data || err.message);
    throw err;
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${BASE_API_URL}/login`, null, {
      params: { email, password }
    });
    return res.data;
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    throw err;
  }
};

// 🍲 Gemini Recipe Generator
export const fetchGeminiRecipe = async (
  ingredients = [],
  language = 'en',
  diet = 'vegetarian',
  spice = 'medium',
  allergy = 'none',
  mealType = 'lunch',
  timeLimit = '<30',
  healthGoal = 'none',
  servings = '2',
  cuisine = 'any',
  useCommon = false
) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return language === 'en' ? "No ingredients provided." : "कोई सब्ज़ी प्रदान नहीं की गई।";
  }

  const allergyNote = allergy.trim().toLowerCase() === 'none' ? '' : (
    language === 'en'
      ? `Avoid using the following ingredients due to allergy: ${allergy}. `
      : `एलर्जी के कारण निम्नलिखित सामग्री का उपयोग न करें: ${allergy}। `
  );

  const timeText = language === 'en'
    ? timeLimit === '<15'
      ? 'under 15 minutes'
      : timeLimit === '<30'
        ? 'under 30 minutes'
        : 'more than 30 minutes'
    : timeLimit === '<15'
      ? '15 मिनट से कम'
      : timeLimit === '<30'
        ? '30 मिनट से कम'
        : '30 मिनट से अधिक';

  const healthNote = healthGoal.toLowerCase() === 'none' ? '' : (
    language === 'en'
      ? `Make sure the recipe aligns with this goal: ${healthGoal}. `
      : `यह रेसिपी इस स्वास्थ्य लक्ष्य के अनुकूल होनी चाहिए: ${healthGoal}। `
  );

  const servingsNote = language === 'en'
    ? `Make the recipe for ${servings} serving(s). `
    : `${servings} लोगों के लिए रेसिपी बनाएं। `;

  const cuisineNote = cuisine.toLowerCase() === 'any' ? '' : (
    language === 'en'
      ? `Prefer ${cuisine} cuisine style. `
      : `${cuisine} शैली में रेसिपी बनाएं। `
  );

  const commonNote = useCommon ? (
    language === 'en'
      ? `Only use ingredients commonly available in Indian kitchens. `
      : `सिर्फ भारतीय रसोई में सामान्य रूप से पाई जाने वाली सामग्रियों का उपयोग करें। `
  ) : '';

  const prompt = language === 'en'
    ? `Suggest a ${diet} ${mealType} recipe using only these vegetables: ${ingredients.join(', ')}. Do not include any other vegetables or ingredients. Spice level: ${spice}. ${allergyNote}${healthNote}${servingsNote}${cuisineNote}${commonNote}The recipe must take ${timeText}. Write the recipe clearly in sections - ingredient required, quantity according to${servingsNote} serving, cooking instruction in points and special note(if any at end).`
    : `सिर्फ इन सब्ज़ियों का उपयोग करके एक ${diet} ${mealType} रेसिपी सुझाएं: ${ingredients.join(', ')}। कोई अन्य सब्ज़ी या सामग्री शामिल न करें। मसाले का स्तर: ${spice}। ${allergyNote}${healthNote}${servingsNote}${cuisineNote}${commonNote}रेसिपी बनाने में ${timeText} लगने चाहिएं। कृपया विधि को चरणों में स्पष्ट करें।रेसिपी को निम्नलिखित भागों में स्पष्ट रूप से लिखें - आवश्यक सामग्री, ${servingsNote} सर्विंग के अनुसार मात्रा, चरण-दर-चरण पकाने की विधि, और अंत में कोई विशेष टिप्पणी (यदि हो)।`;

  try {
    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Gemini API Error (${res.status}):`, errorText);
      return `⚠️ Gemini API returned error: ${res.status}`;
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No recipe found.";
    console.log("🌱 Gemini response:", content);
    return content;

  } catch (err) {
    console.error("Gemini fetch error:", err);
    return "⚠️ Error generating recipe.";
  }
};
