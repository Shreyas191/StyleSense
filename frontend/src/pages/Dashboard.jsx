import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OutfitCard from '../components/OutfitCard';
import { outfitAPI } from '../services/api';
import { Upload, Loader } from 'lucide-react';

const Dashboard = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await outfitAPI.getUserAnalyses();
      setAnalyses(response.data.data.analyses);
    } catch (err) {
      setError('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await outfitAPI.deleteAnalysis(id);
      setAnalyses(analyses.filter(a => a._id !== id));
    } catch (err) {
      alert('Failed to delete analysis');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Outfit Analyses</h1>
            <p className="text-gray-600">View and manage your fashion insights</p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary flex items-center"
          >
            <Upload className="mr-2" size={20} />
            New Analysis
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {analyses.length === 0 ? (
          <div className="text-center py-16 card">
            <Upload className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No analyses yet</h3>
            <p className="text-gray-600 mb-6">Upload your first outfit to get started</p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload Outfit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map(analysis => (
              <OutfitCard
                key={analysis._id}
                analysis={analysis}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
