
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnalysisResult from '../components/AnalysisResult';
import ChatAssistant from '../components/ChatAssistant';
import { outfitAPI } from '../services/api';
import { ArrowLeft, Loader, Volume2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ...

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const response = await outfitAPI.getAnalysis(id);
      setAnalysis(response.data.data);
    } catch (err) {
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      const tags = tagInput.trim() ? [tagInput.trim()] : null;
      const response = await outfitAPI.togglePublic(id, tags);
      if (response.data.success) {
        setAnalysis(prev => ({
          ...prev,
          is_public: response.data.is_public,
          tags: response.data.is_public && tags ? tags : prev.tags // Update tags if setting to public
        }));
        toast.success(response.data.is_public ? 'Posted to Community!' : 'Removed from Community');
      }
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  const speakFeedback = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = analysis?.analysis_result?.compliment || analysis?.analysis_result?.style_description || "Here is your outfit analysis.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.name.includes('Google US English') || voice.name.includes('Samantha'));
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Outfit</h3>
              <img
                src={`${API_URL}/uploads/${analysis.image_filename}`}
                alt="Outfit"
                className="w-full h-auto rounded-lg mb-4"
              />
              <div className="text-sm text-gray-500 mb-4">
                Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
              </div>
              <button
                onClick={speakFeedback}
                className="w-full btn-secondary flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              >
                <Volume2 size={20} className="mr-2" />
                Hear Stylist Feedback
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Globe className="mr-2 text-indigo-600" size={16} />
                  Community Visibility
                </h4>

                {analysis.is_public ? (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Visible to community.</p>
                    {analysis.tags && analysis.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {analysis.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-3">Post to get feedback.</p>
                    <input
                      type="text"
                      placeholder="Tag (e.g. Date Night)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                <button
                  onClick={handleTogglePublic}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${analysis.is_public
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  {analysis.is_public ? 'Make Private' : 'Post with Tag'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <AnalysisResult analysis={analysis} />
          </div>
        </div>
      </div>

      <ChatAssistant analysisId={id} />
    </div>
  );
};

export default AnalysisDetail;
