import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page centered-page">
      <div className="auth-card">
        <h1>404</h1>
        <p className="muted">Pagina pe care o cauți nu există.</p>
        <Link className="button" to="/">
          Înapoi la Home
        </Link>
      </div>
    </div>
  );
}
