import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";

type Page = "login" | "dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");

  const handleLogin = () => {
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentPage("login");
  };

  return (
    <div className="size-full">
      {currentPage === "login" && <LoginPage onLogin={handleLogin} />}
      {currentPage === "dashboard" && <Dashboard onLogout={handleLogout} />}
    </div>
  );
}