import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import { outfitAPI } from '../services/api';
import { Sparkles } from 'lucide-react';

const Upload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
