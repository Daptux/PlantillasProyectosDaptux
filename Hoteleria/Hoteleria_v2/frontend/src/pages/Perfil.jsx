import { useEffect, useState } from 'react';
import { obtenerPerfil, actualizarPerfil } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getError, formatFecha } from '../utils/helpers';
import Alert from '../components/Alert';
import EyeIcon from '../components/EyeIcon';

const VACIO = { nombre: '', apellido: '', email: '', telefono: '', documento: '' };

export default function Perfil() {
  const { usuario, actualizarUsuarioLocal } = useAuth();
  const esCliente = usuario.rol === 'CLIENTE';

  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Contraseña
  const [editandoPass, setEditandoPass] = useState(false);
  const [nuevaPass, setNuevaPass] = useState('');
  const [verPass, setVerPass] = useState(false);

  useEffect(() => {
    obtenerPerfil()
      .then((p) => {
        setPerfil(p);
        setForm({
          nombre: p.nombre || '',
          apellido: p.apellido || '',
          email: p.email || '',
          telefono: p.telefono || '',
          documento: p.documento || ''
        });
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setCargando(false));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setError(''); setOk('');

    const payload = { ...form };
    if (editandoPass && nuevaPass) payload.password = nuevaPass;

    setGuardando(true);
    try {
      const res = await actualizarPerfil(payload);
      // Refresca el usuario en el navbar/localStorage
      actualizarUsuarioLocal({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email
      });
      setPerfil(res.usuario);
      setOk(nuevaPass ? 'Datos y contraseña actualizados correctamente' : 'Datos actualizados correctamente');
      setEditandoPass(false);
      setNuevaPass('');
      setVerPass(false);
    } catch (err) {
      setError(getError(err));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="loading">Cargando perfil...</div>;
  if (!perfil) return <Alert error={error} />;

  return (
    <div>
      <div className="page-header">
        <h2>Mi perfil</h2>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <Alert error={error} success={ok} />

        <form onSubmit={guardar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input className="input" name="nombre" value={form.nombre} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input className="input" name="apellido" value={form.apellido} onChange={onChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input className="input" name="telefono" value={form.telefono} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Documento</label>
              <input className="input" name="documento" value={form.documento} onChange={onChange} />
            </div>
          </div>

          {/* Rol y cargo solo para personal (no para clientes) */}
          {!esCliente && (
            <div className="form-row">
              <div className="form-group">
                <label>Rol</label>
                <input className="input" value={perfil.rol} disabled />
              </div>
              <div className="form-group">
                <label>Cargo</label>
                <input className="input" value={perfil.cargo || '-'} disabled />
              </div>
            </div>
          )}

          {/* Contraseña */}
          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {!editandoPass ? (
                <>
                  <input
                    className="input"
                    type="text"
                    value="••••••••"
                    disabled
                    readOnly
                  />
                  <button type="button" className="btn btn-light btn-sm" title="Cambiar contraseña"
                    onClick={() => setEditandoPass(true)}>
                    ✏️
                  </button>
                </>
              ) : (
                <>
                  <input
                    className="input"
                    type={verPass ? 'text' : 'password'}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    value={nuevaPass}
                    onChange={(e) => setNuevaPass(e.target.value)}
                  />
                  <button type="button" className="btn btn-light btn-sm" title={verPass ? 'Ocultar' : 'Ver'}
                    onClick={() => setVerPass(!verPass)}>
                    <EyeIcon open={verPass} />
                  </button>
                  <button type="button" className="btn btn-light btn-sm" title="Cancelar"
                    onClick={() => { setEditandoPass(false); setNuevaPass(''); setVerPass(false); }}>
                    ✖
                  </button>
                </>
              )}
            </div>
            {!editandoPass && (
              <small className="muted" style={{ display: 'block', marginTop: 6 }}>
                Usa ✏️ para cambiar tu contraseña.
              </small>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small className="muted">Registrado: {formatFecha(perfil.fecha_creacion)}</small>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
