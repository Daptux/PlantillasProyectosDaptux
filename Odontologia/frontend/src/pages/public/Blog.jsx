/**
 * frontend/src/pages/public/Blog.jsx
 * Sección de blog (preparada; consume /contenido si se habilita en el futuro).
 */
import EmptyState from '../../components/common/EmptyState';

export default function Blog() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800">Blog</h1>
        <p className="text-slate-500 mt-3">Consejos y novedades sobre salud bucal.</p>
      </div>
      <EmptyState mensaje="Muy pronto publicaremos artículos sobre salud dental." icono="📝" />
    </div>
  );
}
