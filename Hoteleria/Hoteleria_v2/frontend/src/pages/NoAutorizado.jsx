import { Link } from 'react-router-dom';

export default function NoAutorizado() {
  return (
    <div className="auth-wrapper">
      <div className="auth-box" style={{ textAlign: 'center' }}>
        <h1>403</h1>
        <p className="sub">No tienes permisos para acceder a esta página.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-block' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
