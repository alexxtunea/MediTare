import { Link } from "react-router-dom";
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

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero-section container">
        <div className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Platformă educațională</p>
            <h1>Găsește meditații într-un spațiu care pare serios, calm și profesionist.</h1>
            <p className="hero-text">
              MediTare aduce într-un singur loc profesori, studenți și rezervări
              clare, cu un flux simplu pentru selecție, plată și feedback.
            </p>

            <div className="hero-actions">
              <Link className="button" to="/teachers">
                Vezi profesorii
              </Link>
              {user ? (
                <Link className="button secondary-button" to={getDashboardPath(user.role)}>
                  Mergi la dashboard
                </Link>
              ) : (
                <>
                  <Link className="button secondary-button" to="/login">
                    Login
                  </Link>
                  <Link className="button ghost-button" to="/register">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-stat-card">
              <span className="hero-stat-value">3 roluri</span>
              <span className="hero-stat-label">Student, Teacher, Admin</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-value">Booking rapid</span>
              <span className="hero-stat-label">materie, dată și interval</span>
            </div>
            <div className="hero-stat-card accent-card">
              <span className="hero-stat-value">Review-uri</span>
              <span className="hero-stat-label">după ședințe plătite</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container info-grid">
        <article className="card">
          <h3>Studenți</h3>
          <p>Caută profesori, rezervă sesiuni și gestionează plata dintr-un singur loc.</p>
        </article>
        <article className="card">
          <h3>Profesori</h3>
          <p>Adaugă poză, experiență, locul unde predai și disponibilitatea fără un flux complicat.</p>
        </article>
        <article className="card">
          <h3>Administrare</h3>
          <p>Vizualizează userii și booking-urile dintr-un dashboard clar și ușor de prezentat.</p>
        </article>
      </section>
    </div>
  );
}
