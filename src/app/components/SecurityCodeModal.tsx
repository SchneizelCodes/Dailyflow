import { useState } from "react";
import videoBackground from "../../imports/vecteezy_an-anime-style-city-skyline-at-sunset-with-clouds-drifting_51900393.mp4";
import fallbackImage from "../../imports/anime-style-earth.jpg";

interface SecurityCodeModalProps {
  onVerify: () => void;
  onCancel: () => void;
}

export function SecurityCodeModal({ onVerify, onCancel }: SecurityCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [videoError, setVideoError] = useState(false);
  const CORRECT_CODE = "101525";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (code === CORRECT_CODE) {
      onVerify();
    } else {
      setError("Invalid security code. Please try again.");
      setCode("");
    }
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden">
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

      <div className="relative z-10 w-full flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-pink-200/95 to-purple-200/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-pink-300/50">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Security Verification</h2>
          <p className="text-gray-600 text-sm">Enter the security code to access admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Enter 6-digit security code"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={6}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white/60 hover:bg-white/80 text-gray-700 font-semibold rounded-lg transition-colors duration-300 border border-pink-300"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            This is an additional security layer for admin access
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
