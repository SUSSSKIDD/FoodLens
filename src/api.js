import axios from 'axios';

const PREDICTION_API_URL = 'https://foodlens-api-105131501134.us-central1.run.app/predict';
const GEMINI_API_KEY = 'AIzaSyA_BAO-KctLMlNSMKuZtPNguy2x89m5-Ro';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// 🔍 Prediction API
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

// 🧠 Gemini Recipe Generator (Enhanced)
export const fetchGeminiRecipe = async (
  ingredients,
  language = 'en',
  diet = 'vegetarian',
  spice = 'medium',
  allergy = 'none'
) => {
  const allergyNote = allergy.trim().toLowerCase() === 'none'
    ? ''
    : (language === 'en'
      ? `Avoid using the following ingredients due to allergy: ${allergy}.`
      : `एलर्जी के कारण निम्नलिखित सामग्री का उपयोग न करें: ${allergy}।`);

  const prompt = language === 'en'
    ? `Suggest a ${diet} recipe using only these vegetables: ${ingredients.join(', ')}. Do not include any other vegetables or ingredients. Spice level: ${spice}. ${allergyNote} Write the recipe clearly in steps.`
    : `सिर्फ इन सब्ज़ियों का उपयोग करके एक ${diet} रेसिपी सुझाएं: ${ingredients.join(', ')}। कोई अन्य सब्ज़ी या सामग्री शामिल न करें। मसाले का स्तर: ${spice}। ${allergyNote} कृपया विधि को चरणों में स्पष्ट रूप से लिखें।`;

  try {
    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
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
