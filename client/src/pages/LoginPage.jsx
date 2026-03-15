import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

const getDashboardPath = (role) => {
  if (role === "teacher") {
    return "/dashboard/teacher";
  }

  if (role === "admin") {
    return "/dashboard/admin";
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
  if (type === "check") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "bolt") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2L5 13h5l-1 9 8-11h-5l1-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.3-2.7 8.2-7 10-4.3-1.8-7-5.7-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const authUser = await login(formData);
      const fallbackPath = getDashboardPath(authUser.role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;
      navigate(redirectPath, { replace: true });
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
          <h1>Bun venit înapoi</h1>
          <p>
            Continuă-ți parcursul de învățare. Tutorii tăi și următoarele ședințe te așteaptă.
          </p>

          <div className="auth-benefit-list">
            <div className="auth-benefit-item">
              <span className="auth-benefit-icon"><MiniIcon type="check" /></span>
              <div>
                <strong>Tutori verificați manual</strong>
                <p>Fiecare tutor are profil complet și recenzii reale.</p>
              </div>
            </div>
            <div className="auth-benefit-item">
              <span className="auth-benefit-icon"><MiniIcon type="bolt" /></span>
              <div>
                <strong>Rezervare în 30 de secunde</strong>
                <p>Alegi data și intervalul, iar fluxul rămâne simplu.</p>
              </div>
            </div>
            <div className="auth-benefit-item">
              <span className="auth-benefit-icon"><MiniIcon type="shield" /></span>
              <div>
                <strong>Confirmare clară</strong>
                <p>Vezi rapid dacă ședința este individuală sau în grupă.</p>
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
          <h2>Autentificare</h2>
          <p className="muted">Introdu datele contului tău MediTare</p>

          <ErrorMessage message={error} />

          <form className="form" onSubmit={handleSubmit}>
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
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="button auth-submit-button" disabled={loading}>
              {loading ? "Se autentifică..." : "Autentifică-te"}
            </button>
          </form>

          <div className="auth-divider">
            <span>sau</span>
          </div>

          <p className="auth-helper-text">
            Nu ai cont? <Link to="/register">Înregistrează-te gratuit</Link>
          </p>
          <p className="auth-back-link">
            <Link to="/">Înapoi la pagina principală</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
