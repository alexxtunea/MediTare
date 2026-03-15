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
    <div className="page centered-page">
      <div className="auth-card">
        <h1>Register</h1>
        <p className="muted">Creează un cont nou în doar câteva secunde.</p>

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

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Se creează contul..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Ai deja cont? <Link to="/login">Autentifică-te aici</Link>.
        </p>
      </div>
    </div>
  );
}
