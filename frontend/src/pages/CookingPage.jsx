import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import HomeButton from '../components/HomeButton';
import CookHistoryButton from '../components/CookHistoryButton';
import { API_URL } from '../config';
import { initAudio, playTick, stopAllSounds } from '../utils/soundUtils';

const CookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lang, setLang] = useState('en');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Track handled suggestions by index
  const [handledSuggestions, setHandledSuggestions] = useState({});
  const [savedRecipes, setSavedRecipes] = useState([]);

  const speechSynthesisRef = useRef(window.speechSynthesis);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('cookingProgress');
    if (savedProgress) {
      const { recipe: savedRecipe, currentStep: savedStep, lang: savedLang } = JSON.parse(savedProgress);
      setRecipe(savedRecipe);
      setCurrentStep(savedStep);
      setLang(savedLang);
    } else {
      const recipeData = location.state?.recipe;
      const language = location.state?.lang || 'en';
      
      if (recipeData) {
        setRecipe(recipeData);
        setLang(language);
      } else {
        navigate('/camera');
      }
    }
  }, [location.state, navigate]);

  // Save progress whenever it changes
  useEffect(() => {
    if (recipe && instructions.length > 0) {
      const recipeKey = recipe.title.replace(/\s+/g, '_');
      const progressData = {
        recipe,
        currentStep,
        lang,
        lastLeftAt: new Date().toISOString()
      };

      // Save general cooking progress
      localStorage.setItem('cookingProgress', JSON.stringify(progressData));

      // If the user has completed the recipe, mark it as completed
      if (currentStep === instructions.length - 1) {
        // Save to localStorage
        localStorage.setItem(`cookingProgress_${recipeKey}`, JSON.stringify({
          ...progressData,
          completed: true
        }));

        // Update backend to mark as completed
        const updateCookedRecipe = async () => {
          try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/recipe/cooked/${recipe._id}`, {
              completed: true,
              currentStep: currentStep
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err) {
            console.error('Failed to update recipe completion status:', err);
          }
        };
        updateCookedRecipe();
      } else {
        // If not completed, just update the progress
        localStorage.setItem(`cookingProgress_${recipeKey}`, JSON.stringify(progressData));
      }
    }
  }, [recipe, currentStep, lang, instructions]);

  // Parse recipe content when recipe changes
  useEffect(() => {
    if (recipe) {
      const content = recipe.content;
      
      // Split content into English and Hindi sections
      const sections = content.split(/\*\*Hindi Translation\*\*/i);
      const englishContent = sections[0];
      const hindiContent = sections[1] || '';
      
      // Extract ingredients and instructions based on language
      const contentToUse = lang === 'hi' ? hindiContent : englishContent;
      
      // Extract ingredients
      const ingredientsMatch = contentToUse.match(/\*\*(?:Ingredients|सामग्री):\*\*\s*\n\*([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|\*\*Approximate|$)/i);
      if (ingredientsMatch) {
        const ingredientsList = ingredientsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.trim().replace(/^\*\s*/, '').trim());
        setIngredients(ingredientsList);
      }

      // Extract instructions
      const instructionsMatch = contentToUse.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*?)(?=\*\*Approximate|$)/i);
      if (instructionsMatch) {
        const instructionsList = instructionsMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.trim().replace(/^\d+\.\s*/, '').trim());
        setInstructions(instructionsList);
      }
    }
  }, [recipe, lang]);

  // Fetch saved recipes on mount
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/recipe/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedRecipes(res.data.recipes || []);
      } catch (err) {
        setSavedRecipes([]);
      }
    };
    fetchSavedRecipes();
  }, []);

  const startTimer = (minutes) => {
    if (timer) {
      clearInterval(timer);
    }
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
    
    // Initialize audio and start ticking
    initAudio();
    
    const newTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          setIsTimerRunning(false);
          stopAllSounds();
          return 0;
        }
        // Play tick sound
        playTick();
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setIsTimerRunning(false);
      stopAllSounds();
    }
  };

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const extractTimeFromStep = (step) => {
    if (!step) return null;
    const timeMatch = step.match(/(\d+)\s*(?:minutes|mins|min|मिनट)/i);
    return timeMatch ? parseInt(timeMatch[1]) : null;
  };

  // Add Continue Later handler
  const handleContinueLater = () => {
    if (!recipe) return;
    // Use a unique key for this recipe (by title+content hash or just title if unique)
    const recipeKey = recipe.title.replace(/\s+/g, '_');
    localStorage.setItem(
      `cookingProgress_${recipeKey}`,
      JSON.stringify({
        recipe,
        currentStep,
        lang,
        lastLeftAt: new Date().toISOString()
      })
    );
    alert('Your progress has been saved! You can continue later from the Cook History page.');
    navigate('/history');
  };

  // Language toggle handler
  const handleToggleLanguage = () => {
    const newLang = lang === 'hi' ? 'en' : 'hi';
    setLang(newLang);
    localStorage.setItem('cookingLang', newLang);
  };

  // Handle sending a chat message (now with Gemini API integration)
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: userMsg }
    ]);
    setChatInput("");
    try {
      // Prepare recipe data for the API
      const recipeData = {
        title: recipe.title,
        content: recipe.content,
        currentStep: currentStep,
        currentInstruction: instructions[currentStep],
        ingredients: ingredients
      };

      const res = await axios.post(`${API_URL}/api/gemini/chat`, {
        recipe: recipeData,
        step: currentStep,
        message: userMsg
      });

      if (!res.data || !res.data.reply) {
        throw new Error('Invalid response from server');
      }

      // Clean Gemini's reply for JSON
      let suggestion = null;
      let explanation = res.data.reply;
      let cleaned = explanation.trim();
      
      // Remove markdown code blocks if present
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();

      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.action && parsed.details) {
          suggestion = parsed;
          explanation = parsed.explanation || "";
        }
      } catch (e) {
        // Not a suggestion, just a normal reply
        console.log('Not a JSON suggestion:', e);
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "gemini", text: explanation, suggestion }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = "Sorry, I couldn't get a response from Gemini. ";
      
      if (err.response) {
        // Server responded with an error
        errorMessage += err.response.data?.message || "Please try again.";
      } else if (err.request) {
        // No response received
        errorMessage += "Please check your internet connection and try again.";
      } else {
        // Other error
        errorMessage += "Please try again.";
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "gemini", text: errorMessage }
      ]);
    }
  };

  // Accept/Reject handlers for Gemini suggestions
  const handleAcceptSuggestion = async (msg, idx) => {
    if (!msg.suggestion || handledSuggestions[idx]) return;
    const { action, details } = msg.suggestion;
    let newIngredients = [...ingredients];
    let newInstructions = [...instructions];

    switch (action) {
      case "add_ingredient":
        newIngredients.push(details.ingredient);
        break;
      case "remove_ingredient":
        newIngredients = newIngredients.filter(i => i.toLowerCase() !== details.ingredient.toLowerCase());
        break;
      case "substitute_ingredient":
        newIngredients = newIngredients.map(i =>
          i.toLowerCase().includes(details.from.toLowerCase())
            ? i.replace(new RegExp(details.from, 'gi'), details.to)
            : i
        );
        // Also update all steps (instructions)
        newInstructions = newInstructions.map(step =>
          step.replace(new RegExp(details.from, 'gi'), details.to)
        );
        break;
      case "add_step":
        newInstructions.splice(details.position ?? newInstructions.length, 0, details.step);
        break;
      case "remove_step":
        newInstructions = newInstructions.filter((_, idx) => idx !== (details.step_number - 1));
        break;
      case "skip_step":
        setCurrentStep((prev) => Math.min(prev + 1, newInstructions.length - 1));
        break;
      case "edit_step":
        newInstructions[details.step_number - 1] = details.new_text;
        break;
      default:
        break;
    }

    setIngredients(newIngredients);
    setInstructions(newInstructions);
    setRecipe({ ...recipe, ingredients: newIngredients, instructions: newInstructions });
    localStorage.setItem('cookingProgress', JSON.stringify({
      recipe: { ...recipe, ingredients: newIngredients, instructions: newInstructions },
      currentStep,
      lang
    }));
    setHandledSuggestions(prev => ({ ...prev, [idx]: true }));

    // --- PATCH to backend if recipe has _id (is a saved recipe) ---
    if (recipe && recipe._id) {
      // Reconstruct the recipe content in the same format
      let content = recipe.content;
      // Replace the ingredients section
      content = content.replace(
        /(\*\*(?:Ingredients|सामग्री):\*\*\s*\n)([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|$)/i,
        `$1${newIngredients.map(i => `* ${i}`).join('\n')}\n`
      );
      // Replace the instructions section
      content = content.replace(
        /(\*\*(?:Instructions|निर्देश):\*\*\s*\n)([\s\S]*?)(?=\*\*Approximate|$)/i,
        `$1${newInstructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`
      );
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `${API_URL}/api/recipe/${recipe._id}`,
          { title: recipe.title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('✅ Saved recipe updated!');
      } catch (err) {
        alert('❌ Failed to update saved recipe');
      }
    }
  };

  const handleRejectSuggestion = (msg, idx) => {
    setHandledSuggestions(prev => ({ ...prev, [idx]: true }));
  };

  // Add extractTitle helper
  const extractTitle = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const text = lang === 'hi' ? parts[1] : parts[0];
    if (!text) return 'Untitled Recipe';
    const lines = text.split('\n').map(line => line.trim()).filter(line =>
      line && !line.toLowerCase().includes('translation')
    );
    for (let line of lines) {
      if (lang === 'hi') {
        const match = line.match(/^\*\*नाम:\*\*\s*(.+)$/);
        if (match) return match[1].trim();
      } else {
        const match = line.match(/^\*\*Name:\*\*\s*(.+)$/);
        if (match) return match[1].trim();
      }
    }
    return 'Untitled Recipe';
  };

  const speakStep = (text) => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find a clear, light voice for English
    if (lang === 'en') {
      // Try to find a female voice first (usually clearer and lighter)
      const femaleVoice = voices.find(voice => 
        voice.lang === 'en-US' && 
        (voice.name.includes('Samantha') || 
         voice.name.includes('Karen') || 
         voice.name.includes('Tessa'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        // Adjust rate and pitch for clearer speech
        utterance.rate = 0.8; // Slower rate for better clarity
        utterance.pitch = 1.1; // Slightly higher pitch
      }
    } else {
      // For Hindi, also use a slower rate
      utterance.rate = 0.8;
    }
    
    speechSynthesisRef.current.speak(utterance);
  };

  // Save Recipe handler (reuse logic from CookHistoryPage)
  const handleSaveRecipe = async () => {
    // Check if already saved
    const alreadySaved = savedRecipes.some(r => r.title === recipe.title);
    if (alreadySaved) {
      alert('Recipe already saved!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/recipe/save`,
        {
          title: recipe.title,
          content: recipe.content,
          completed: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Recipe saved to your saved recipes!');
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Failed to save recipe. Please login.');
    }
  };

  if (!recipe || !instructions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <p className="text-lg">Loading recipe...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your cooking instructions.</p>
        </div>
      </div>
    );
  }

  const currentStepText = instructions[currentStep] || '';
  const timeInMinutes = extractTimeFromStep(currentStepText);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-4 w-full max-w-md">
          <div className="flex items-center gap-2 ml-auto">
            <DarkModeToggle />
            <SavedRecipesButton />
            <HomeButton />
            <LogoutButton />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleToggleLanguage}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            >
              {lang === 'hi' ? 'Switch to English 🇬🇧' : 'Switch to Hindi 🇮🇳'}
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {lang === 'hi' ? 'चलिए पकाते हैं:' : 'Let\'s Cook:'} {recipe && (extractTitle(recipe.content, lang) !== 'Untitled Recipe' ? extractTitle(recipe.content, lang) : recipe.title)}
          </h2>
          
          {/* Ingredients Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {lang === 'hi' ? 'सामग्री:' : 'Raw Materials Required:'}
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>

          {/* Current Step Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              {lang === 'hi' ? 'निर्देश:' : 'Cooking Step'} {currentStep + 1}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-700 mb-0">{currentStepText}</p>
              <button
                onClick={() => speakStep(currentStepText)}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                title="Read Step Aloud"
                aria-label="Read Step Aloud"
              >
                🔊
              </button>
            </div>
          </div>

          {isTimerRunning && (
            <div className="mb-4">
              <p className="text-xl font-bold text-center">{formatTime(timeLeft)}</p>
              <button
                onClick={stopTimer}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                {lang === 'hi' ? 'टाइमर बंद करें' : 'Stop Timer'}
              </button>
            </div>
          )}

          <div className="flex justify-between gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              {lang === 'hi' ? 'पिछला चरण' : 'Previous Step'}
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === instructions.length - 1}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {lang === 'hi' ? 'अगला चरण' : 'Next Step'}
            </button>
          </div>

          {timeInMinutes && !isTimerRunning && (
            <div className="mt-4">
              <button
                onClick={() => startTimer(timeInMinutes)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {lang === 'hi' ? `टाइमर शुरू करें` : `Start ${timeInMinutes} Min Timer`}
              </button>
            </div>
          )}

          {/* Continue Later or Meal Ready */}
          {currentStep === instructions.length - 1 ? (
            <div className="mt-4 text-center text-2xl font-bold text-green-600">
              {lang === 'hi' ? 'आपका भोजन तैयार है!' : 'Your meal is ready!'}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleContinueLater}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                ⏸️ Continue Later
              </button>
            </div>
          )}

          {/* After the last step, show only Save Recipe button */}
          {currentStep === instructions.length - 1 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSaveRecipe}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                💾 Save Recipe
              </button>
            </div>
          )}
        </div>
        {/* Chatbot Floating Button */}
        <button
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700"
          onClick={() => setIsChatOpen((open) => !open)}
          title="Ask Gemini Assistant"
        >
          💬
        </button>
        {/* Chat Window */}
        {isChatOpen && (
          <div className="fixed bottom-24 right-8 z-50 w-80 max-w-full bg-white rounded-lg shadow-lg flex flex-col border border-gray-200">
            <div className="p-3 border-b font-bold bg-blue-100 rounded-t-lg">Gemini Cooking Assistant</div>
            <div className="flex-1 p-3 overflow-y-auto max-h-72 space-y-2">
              {chatHistory.length === 0 && (
                <div className="text-gray-400 text-sm">Ask for help, substitutions, or tips at any step!</div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
                  <span className={msg.sender === 'user' ? 'inline-block bg-blue-500 text-white px-3 py-1 rounded-lg mb-1' : 'inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-lg mb-1'}>
                    {msg.text}
                  </span>
                  {msg.suggestion && !handledSuggestions[idx] && (
                    <div className="flex gap-2 mt-1 justify-end">
                      <button
                        onClick={() => handleAcceptSuggestion(msg, idx)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(msg, idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex border-t p-2 gap-2 bg-gray-50 rounded-b-lg">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                placeholder="Ask Gemini..."
              />
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                onClick={handleSendChat}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CookingPage;
