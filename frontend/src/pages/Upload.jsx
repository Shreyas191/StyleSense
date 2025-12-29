import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import { outfitAPI } from '../services/api';
import { Sparkles, Cloud, MapPin, Loader, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const Upload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );

        const { temperature, weathercode } = response.data.current_weather;

        // Simple WMO code mapping
        const getWeatherDescription = (code) => {
          if (code === 0) return "Clear sky";
          if (code <= 3) return "Partly cloudy";
          if (code <= 48) return "Foggy";
          if (code <= 55) return "Drizzle";
          if (code <= 67) return "Rain";
          if (code <= 77) return "Snow";
          if (code <= 82) return "Showers";
          if (code <= 99) return "Thunderstorm";
          return "Unknown";
        };

        const weatherStr = `${temperature}°C, ${getWeatherDescription(weathercode)}`;
        setWeather(weatherStr);
        toast.success(`Weather fetched: ${weatherStr}`);
      } catch (error) {
        console.error("Weather fetch error", error);
        toast.error("Failed to fetch weather data");
      } finally {
        setWeatherLoading(false);
      }
    }, (error) => {
      setWeatherLoading(false);
      if (error.code === 1) toast.error("Location permission denied");
      else toast.error("Error getting location");
    });
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      if (occasion) {
        formData.append('occasion', occasion);
      }
      if (weather) {
        formData.append('weather', weather);
      }

      const response = await outfitAPI.analyzeOutfit(formData);
      navigate(`/result/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Outfit</h1>
          <p className="text-lg text-gray-600">Get AI-powered fashion analysis in seconds</p>
        </div>

        <div className="card">
          <ImageUpload
            onImageSelect={setSelectedImage}
            selectedImage={selectedImage}
            onClear={() => setSelectedImage(null)}
          />

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasion (Optional)</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="input-field"
            >
              <option value="">Select an occasion...</option>
              <option value="Casual">Casual</option>
              <option value="Office/Work">Office/Work</option>
              <option value="Date Night">Date Night</option>
              <option value="Party">Party</option>
              <option value="Wedding">Wedding</option>
              <option value="Gym/Athletic">Gym/Athletic</option>
              <option value="Travel">Travel</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Local Weather Context (Optional)</label>
            {!weather ? (
              <button
                onClick={fetchWeather}
                disabled={weatherLoading}
                className="flex items-center space-x-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-200"
              >
                {weatherLoading ? <Loader className="animate-spin" size={16} /> : <MapPin size={16} />}
                <span>{weatherLoading ? "Fetching Location..." : "📍 Add Local Weather"}</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Cloud size={18} />
                  <span className="font-medium">{weather}</span>
                </div>
                <button onClick={() => setWeather(null)} className="text-blue-400 hover:text-blue-600">
                  <X size={16} />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Include weather data to get practical advice (e.g. "It's raining, bring an umbrella").</p>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {selectedImage && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" size={20} />
                  Analyze Outfit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
