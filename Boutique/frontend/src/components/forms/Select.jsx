export default function Select({ label, error, options = [], className = '', children, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'border-red-400' : ''}`} {...props}>
        {children}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
