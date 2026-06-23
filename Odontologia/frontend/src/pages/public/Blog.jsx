// frontend/src/pages/public/Blog.jsx
// Listado de blog. El endpoint público de blog se implementará en la fase de contenido;
// por ahora muestra un estado vacío elegante y enlaza a la reserva.

import { Link } from 'react-router-dom';

export default function Blog() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-ink">Blog</h1>
      <p className="mt-3 text-slate-500">
        Pronto compartiremos consejos de salud bucal, novedades y guías de cuidado dental.
      </p>
      <Link to="/reservar-cita" className="btn-primary mt-8">Mientras tanto, agenda tu cita</Link>
    </div>
  );
}
