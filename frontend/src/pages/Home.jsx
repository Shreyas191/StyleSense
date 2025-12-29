import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Camera, TrendingUp, DollarSign } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI-Powered Outfit Analysis
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Get instant fashion feedback, styling tips, and budget-friendly alternatives
            </p>
            <Link
              to={isAuthenticated ? '/upload' : '/signup'}
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {isAuthenticated ? 'Start Analyzing' : 'Get Started Free'}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Outfit</h3>
            <p className="text-gray-600">Take a photo of your outfit or upload an existing image</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">Our AI analyzes your outfit, detecting items and style</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
            <p className="text-gray-600">Receive a rating, styling tips, and color recommendations</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
            <p className="text-gray-600">Find cheaper alternatives for expensive items</p>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Style?</h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands of users improving their fashion game with AI</p>
            <Link to="/signup" className="btn-primary inline-block">Sign Up Now</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
