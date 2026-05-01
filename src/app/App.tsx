import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase/client";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { UserDashboard } from "./components/UserDashboard";
import { SecurityCodeModal } from "./components/SecurityCodeModal";

type Page = "login" | "security" | "admin-dashboard" | "user-dashboard";
type UserType = "admin" | "user";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "DailyFlow";

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const storedUser = localStorage.getItem("dailyflow_current_user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUsername(userData.username);
            setUserType(userData.userType);
            setCurrentPage(userData.userType === "admin" ? "admin-dashboard" : "user-dashboard");
          } else {
            // Create user data from session
            const displayUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || "User";
            setUsername(displayUsername);
            setUserType("user");
            setCurrentPage("user-dashboard");
            localStorage.setItem("dailyflow_current_user", JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              username: displayUsername,
              userType: "user"
            }));
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // User logged out
        setCurrentPage("login");
        setUserType(null);
        setUsername("");
        localStorage.removeItem("dailyflow_current_user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (loginUsername: string, loginUserType: UserType) => {
    setUsername(loginUsername);
    setUserType(loginUserType);

    if (loginUserType === "admin") {
      // Admin needs to pass security code
      setCurrentPage("security");
    } else {
      // Regular user goes directly to dashboard
      setCurrentPage("user-dashboard");
    }
  };

  const handleSecurityVerify = () => {
    setCurrentPage("admin-dashboard");
  };

  const handleSecurityCancel = () => {
    // Cancel security verification, go back to login
    localStorage.removeItem("dailyflow_current_user");
    setCurrentPage("login");
    setUserType(null);
    setUsername("");
  };

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local state
    setCurrentPage("login");
    setUserType(null);
    setUsername("");
    localStorage.removeItem("dailyflow_current_user");
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[#0A0B0F]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">DF</span>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full">
      {currentPage === "login" && <LoginPage onLogin={handleLogin} />}
      {currentPage === "security" && (
        <SecurityCodeModal
          onVerify={handleSecurityVerify}
          onCancel={handleSecurityCancel}
        />
      )}
      {currentPage === "admin-dashboard" && <Dashboard onLogout={handleLogout} />}
      {currentPage === "user-dashboard" && <UserDashboard onLogout={handleLogout} username={username} />}
    </div>
  );
}