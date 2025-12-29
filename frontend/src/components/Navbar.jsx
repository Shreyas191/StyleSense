import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Upload, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">StyleSense</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/upload" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <Upload size={20} />
                  <span>Upload</span>
                </Link>
                <Link to="/closet" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <LayoutDashboard size={20} />
                  <span>Closet</span>
                </Link>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={20} />
                  <span>{user?.username}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;