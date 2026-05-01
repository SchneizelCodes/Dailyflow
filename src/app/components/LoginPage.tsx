import { useState } from "react";
import { EmailVerification } from "./EmailVerification";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import videoBackground from "../../imports/vecteezy_an-anime-style-city-skyline-at-sunset-with-clouds-drifting_51900393.mp4";
import fallbackImage from "../../imports/anime-style-earth.jpg";

interface LoginPageProps {
  onLogin: (username: string, userType: "admin" | "user") => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");

  // Sign In form
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up form
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingUserData, setPendingUserData] = useState({ username: "", password: "", email: "" });
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailData, setEmailData] = useState({ username: "", password: "", email: "" });
  const [videoError, setVideoError] = useState(false);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if admin login
    if (signInUsername === "admin" && signInPassword === "admin123") {
      localStorage.setItem("dailyflow_current_user", JSON.stringify({
        username: signInUsername,
        userType: "admin"
      }));
      onLogin(signInUsername, "admin");
      return;
    }

    // Check regular users
    const users = JSON.parse(localStorage.getItem("dailyflow_users") || "[]");
    const user = users.find((u: any) => u.username === signInUsername && u.password === signInPassword);

    if (user) {
      localStorage.setItem("dailyflow_current_user", JSON.stringify({
        ...user,
        userType: "user"
      }));
      onLogin(user.username, "user");
    } else {
      setError("Invalid credentials. Try admin / admin123 or sign up");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("dailyflow_users") || "[]");

    // Check if user already exists
    if (users.find((u: any) => u.email === signUpEmail)) {
      setError("Email already registered. Please sign in.");
      return;
    }

    if (users.find((u: any) => u.username === signUpUsername)) {
      setError("Username already taken. Please choose another.");
      return;
    }

    // Generate verification code
    const code = generateVerificationCode();
    setVerificationCode(code);

    // Store pending user data
    setPendingUserData({
      username: signUpUsername,
      email: signUpEmail,
      password: signUpPassword
    });

    // Send verification email via server
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/send-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: signUpEmail,
            username: signUpUsername,
            password: signUpPassword,
            verificationCode: code,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to send email:", result);
        setError("Failed to send verification email. Please try again.");
        return;
      }

      console.log("Verification email sent successfully");
      // Show email verification modal
      setShowEmailVerification(true);
    } catch (error) {
      console.error("Error sending verification email:", error);
      setError("Network error. Please check your connection and try again.");
    }
  };

  const handleVerificationSuccess = () => {
    const users = JSON.parse(localStorage.getItem("dailyflow_users") || "[]");

    // Create new user after successful verification
    const newUser = {
      username: pendingUserData.username,
      email: pendingUserData.email,
      password: pendingUserData.password,
      createdAt: new Date().toISOString(),
      verified: true
    };

    users.push(newUser);
    localStorage.setItem("dailyflow_users", JSON.stringify(users));

    // Store email data and show preview
    setEmailData({
      username: pendingUserData.username,
      password: pendingUserData.password,
      email: pendingUserData.email
    });

    setShowEmailVerification(false);
    setShowEmailPreview(true);
  };

  const handleVerificationCancel = () => {
    setShowEmailVerification(false);
    setPendingUserData({ username: "", password: "", email: "" });
    setVerificationCode("");
  };

  const handleResendCode = async () => {
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);

    // Resend verification email
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/send-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: pendingUserData.email,
            username: pendingUserData.username,
            password: pendingUserData.password,
            verificationCode: newCode,
          }),
        }
      );

      if (response.ok) {
        console.log("Verification email resent successfully");
      } else {
        console.error("Failed to resend email");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
    }
  };

  const handleEmailConfirm = () => {
    const users = JSON.parse(localStorage.getItem("dailyflow_users") || "[]");
    const user = users.find((u: any) => u.username === emailData.username);
    localStorage.setItem("dailyflow_current_user", JSON.stringify({
      ...user,
      userType: "user"
    }));
    setShowEmailPreview(false);
    onLogin(user.username, "user");
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

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <EmailVerification
          email={pendingUserData.email}
          verificationCode={verificationCode}
          onVerify={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
          onResend={handleResendCode}
        />
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-pink-200/95 to-purple-200/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative border border-pink-300/50 m-4">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
                Welcome to DailyFlow!
              </h2>
              <p className="text-gray-700 text-sm">Account Successfully Created</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-300/50 mb-6">
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-pink-200">
                  <p className="text-gray-800 font-semibold text-lg mb-1">Account Details</p>
                  <p className="text-gray-600 text-sm">Save these credentials to sign in</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-pink-50/80 rounded-lg p-3">
                    <svg className="w-5 h-5 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Username</p>
                      <p className="text-gray-900 font-semibold">{emailData.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-pink-50/80 rounded-lg p-3">
                    <svg className="w-5 h-5 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Password</p>
                      <p className="text-gray-900 font-semibold font-mono">{emailData.password}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-pink-50/80 rounded-lg p-3">
                    <svg className="w-5 h-5 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-gray-900 font-semibold">{emailData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-200">
                  <p className="text-gray-700 text-sm text-center">
                    Start organizing your daily tasks efficiently with DailyFlow's intuitive interface and powerful features.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleEmailConfirm}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
              >
                Continue to DailyFlow
              </button>
              <p className="text-gray-600 text-xs mt-4">
                An email has been sent to <span className="font-semibold">{emailData.email}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-pink-200/80 to-purple-200/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-pink-300/50">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 relative">
          <button
            onClick={() => {
              setActiveTab("signup");
              setError("");
            }}
            className={`text-lg font-medium pb-2 transition-colors ${
              activeTab === "signup" ? "text-pink-600" : "text-gray-600"
            }`}
          >
            Sign up
          </button>
          <button
            onClick={() => {
              setActiveTab("signin");
              setError("");
            }}
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
              <div className="relative">
                <input
                  type="text"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  minLength={6}
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="Email (required)"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                  type="text"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-3 pl-10 bg-white/60 border border-pink-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
              Demo credentials: admin / admin123
            </p>
          </>
        )}
      </div>
    </div>
  );
}
