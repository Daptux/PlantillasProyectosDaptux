/**
 * frontend/src/pages/admin/ContenidoWeb.jsx
 * Gestión del contenido de la landing: configuración, galería, testimonios y FAQs.
 */
import { useEffect, useState } from 'react';
import { contenidoService } from '../../services/contenidoService';
import PageHeader from '../../components/common/PageHeader';

const tabs = ['Configuración', 'Galería', 'Testimonios', 'FAQs'];

export default function ContenidoWeb() {
  const [tab, setTab] = useState('Configuración');
  const [config, setConfig] = useState({});
  const [galeria, setGaleria] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [msg, setMsg] = useState('');

  const [nuevaImg, setNuevaImg] = useState({ titulo: '', imagen_url: '', categoria: 'general' });
  const [nuevoTest, setNuevoTest] = useState({ nombre: '', comentario: '', calificacion: 5, servicio: '' });
  const [nuevaFaq, setNuevaFaq] = useState({ pregunta: '', respuesta: '' });

  useEffect(() => {
    contenidoService.configuracion().then((r) => setConfig(r.data || {})).catch(() => {});
    contenidoService.galeria().then((r) => setGaleria(r.data)).catch(() => {});
    contenidoService.testimonios().then((r) => setTestimonios(r.data)).catch(() => {});
    contenidoService.faqs().then((r) => setFaqs(r.data)).catch(() => {});
  }, []);

  function flash(t) { setMsg(t); setTimeout(() => setMsg(''), 2500); }
  const setC = (k) => (e) => setConfig({ ...config, [k]: e.target.value });

  async function guardarConfig(e) { e.preventDefault(); await contenidoService.actualizarConfiguracion(config); flash('Configuración guardada.'); }

  async function addImg(e) { e.preventDefault(); await contenidoService.crearGaleria(nuevaImg); setNuevaImg({ titulo: '', imagen_url: '', categoria: 'general' }); contenidoService.galeria().then((r) => setGaleria(r.data)); }
  async function delImg(id) { await contenidoService.eliminarGaleria(id); contenidoService.galeria().then((r) => setGaleria(r.data)); }

  async function addTest(e) { e.preventDefault(); await contenidoService.crearTestimonio(nuevoTest); setNuevoTest({ nombre: '', comentario: '', calificacion: 5, servicio: '' }); contenidoService.testimonios().then((r) => setTestimonios(r.data)); }
  async function delTest(id) { await contenidoService.eliminarTestimonio(id); contenidoService.testimonios().then((r) => setTestimonios(r.data)); }

  async function addFaq(e) { e.preventDefault(); await contenidoService.crearFaq(nuevaFaq); setNuevaFaq({ pregunta: '', respuesta: '' }); contenidoService.faqs().then((r) => setFaqs(r.data)); }
  async function delFaq(id) { await contenidoService.eliminarFaq(id); contenidoService.faqs().then((r) => setFaqs(r.data)); }

  return (
    <div>
      <PageHeader titulo="Contenido web" descripcion="Administra lo que se muestra en la landing." />
      {msg && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">{msg}</div>}

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Configuración' && (
        <form onSubmit={guardarConfig} className="card p-6 grid sm:grid-cols-2 gap-4">
          <div><label className="label">Nombre de la clínica</label><input className="input" value={config.nombre_clinica || ''} onChange={setC('nombre_clinica')} /></div>
          <div><label className="label">Logo (URL)</label><input className="input" value={config.logo_url || ''} onChange={setC('logo_url')} /></div>
          <div><label className="label">Teléfono</label><input className="input" value={config.telefono || ''} onChange={setC('telefono')} /></div>
          <div><label className="label">WhatsApp</label><input className="input" value={config.whatsapp || ''} onChange={setC('whatsapp')} /></div>
          <div><label className="label">Correo</label><input className="input" value={config.correo || ''} onChange={setC('correo')} /></div>
          <div><label className="label">Dirección</label><input className="input" value={config.direccion || ''} onChange={setC('direccion')} /></div>
          <div><label className="label">Horarios</label><input className="input" value={config.horarios || ''} onChange={setC('horarios')} /></div>
          <div><label className="label">Ciudad</label><input className="input" value={config.ciudad || ''} onChange={setC('ciudad')} /></div>
          <div><label className="label">Facebook</label><input className="input" value={config.facebook || ''} onChange={setC('facebook')} /></div>
          <div><label className="label">Instagram</label><input className="input" value={config.instagram || ''} onChange={setC('instagram')} /></div>
          <div className="sm:col-span-2"><label className="label">Título del hero</label><input className="input" value={config.hero_titulo || ''} onChange={setC('hero_titulo')} /></div>
          <div className="sm:col-span-2"><label className="label">Subtítulo del hero</label><textarea className="input" rows="2" value={config.hero_subtitulo || ''} onChange={setC('hero_subtitulo')} /></div>
          <div className="sm:col-span-2"><label className="label">Imagen del hero (URL)</label><input className="input" value={config.hero_imagen_url || ''} onChange={setC('hero_imagen_url')} /></div>
          <div className="sm:col-span-2"><label className="label">Mapa (código embed)</label><textarea className="input" rows="2" value={config.mapa_embed || ''} onChange={setC('mapa_embed')} /></div>
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            <div><label className="label">Color primario</label><input type="color" className="input h-11" value={config.color_primario || '#0ea5e9'} onChange={setC('color_primario')} /></div>
            <div><label className="label">Color secundario</label><input type="color" className="input h-11" value={config.color_secundario || '#14b8a6'} onChange={setC('color_secundario')} /></div>
          </div>
          <div className="sm:col-span-2 flex justify-end"><button className="btn-primary">Guardar configuración</button></div>
        </form>
      )}

      {tab === 'Galería' && (
        <div className="space-y-6">
          <form onSubmit={addImg} className="card p-5 grid sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2"><label className="label">URL de imagen *</label><input className="input" value={nuevaImg.imagen_url} onChange={(e) => setNuevaImg({ ...nuevaImg, imagen_url: e.target.value })} required /></div>
            <div><label className="label">Título</label><input className="input" value={nuevaImg.titulo} onChange={(e) => setNuevaImg({ ...nuevaImg, titulo: e.target.value })} /></div>
            <button className="btn-primary">+ Agregar</button>
          </form>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galeria.map((g) => (
              <div key={g.id} className="card overflow-hidden group relative">
                <img src={g.imagen_url} alt={g.titulo} className="h-40 w-full object-cover" />
                <button onClick={() => delImg(g.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-lg px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition">Eliminar</button>
                {g.titulo && <p className="p-2 text-sm">{g.titulo}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Testimonios' && (
        <div className="space-y-6">
          <form onSubmit={addTest} className="card p-5 grid sm:grid-cols-2 gap-3">
            <div><label className="label">Nombre *</label><input className="input" value={nuevoTest.nombre} onChange={(e) => setNuevoTest({ ...nuevoTest, nombre: e.target.value })} required /></div>
            <div><label className="label">Servicio</label><input className="input" value={nuevoTest.servicio} onChange={(e) => setNuevoTest({ ...nuevoTest, servicio: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Comentario *</label><textarea className="input" rows="2" value={nuevoTest.comentario} onChange={(e) => setNuevoTest({ ...nuevoTest, comentario: e.target.value })} required /></div>
            <div><label className="label">Calificación</label><select className="input" value={nuevoTest.calificacion} onChange={(e) => setNuevoTest({ ...nuevoTest, calificacion: e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrellas</option>)}</select></div>
            <div className="flex items-end"><button className="btn-primary">+ Agregar testimonio</button></div>
          </form>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonios.map((t) => (
              <div key={t.id} className="card p-5">
                <div className="text-amber-400 mb-2">{'★'.repeat(t.calificacion)}</div>
                <p className="text-sm text-slate-600 italic">"{t.comentario}"</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="font-semibold text-slate-800 text-sm">{t.nombre}</p>
                  <button onClick={() => delTest(t.id)} className="text-red-600 text-xs hover:underline">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'FAQs' && (
        <div className="space-y-6">
          <form onSubmit={addFaq} className="card p-5 space-y-3">
            <div><label className="label">Pregunta *</label><input className="input" value={nuevaFaq.pregunta} onChange={(e) => setNuevaFaq({ ...nuevaFaq, pregunta: e.target.value })} required /></div>
            <div><label className="label">Respuesta *</label><textarea className="input" rows="2" value={nuevaFaq.respuesta} onChange={(e) => setNuevaFaq({ ...nuevaFaq, respuesta: e.target.value })} required /></div>
            <div className="flex justify-end"><button className="btn-primary">+ Agregar pregunta</button></div>
          </form>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="card p-5 flex justify-between gap-4">
                <div><p className="font-semibold text-slate-800">{f.pregunta}</p><p className="text-sm text-slate-500 mt-1">{f.respuesta}</p></div>
                <button onClick={() => delFaq(f.id)} className="text-red-600 text-sm hover:underline whitespace-nowrap">Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
