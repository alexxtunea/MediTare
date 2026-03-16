import { Link, NavLink, useNavigate } from "react-router-dom";
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

function BrandIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="11" height="11" rx="2.5" fill="#A8BAA1" />
      <rect x="9" y="3" width="11" height="11" rx="2.5" fill="#2B6647" />
      <rect x="14" y="8" width="11" height="11" rx="2.5" fill="#D6BB93" />
      <path d="M8 19.5H20.5" stroke="#123524" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 5.5V16.5" stroke="#FFF9F0" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container nav-bar">
        <Link to="/" className="brand" aria-label="MediTare acasă">
          <span className="brand-mark">
            <BrandIcon />
          </span>
          <span className="brand-text">
            <span className="brand-text-medi">Medi</span>
            <span className="brand-text-tare">Tare</span>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Acasă</NavLink>
          <NavLink to="/teachers">Găsește tutor</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to={getDashboardPath(user.role)}>Dashboard</NavLink>
              <button type="button" className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Autentificare</NavLink>
              <NavLink to="/register" className="nav-cta">
                Înregistrare
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
