// frontend/src/pages/admin/ContenidoWeb.jsx
// Edición del contenido público: configuración de la clínica, testimonios, FAQs y galería.

import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { contenidoService } from '../../services/contenidoService';

const TABS = [
  { id: 'config', label: 'Configuración' },
  { id: 'testimonios', label: 'Testimonios' },
  { id: 'faqs', label: 'Preguntas frecuentes' },
  { id: 'galeria', label: 'Galería' },
];

const CAMPOS_CONFIG = [
  ['nombre_clinica', 'Nombre de la clínica'],
  ['eslogan', 'Eslogan'],
  ['telefono', 'Teléfono'],
  ['whatsapp', 'WhatsApp (sin +)'],
  ['correo', 'Correo'],
  ['direccion', 'Dirección'],
  ['horarios', 'Horarios'],
  ['instagram_url', 'Instagram URL'],
  ['facebook_url', 'Facebook URL'],
  ['mapa_embed', 'Mapa (URL embed)'],
];

export default function ContenidoWeb() {
  const [tab, setTab] = useState('config');
  const [cargando, setCargando] = useState(true);
  const [config, setConfig] = useState({});
  const [testimonios, setTestimonios] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Formularios para crear nuevos elementos
  const [nuevoTesti, setNuevoTesti] = useState({ nombre: '', comentario: '', calificacion: 5, servicio: '' });
  const [nuevaFaq, setNuevaFaq] = useState({ pregunta: '', respuesta: '' });
  const [nuevaImg, setNuevaImg] = useState({ titulo: '', imagen_url: '' });

  async function cargar() {
    setCargando(true);
    try {
      const [cfg, tst, fq, gl] = await Promise.all([
        contenidoService.obtenerConfiguracion(),
        contenidoService.listarTestimonios(true),
        contenidoService.listarFaqs(true),
        contenidoService.listarGaleria(true),
      ]);
      setConfig(cfg.data.datos || {});
      setTestimonios(tst.data.datos || []);
      setFaqs(fq.data.datos || []);
      setGaleria(gl.data.datos || []);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  function aviso(texto) { setMensaje(texto); setTimeout(() => setMensaje(''), 2500); }

  async function guardarConfig(e) {
    e.preventDefault();
    await contenidoService.actualizarConfiguracion(config);
    aviso('Configuración guardada.');
  }
  async function crearTesti(e) {
    e.preventDefault();
    await contenidoService.crearTestimonio(nuevoTesti);
    setNuevoTesti({ nombre: '', comentario: '', calificacion: 5, servicio: '' });
    cargar(); aviso('Testimonio agregado.');
  }
  async function crearFaq(e) {
    e.preventDefault();
    await contenidoService.crearFaq(nuevaFaq);
    setNuevaFaq({ pregunta: '', respuesta: '' });
    cargar(); aviso('Pregunta agregada.');
  }
  async function crearImg(e) {
    e.preventDefault();
    await contenidoService.crearGaleria(nuevaImg);
    setNuevaImg({ titulo: '', imagen_url: '' });
    cargar(); aviso('Imagen agregada.');
  }

  if (cargando) return <Loader />;

  return (
    <div>
      <PageHeader titulo="Contenido web" descripcion="Edita lo que se muestra en la landing pública" />

      {mensaje && <div className="mb-4 rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{mensaje}</div>}

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === t.id ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONFIGURACIÓN */}
      {tab === 'config' && (
        <form onSubmit={guardarConfig} className="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {CAMPOS_CONFIG.map(([clave, label]) => (
            <div key={clave} className={clave === 'mapa_embed' ? 'sm:col-span-2' : ''}>
              <label className="label">{label}</label>
              <input className="input" value={config[clave] || ''} onChange={(e) => setConfig({ ...config, [clave]: e.target.value })} />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary">Guardar configuración</button>
          </div>
        </form>
      )}

      {/* TESTIMONIOS */}
      {tab === 'testimonios' && (
        <div className="space-y-4">
          <form onSubmit={crearTesti} className="card grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            <input className="input" placeholder="Nombre" value={nuevoTesti.nombre} onChange={(e) => setNuevoTesti({ ...nuevoTesti, nombre: e.target.value })} required />
            <input className="input" placeholder="Servicio" value={nuevoTesti.servicio} onChange={(e) => setNuevoTesti({ ...nuevoTesti, servicio: e.target.value })} />
            <textarea className="input sm:col-span-2" placeholder="Comentario" value={nuevoTesti.comentario} onChange={(e) => setNuevoTesti({ ...nuevoTesti, comentario: e.target.value })} required />
            <select className="input" value={nuevoTesti.calificacion} onChange={(e) => setNuevoTesti({ ...nuevoTesti, calificacion: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrellas</option>)}
            </select>
            <button className="btn-primary">Agregar testimonio</button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {testimonios.map((t) => (
              <div key={t.id} className="card p-4">
                <p className="text-amber-400">{'★'.repeat(t.calificacion)}</p>
                <p className="mt-1 text-sm italic text-slate-600">“{t.comentario}”</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">{t.nombre}</span>
                  <button className="text-xs text-red-500" onClick={async () => { await contenidoService.eliminarTestimonio(t.id); cargar(); }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQS */}
      {tab === 'faqs' && (
        <div className="space-y-4">
          <form onSubmit={crearFaq} className="card grid grid-cols-1 gap-3 p-5">
            <input className="input" placeholder="Pregunta" value={nuevaFaq.pregunta} onChange={(e) => setNuevaFaq({ ...nuevaFaq, pregunta: e.target.value })} required />
            <textarea className="input" placeholder="Respuesta" value={nuevaFaq.respuesta} onChange={(e) => setNuevaFaq({ ...nuevaFaq, respuesta: e.target.value })} required />
            <div className="flex justify-end"><button className="btn-primary">Agregar pregunta</button></div>
          </form>
          <div className="space-y-2">
            {faqs.map((f) => (
              <div key={f.id} className="card flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">{f.pregunta}</p>
                  <p className="text-sm text-slate-500">{f.respuesta}</p>
                </div>
                <button className="text-xs text-red-500" onClick={async () => { await contenidoService.eliminarFaq(f.id); cargar(); }}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GALERÍA */}
      {tab === 'galeria' && (
        <div className="space-y-4">
          <form onSubmit={crearImg} className="card grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            <input className="input" placeholder="Título" value={nuevaImg.titulo} onChange={(e) => setNuevaImg({ ...nuevaImg, titulo: e.target.value })} />
            <input className="input" placeholder="URL de la imagen" value={nuevaImg.imagen_url} onChange={(e) => setNuevaImg({ ...nuevaImg, imagen_url: e.target.value })} required />
            <div className="sm:col-span-2 flex justify-end"><button className="btn-primary">Agregar imagen</button></div>
          </form>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {galeria.map((g) => (
              <div key={g.id} className="card overflow-hidden">
                <img src={g.imagen_url} alt={g.titulo} className="aspect-square w-full object-cover" />
                <button className="w-full py-2 text-xs text-red-500" onClick={async () => { await contenidoService.eliminarGaleria(g.id); cargar(); }}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
