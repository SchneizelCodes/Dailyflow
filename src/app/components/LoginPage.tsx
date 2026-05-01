import { useState } from "react";
import videoBackground from "../../imports/vecteezy_an-anime-style-city-skyline-at-sunset-with-clouds-drifting_51900393.mp4";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");

  // Sign In form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation (prototype - use real authentication in production)
    if (signInEmail === "admin@dailyflow.com" && signInPassword === "admin123") {
      onLogin();
    } else {
      setError("Invalid credentials. Use admin@dailyflow.com / admin123");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // For prototype, just login after signup
    onLogin();
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoBackground} type="video/mp4" />
      </video>

      <div className="bg-gradient-to-br from-pink-200/80 to-purple-200/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-pink-300/50">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 relative">
          <button
            onClick={() => setActiveTab("signup")}
            className={`text-lg font-medium pb-2 transition-colors ${
              activeTab === "signup" ? "text-pink-600" : "text-gray-600"
            }`}
          >
            Sign up
          </button>
          <button
            onClick={() => setActiveTab("signin")}
            className={`text-lg font-medium pb-2 transition-colors ${
              activeTab === "signin" ? "text-pink-600" : "text-gray-600"
            }`}
          >
            Sign in
          </button>
        </div>

        {activeTab === "signup" ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create a DailyFlow account</h2>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="px-4 py-3 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="px-4 py-3 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(775) 351-6501"
                  className="w-full px-4 py-3 pl-16 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <div className="absolute left-3 top-3.5 flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 mt-6 shadow-lg"
              >
                Create an account
              </button>
            </form>

            <p className="text-gray-700 text-xs text-center mt-6">
              By creating an account, you agree to our Terms & Service
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sign in to DailyFlow</h2>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 mt-6 shadow-lg"
              >
                Sign in
              </button>
            </form>

            <p className="text-gray-700 text-xs text-center mt-6">
              Demo credentials: admin@dailyflow.com / admin123
            </p>
          </>
        )}
      </div>
    </div>
  );
}
