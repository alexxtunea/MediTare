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
          <span className="brand-mark">M</span>
          <span className="brand-text">MediTare</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Acasă</NavLink>
          <NavLink to="/teachers">Profesori</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to={getDashboardPath(user.role)}>Dashboard</NavLink>
              <button type="button" className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
