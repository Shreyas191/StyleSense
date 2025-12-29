import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Trash2 } from 'lucide-react';

const OutfitCard = ({ analysis, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/result/${analysis._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      onDelete(analysis._id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div onClick={handleClick} className="card cursor-pointer hover:shadow-xl transition-shadow duration-200">
      <div className="relative pb-48 mb-4">
        <img src={`${API_URL}/uploads/${analysis.image_filename}`} alt="Outfit" className="absolute h-full w-full object-cover rounded-lg" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Star className="text-yellow-500 fill-yellow-500" size={20} />
          <span className="text-lg font-bold text-gray-900">{analysis.analysis_result.outfit_rating.score.toFixed(1)}</span>
          <span className="text-gray-600">/10</span>
        </div>
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 transition-colors p-2">
          <Trash2 size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{analysis.analysis_result.style_description}</p>
      <div className="flex items-center text-xs text-gray-500">
        <Calendar size={14} className="mr-1" />
        {formatDate(analysis.created_at)}
      </div>
    </div>
  );
};

export default OutfitCard;
