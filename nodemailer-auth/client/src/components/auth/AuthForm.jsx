import { useState } from "react";
import cakeImage from "../../../images/Birthday-Cake-1.webp";
import { login, signup } from "../../services/api.js";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("welcome");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const update = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const authAction = mode === "signup" ? signup : login;
      const data = await authAction(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (mode === "welcome") {
    return (
      <main className="auth-page">
        <section className="welcome-card">
          <img className="welcome-image" src={cakeImage} alt="Birthday cake" />
          <div className="welcome-content">
            <span className="welcome-kicker">Birthday Reminder</span>
            <h1>
              Welcome Taban
              <span> Birthday</span>
            </h1>
            <p>Keep every special day close, beautiful, and easy to remember.</p>
            <div className="welcome-actions">
              <button className="primary-button wide" type="button" onClick={() => setMode("signup")}>
                Sign Up
              </button>
              <button className="secondary-button wide" type="button" onClick={() => setMode("login")}>
                Log In
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button className="back-button" type="button" onClick={() => setMode("welcome")}>
          Back
        </button>
        <img className="auth-image" src={cakeImage} alt="Birthday cake" />
        <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p>
          {mode === "signup"
            ? "Join Birthday Reminder and keep every celebration close."
            : "Sign in to continue to your reminders."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label>
              Full name
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={update("name")}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={update("password")}
              required
            />
          </label>

          <button className="primary-button wide" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Log In"}
          </button>
        </form>

        {message && <div className="error-banner">{message.text}</div>}

        <p className="auth-switch">
          {mode === "signup" ? "Already have an account?" : "New here?"}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setMessage(null);
            }}
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}
