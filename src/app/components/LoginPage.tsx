import { useState } from "react";
import { supabase } from "../../utils/supabase/client";
import { EmailVerification } from "./EmailVerification";
import videoBackground from "../../imports/vecteezy_an-anime-style-city-skyline-at-sunset-with-clouds-drifting_51900393.mp4";
import fallbackImage from "../../imports/anime-style-earth.jpg";

interface LoginPageProps {
  onLogin: (username: string, userType: "admin" | "user") => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign In form
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up form
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");

  // Email Verification
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingUserData, setPendingUserData] = useState({ username: "", password: "", email: "" });

  const [videoError, setVideoError] = useState(false);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if admin login
      if (signInUsername === "admin" && signInPassword === "admin123") {
        localStorage.setItem("dailyflow_current_user", JSON.stringify({
          username: "admin",
          userType: "admin"
        }));
        onLogin("admin", "admin");
        setLoading(false);
        return;
      }

      // Look up email by username first
      const { projectId, publicAnonKey } = await import("../../../utils/supabase/info");
      const lookupResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/lookup-email-by-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ username: signInUsername }),
        }
      );

      if (!lookupResponse.ok) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      const { email } = await lookupResponse.json();

      // Sign in with Supabase Auth using the found email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: signInPassword,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email before signing in. Check your inbox.");
        } else if (error.message.includes("Invalid login credentials")) {
          setError("Invalid username or password");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Get user metadata (username)
        const username = data.user.user_metadata?.username || data.user.email?.split('@')[0] || "User";

        localStorage.setItem("dailyflow_current_user", JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          username: username,
          userType: "user"
        }));

        onLogin(username, "user");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Check if username or email already exists
      const { projectId, publicAnonKey } = await import("../../../utils/supabase/info");

      const checkResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/check-user-exists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            username: signUpUsername,
            email: signUpEmail
          }),
        }
      );

      if (!checkResponse.ok) {
        const result = await checkResponse.json();
        setError(result.error || "User already exists");
        setLoading(false);
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

      // Send verification email with code, username, and password
      const emailResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/send-signup-verification`,
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

      if (!emailResponse.ok) {
        const result = await emailResponse.json();
        console.error("Failed to send email:", result);
        setError("Failed to send verification email. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Verification email sent successfully");
      // Show email verification modal
      setShowEmailVerification(true);
      setLoading(false);
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    setLoading(true);
    try {
      const { projectId, publicAnonKey } = await import("../../../utils/supabase/info");

      // Create the Supabase user with auto-confirmed email
      const createResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/create-verified-user`,
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
          }),
        }
      );

      if (!createResponse.ok) {
        const result = await createResponse.json();
        setError(result.error || "Failed to create account");
        setLoading(false);
        return;
      }

      setShowEmailVerification(false);
      setSuccess("Account created and verified successfully! You can now sign in.");

      // Clear form
      setSignUpUsername("");
      setSignUpEmail("");
      setSignUpPassword("");

      // Switch to sign in tab after 3 seconds
      setTimeout(() => {
        setActiveTab("signin");
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error creating verified user:", err);
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationCancel = () => {
    setShowEmailVerification(false);
    setPendingUserData({ username: "", password: "", email: "" });
    setVerificationCode("");
  };

  const handleResendCode = async () => {
    try {
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);

      const { projectId, publicAnonKey } = await import("../../../utils/supabase/info");

      // Resend verification email
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64c5bfad/send-signup-verification`,
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

      console.log("Verification email resent successfully");
    } catch (error) {
      console.error("Error resending verification email:", error);
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

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create an account"}
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
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-gray-700 text-xs text-center mt-6">
              Admin login: admin / admin123
            </p>
          </>
        )}
      </div>
    </div>
  );
}
