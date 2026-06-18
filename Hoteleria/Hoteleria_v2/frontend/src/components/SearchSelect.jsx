import { useState } from 'react';

// Selector con buscador (combobox).
// props: items, value (id seleccionado), onChange(id), getId(item), getLabel(item), placeholder
export default function SearchSelect({ items, value, onChange, getId, getLabel, placeholder = 'Buscar...' }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const seleccionado = items.find((it) => String(getId(it)) === String(value));
  const texto = q.trim().toLowerCase();
  const filtrados = (texto
    ? items.filter((it) => getLabel(it).toLowerCase().includes(texto))
    : items
  ).slice(0, 40);

  const elegir = (it) => {
    onChange(getId(it));
    setQ('');
    setOpen(false);
  };

  const limpiar = () => {
    onChange('');
    setQ('');
    setOpen(true);
  };

  return (
    <div className="ss">
      <input
        className="input"
        placeholder={placeholder}
        value={seleccionado ? getLabel(seleccionado) : q}
        onChange={(e) => { setQ(e.target.value); if (value) onChange(''); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ paddingRight: seleccionado ? 34 : 13 }}
      />
      {seleccionado && (
        <button type="button" className="ss-clear" onMouseDown={(e) => { e.preventDefault(); limpiar(); }} title="Limpiar">✕</button>
      )}
      {open && (
        <div className="ss-list">
          {filtrados.length === 0 ? (
            <div className="ss-empty">Sin resultados</div>
          ) : (
            filtrados.map((it) => (
              <div key={getId(it)} className="ss-item" onMouseDown={() => elegir(it)}>
                {getLabel(it)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
