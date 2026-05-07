import { useEffect, useState } from "react";
import AuthForm from "./components/auth/AuthForm.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import { getProfile } from "./services/api.js";

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setCheckingSession(false);
      return;
    }

    getProfile()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (checkingSession) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-badge">BD</div>
          <h1>Loading...</h1>
          <p>Checking your session.</p>
        </section>
      </main>
    );
  
 }

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
