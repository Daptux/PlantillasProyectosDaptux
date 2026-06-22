/**
 * frontend/src/pages/public/ReservarCita.jsx
 * Formulario público de solicitud de cita (queda en estado SOLICITADA).
 */
import { useEffect, useState } from 'react';
import { serviciosService } from '../../services/serviciosService';
import { citasService } from '../../services/citasService';

const inicial = {
  nombre_contacto: '', telefono_contacto: '', correo_contacto: '',
  servicio_id: '', fecha: '', hora_inicio: '', motivo: '', acepta_datos: false,
};

export default function ReservarCita() {
  const [form, setForm] = useState(inicial);
  const [servicios, setServicios] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    serviciosService.listarPublicos().then((r) => setServicios(r.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMensaje(null);
    if (!form.acepta_datos) { setError('Debes aceptar el tratamiento de datos.'); return; }
    setEnviando(true);
    try {
      const res = await citasService.solicitar(form);
      setMensaje(res.mensaje);
      setForm(inicial);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-brand-50 to-teal-50 min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800">Agenda tu cita</h1>
          <p className="text-slate-500 mt-3">Completa el formulario y te contactaremos para confirmar.</p>
        </div>

        {mensaje ? (
          <div className="card p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-slate-800">{mensaje}</h2>
            <button onClick={() => setMensaje(null)} className="btn-primary mt-6">Agendar otra cita</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-4">
            {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre completo *</label>
                <input className="input" value={form.nombre_contacto} onChange={set('nombre_contacto')} required />
              </div>
              <div>
                <label className="label">Teléfono *</label>
                <input className="input" value={form.telefono_contacto} onChange={set('telefono_contacto')} required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Correo</label>
                <input type="email" className="input" value={form.correo_contacto} onChange={set('correo_contacto')} />
              </div>
              <div>
                <label className="label">Servicio de interés</label>
                <select className="input" value={form.servicio_id} onChange={set('servicio_id')}>
                  <option value="">Selecciona un servicio</option>
                  {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha deseada *</label>
                <input type="date" className="input" value={form.fecha} onChange={set('fecha')} required />
              </div>
              <div>
                <label className="label">Hora deseada *</label>
                <input type="time" className="input" value={form.hora_inicio} onChange={set('hora_inicio')} required />
              </div>
            </div>

            <div>
              <label className="label">Mensaje / motivo</label>
              <textarea className="input" rows="3" value={form.motivo} onChange={set('motivo')} />
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.acepta_datos} onChange={set('acepta_datos')} className="mt-1" />
              Acepto el tratamiento de mis datos personales según la política de privacidad.
            </label>

            <button type="submit" disabled={enviando} className="btn-primary w-full">
              {enviando ? 'Enviando...' : 'Solicitar cita'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
