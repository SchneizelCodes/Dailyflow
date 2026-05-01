import { useState } from "react";
import { AdminUserManagement } from "./AdminUserManagement";
import videoBackground from "../../imports/vecteezy_an-anime-style-city-skyline-at-sunset-with-clouds-drifting_51900393.mp4";
import fallbackImage from "../../imports/anime-style-earth.jpg";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [videoError, setVideoError] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("dailyflow_current_user");
    onLogout();
  };

  return (
    <div className="size-full flex bg-[#0A0B0F]">
      {/* Left Sidebar */}
      <div className="w-16 bg-gradient-to-b from-pink-200/80 to-purple-200/80 backdrop-blur-lg flex flex-col items-center py-4 gap-4 border-r border-pink-300/50">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">
          DF
        </div>
        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors border bg-pink-500 border-pink-600"
          title="User Management"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        <button
          onClick={handleLogout}
          className="w-10 h-10 bg-red-100/60 hover:bg-red-200/80 rounded-lg flex items-center justify-center transition-colors border border-red-300 mt-auto"
          title="Logout"
        >
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Video Background with Fallback */}
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={fallbackImage}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ willChange: 'transform' }}
          >
            <source src={videoBackground} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${fallbackImage})` }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-auto p-8">
          <AdminUserManagement />

          {/* Version Info */}
          <div className="fixed bottom-4 right-4 text-right">
            <p className="text-xs text-gray-400">Admin Mode</p>
            <p className="text-xs text-gray-500">Version: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
