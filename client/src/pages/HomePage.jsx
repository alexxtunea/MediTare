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

function FeatureIcon({ type }) {
  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.3-2.7 8.2-7 10-4.3-1.8-7-5.7-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.5 12.2l1.8 1.8 3.7-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "flash") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2L5 13h5l-1 9 8-11h-5l1-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 22z" fill="currentColor" />
      <path d="M18 9a6 6 0 10-12 0c0 2.2-.7 3.7-1.7 4.9-.6.7-.2 1.8.8 1.8h13.8c1 0 1.4-1.1.8-1.8C18.7 12.7 18 11.2 18 9z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function StatIcon({ type }) {
  if (type === "person") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="7.5" r="3.4" stroke="currentColor" strokeWidth="1.9" />
        <path d="M5.5 18.5c0-3 2.9-5 6.5-5s6.5 2 6.5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L12 3.8z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-shell">
        <div className="container hero-shell-inner">
          <div className="hero-main">
            <div className="hero-pill">Platforma #1 de meditații din România</div>
            <h1>
              Învățarea fără limite
              <span> începe aici</span>
            </h1>
            <p className="hero-text">
              Conectăm elevi ambițioși cu tutori experimentați. Găsește rapid profesorul
              potrivit și rezervă următoarea ședință într-un flux clar și elegant.
            </p>

            <div className="hero-search">
              <div className="hero-search-input">
                <input
                  type="text"
                  placeholder="Ce vrei să înveți? Matematică, Engleză, Informatică..."
                  readOnly
                />
              </div>
              <Link className="button hero-primary-button" to="/teachers">
                Găsește tutor
              </Link>
            </div>

            <div className="hero-inline-benefits">
              <span>Fără comision</span>
              <span>Tutori verificați</span>
              <span>Rezervare în 30 secunde</span>
            </div>
          </div>

          <div className="hero-side-stats">
            <article className="hero-side-card">
              <div className="hero-side-card-value-row">
                <strong>100+</strong>
                <div className="hero-side-icon hero-side-icon-person" aria-hidden="true">
                  <StatIcon type="person" />
                </div>
              </div>
              <span>Tutori activi</span>
            </article>

            <article className="hero-side-card">
              <div className="hero-side-card-value-row">
                <strong>4.9</strong>
                <div className="hero-side-icon hero-side-icon-star" aria-hidden="true">
                  <StatIcon type="star" />
                </div>
              </div>
              <span>Rating mediu</span>
            </article>

            <article className="hero-side-card">
              <div className="hero-side-card-value-row">
                <strong>100%</strong>
                <div className="hero-side-icon hero-side-icon-plus" aria-hidden="true">
                  <StatIcon type="plus" />
                </div>
              </div>
              <span>Online • Oricând</span>
            </article>
          </div>
        </div>
      </section>

      <section className="container home-feature-grid">
        <article className="home-feature-card">
          <div className="feature-svg">
            <FeatureIcon type="shield" />
          </div>
          <div>
            <h3>Tutori verificați manual</h3>
            <p>Fiecare tutor are profil complet, experiență clară și review-uri reale.</p>
          </div>
        </article>

        <article className="home-feature-card">
          <div className="feature-svg">
            <FeatureIcon type="flash" />
          </div>
          <div>
            <h3>Rezervare în 30 de secunde</h3>
            <p>Alegi materia, data și intervalul, iar restul fluxului rămâne simplu.</p>
          </div>
        </article>

        <article className="home-feature-card">
          <div className="feature-svg">
            <FeatureIcon type="bell" />
          </div>
          <div>
            <h3>Confirmare clară</h3>
            <p>Vezi rapid durata ședinței, tipul ei și statusul rezervărilor tale.</p>
          </div>
        </article>
      </section>

      <section className="container home-cta-row">
        <div className="section-chip">Tutori disponibili</div>
        <div className="home-cta-actions">
          <Link className="button secondary-button" to="/teachers">
            Explorează profesorii
          </Link>
          {user ? (
            <Link className="button" to={getDashboardPath(user.role)}>
              Deschide dashboard-ul
            </Link>
          ) : (
            <Link className="button" to="/register">
              Creează cont
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
