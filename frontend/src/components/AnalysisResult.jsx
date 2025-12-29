import React from 'react';
import { Star, TrendingUp, DollarSign, Palette, AlertCircle, Cloud } from 'lucide-react';

const AnalysisResult = ({ analysis }) => {
  const { analysis_result } = analysis;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Outfit Rating</h3>
            <p className="text-gray-700">{analysis_result.outfit_rating.reason}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="text-yellow-500 fill-yellow-500" size={32} />
            <span className="text-4xl font-bold text-gray-900">{analysis_result.outfit_rating.score.toFixed(1)}</span>
            <span className="text-2xl text-gray-600">/10</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="mr-2 text-primary-600" size={24} />
          Style Analysis
        </h3>
        <p className="text-gray-700 leading-relaxed">{analysis_result.style_description}</p>
      </div>

      {analysis_result.weather_suitability && (
        <div className={`card ${analysis_result.weather_suitability.is_suitable ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Cloud className={`mr-2 ${analysis_result.weather_suitability.is_suitable ? 'text-blue-600' : 'text-orange-600'}`} size={24} />
            Weather Suitability
          </h3>
          <div className="flex flex-col">
            <div className="flex items-start mb-2">
              <span className={`font-bold mr-2 ${analysis_result.weather_suitability.is_suitable ? 'text-blue-700' : 'text-orange-700'}`}>
                {analysis_result.weather_suitability.is_suitable ? '✓ Suitable' : '⚠ Not Ideal'}
              </span>
              <span className="text-gray-800">{analysis_result.weather_suitability.reason}</span>
            </div>
            {analysis_result.weather_suitability.advice && (
              <p className="text-sm text-gray-600 italic border-t border-black/5 pt-2 mt-1">
                💡 Tip: {analysis_result.weather_suitability.advice}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Detected Clothing Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis_result.detected_outfit_items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{item.category}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Color:</span> {item.color}</p>
              {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {analysis_result.improvement_suggestions.length > 0 && (
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="mr-2 text-blue-600" size={24} />
            Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {analysis_result.improvement_suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 font-bold">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis_result.cheaper_alternatives.length > 0 && (
        <div className="card bg-green-50 border border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="mr-2 text-green-600" size={24} />
            Budget-Friendly Alternatives
          </h3>
          <div className="space-y-3">
            {analysis_result.cheaper_alternatives.map((alt, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{alt.item}</h4>
                    <p className="text-sm text-gray-700 mb-2">{alt.suggestion}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{alt.estimated_price_range}</span>
                  </div>
                  <a
                    href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(alt.suggestion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-4"
                  >
                    Find Online
                    <TrendingUp className="ml-1 w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis_result.color_matching_recommendations.length > 0 && (
        <div className="card bg-purple-50 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Palette className="mr-2 text-purple-600" size={24} />
            Color Matching Tips
          </h3>
          <ul className="space-y-2">
            {analysis_result.color_matching_recommendations.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2 font-bold">•</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;