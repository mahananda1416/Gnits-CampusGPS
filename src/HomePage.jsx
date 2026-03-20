import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Calendar, ArrowRight, LogOut, Video } from 'lucide-react';
import { useAuth } from './AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Logged in as: <span className="font-semibold capitalize text-indigo-600">{user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            GNITS Campus Navigation
          </h1>
          <p className="text-xl text-gray-600">
            Your Complete Campus Assistant
          </p>
        </div>

        {/* Cards - 3 column grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Campus Navigation Card */}
          <div 
            onClick={() => navigate('/navigation')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
              <Navigation className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Campus Navigation
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Find the shortest path between any two locations on campus. Get turn-by-turn directions with floor plans.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold text-sm">
              Navigate Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Indoor & Outdoor Routes</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Floor to Floor Navigation</span>
              </div>
            </div>
          </div>

          {/* Classroom Occupancy Card */}
          <div 
            onClick={() => navigate('/occupancy')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <Calendar className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Classroom Occupancy
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Check real-time classroom availability, view schedules, and request room bookings for your events.
            </p>
            <div className="flex items-center text-purple-600 font-semibold text-sm">
              Check Availability
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Real-time Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Weekly Schedules</span>
              </div>
            </div>
          </div>

          {/* Video Monitoring Card */}
          <div
            onClick={() => navigate('/video')}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
              <Video className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Video Monitoring
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Monitor classroom video feed and detect human presence in real-time using motion analysis.
            </p>
            <div className="flex items-center text-green-600 font-semibold text-sm">
              Open Camera
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Video className="w-3 h-3" />
                <span>Live Presence Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-3 h-3" />
                <span>Motion-based Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Developed for GNITS Hyderabad</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;