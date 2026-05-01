import { useState, useEffect } from "react";
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

  useEffect(() => {
    document.title = "DailyFlow";
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

  const handleLogout = () => {
    setCurrentPage("login");
    setUserType(null);
    setUsername("");
  };

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