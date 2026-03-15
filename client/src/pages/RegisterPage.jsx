import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

const getDashboardPath = (role) => {
  if (role === "teacher") {
    return "/dashboard/teacher";
  }

  return "/dashboard/student";
};

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

function AuthIllustration() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="4" y="9" width="12" height="12" rx="3" fill="#F3D36A" />
      <rect x="10" y="5" width="12" height="12" rx="3" fill="#E5B94E" />
      <rect x="16" y="11" width="12" height="12" rx="3" fill="#F8E39B" />
      <path d="M9 24.5H25" stroke="#FFF9F0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MiniIcon({ type }) {
  if (type === "book") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 016.5 4H18v15H6.5A2.5 2.5 0 014 16.5v-10z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8h6M8 11h6M8 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M16.5 20v-1.2A3.8 3.8 0 0012.7 15h-1.4a3.8 3.8 0 00-3.8 3.8V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8.5" r="3.3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.3-2.7 8.2-7 10-4.3-1.8-7-5.7-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authUser = await register(formData);
      navigate(getDashboardPath(authUser.role), { replace: true });
    } catch (submitError) {
      setError(getApiMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      <section className="auth-split-panel auth-split-panel-dark">
        <div className="auth-split-content">
          <div className="auth-split-badge">
            <AuthIllustration />
          </div>
          <h1>Începe mai simplu</h1>
          <p>
            Creează un cont și intră într-o platformă clară pentru meditații, booking și progres.
          </p>

          <div className="auth-benefit-list">
            <div className="auth-benefit-item">
              <span className="auth-benefit-icon"><MiniIcon type="book" /></span>
              <div>
                <strong>Materii și tutori bine organizați</strong>
                <p>Vezi experiența, instituția și stilul fiecărui profesor.</p>
              </div>
            </div>
            <div className="auth-benefit-item">
              <span className="auth-benefit-icon"><MiniIcon type="users" /></span>
              <div>
                <strong>Ședințe individuale sau de grup</strong>
                <p>Știi din start dacă lucrezi 1 la 1 sau într-o grupă.</p>
              </div>
            </div>
            <div className="auth-benefit-item">
              <span className="auth-benefit-icon"><MiniIcon type="shield" /></span>
              <div>
                <strong>Flux clar și sigur</strong>
                <p>De la cont nou până la rezervare, totul rămâne ușor de urmărit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-split-panel auth-split-panel-light">
        <div className="auth-form-card">
          <div className="auth-card-icon">
            <AuthIllustration />
          </div>
          <h2>Înregistrare</h2>
          <p className="muted">Creează contul tău MediTare în câteva secunde</p>

          <ErrorMessage message={error} />

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nume</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Numele tău"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@exemplu.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Parolă</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Creează o parolă"
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <button type="submit" className="button auth-submit-button" disabled={loading}>
              {loading ? "Se creează contul..." : "Înregistrează-te"}
            </button>
          </form>

          <div className="auth-divider">
            <span>sau</span>
          </div>

          <p className="auth-helper-text">
            Ai deja cont? <Link to="/login">Autentifică-te aici</Link>
          </p>
          <p className="auth-back-link">
            <Link to="/">Înapoi la pagina principală</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
