// Encabezado de sección reutilizable (etiqueta + título + subtítulo)
export default function SectionTitle({ tag, title, subtitle, light = false }) {
  return (
    <div className={`section-title ${light ? 'section-title--light' : ''}`}>
      {tag && <div className="tag">{tag}</div>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
