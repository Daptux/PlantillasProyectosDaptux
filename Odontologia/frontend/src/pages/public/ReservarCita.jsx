// frontend/src/pages/public/ReservarCita.jsx
// Formulario público que crea una cita en estado SOLICITADA.

import { useEffect, useState } from 'react';
import { citasService } from '../../services/citasService';
import { serviciosService } from '../../services/serviciosService';

const INICIAL = {
  nombre_contacto: '',
  telefono_contacto: '',
  correo_contacto: '',
  servicio_id: '',
  fecha: '',
  hora_inicio: '',
  motivo: '',
  acepta_datos: false,
};

export default function ReservarCita() {
  const [form, setForm] = useState(INICIAL);
  const [servicios, setServicios] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  useEffect(() => {
    serviciosService.listarPublicos().then(({ data }) => setServicios(data.datos || [])).catch(() => {});
  }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMensaje(null);
    if (!form.acepta_datos) {
      setMensaje({ tipo: 'error', texto: 'Debes aceptar el tratamiento de datos.' });
      return;
    }
    setEnviando(true);
    try {
      const payload = { ...form, servicio_id: form.servicio_id || null };
      const { data } = await citasService.crearPublica(payload);
      setMensaje({ tipo: 'ok', texto: data.mensaje });
      setForm(INICIAL);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo enviar la solicitud.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink">Agenda tu cita</h1>
        <p className="mt-2 text-slate-500">
          Completa el formulario y nuestro equipo te contactará para confirmar.
        </p>
      </div>

      {mensaje && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            mensaje.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={onSubmit} className="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nombre completo *</label>
          <input name="nombre_contacto" className="input" value={form.nombre_contacto} onChange={onChange} required />
        </div>
        <div>
          <label className="label">Teléfono *</label>
          <input name="telefono_contacto" className="input" value={form.telefono_contacto} onChange={onChange} required />
        </div>
        <div>
          <label className="label">Correo</label>
          <input type="email" name="correo_contacto" className="input" value={form.correo_contacto} onChange={onChange} />
        </div>
        <div>
          <label className="label">Servicio de interés</label>
          <select name="servicio_id" className="input" value={form.servicio_id} onChange={onChange}>
            <option value="">Selecciona…</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fecha deseada *</label>
          <input type="date" name="fecha" className="input" value={form.fecha} onChange={onChange} required />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Hora deseada</label>
          <input type="time" name="hora_inicio" className="input" value={form.hora_inicio} onChange={onChange} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Mensaje</label>
          <textarea name="motivo" rows="3" className="input" value={form.motivo} onChange={onChange} placeholder="Cuéntanos el motivo de tu consulta…" />
        </div>
        <div className="sm:col-span-2 flex items-start gap-2">
          <input type="checkbox" name="acepta_datos" checked={form.acepta_datos} onChange={onChange} className="mt-1" />
          <label className="text-sm text-slate-600">
            Acepto el tratamiento de mis datos personales conforme a la política de privacidad.
          </label>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary w-full" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Solicitar cita'}
          </button>
        </div>
      </form>
    </div>
  );
}
