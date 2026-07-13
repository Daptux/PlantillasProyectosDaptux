/* PREDIO360 · Utilidades de interfaz (formato, modal, toast, helpers) */
window.UI = (function () {
  const ic = (n, c) => window.ICONS.svg(n, c);

  /* ---------- Formato ---------- */
  const fmt = {
    money(n) {
      if (n == null) return '—';
      if (n >= 1e9) return '$' + (n / 1e9).toFixed(2).replace(/\.00$/, '') + ' B';
      if (n >= 1e6) return '$' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' M';
      return '$' + n.toLocaleString('es-CO');
    },
    moneyFull(n) { return n == null ? '—' : '$' + Number(n).toLocaleString('es-CO'); },
    area(n) { return n == null ? '—' : Number(n).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' m²'; },
    num(n) { return Number(n).toLocaleString('es-CO'); },
    date(s) {
      if (!s) return '—';
      const d = new Date(s + (s.length === 10 ? 'T00:00:00' : ''));
      if (isNaN(d)) return s;
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    initials(name) { return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); },
  };

  /* ---------- Mapeos de estado ---------- */
  const riesgoBadge = { bajo: 'green', medio: 'amber', alto: 'red' };
  const riesgoLabel = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' };
  const estadoBadge = { 'Activo': 'green', 'En estudio': 'amber', 'Archivado': 'gray', 'Abierto': 'red', 'En gestión': 'amber', 'Cerrado': 'green', 'Finalizada': 'green', 'Programada': 'blue', 'En trámite': 'amber' };
  const severidadBadge = { alto: 'red', medio: 'amber', bajo: 'blue' };
  const tipoHallazgoIc = { 'Jurídico': 'scale', 'Catastral': 'ruler', 'Urbanístico': 'building', 'Ambiental': 'leaf', 'Social': 'users' };
  const tipoActuacionIc = { 'Visita': 'pin', 'Concepto': 'fileText', 'Oficio': 'send', 'Resolución': 'gavel', 'Licencia': 'fileCheck', 'Seguimiento': 'activity' };

  function badge(text, tone, dot) {
    return `<span class="badge ${tone || 'gray'}">${dot ? '<span class="badge-dot"></span>' : ''}${text}</span>`;
  }
  function avatar(name, cls) { return `<div class="avatar ${cls || ''}">${fmt.initials(name)}</div>`; }

  function progress(val, tone) {
    const t = tone || (val >= 80 ? 'green' : val >= 50 ? '' : val >= 30 ? 'amber' : 'red');
    return `<div class="flex items-center gap-8"><div class="progress ${t}" style="flex:1"><i style="width:${val}%"></i></div><span class="cell-mut" style="width:34px;text-align:right">${val}%</span></div>`;
  }

  /* ---------- Modal ---------- */
  let modalEl;
  function modal({ title, subtitle, icon, size, body, footer, onOpen }) {
    close();
    modalEl = document.createElement('div');
    modalEl.className = 'modal-overlay';
    modalEl.innerHTML = `
      <div class="modal ${size || ''}" role="dialog" aria-modal="true">
        <div class="modal-head">
          ${icon ? `<div class="mh-ic">${ic(icon)}</div>` : ''}
          <div><h3>${title}</h3>${subtitle ? `<p>${subtitle}</p>` : ''}</div>
          <button class="icon-btn modal-close" aria-label="Cerrar">${ic('close')}</button>
        </div>
        <div class="modal-body">${body || ''}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
      </div>`;
    document.body.appendChild(modalEl);
    requestAnimationFrame(() => modalEl.classList.add('open'));
    modalEl.addEventListener('click', e => { if (e.target === modalEl) close(); });
    modalEl.querySelector('.modal-close').addEventListener('click', close);
    document.addEventListener('keydown', escClose);
    if (onOpen) onOpen(modalEl);
    return modalEl;
  }
  function escClose(e) { if (e.key === 'Escape') close(); }
  function close() {
    if (!modalEl) return;
    const el = modalEl; modalEl = null;
    el.classList.remove('open');
    document.removeEventListener('keydown', escClose);
    setTimeout(() => el.remove(), 220);
  }

  /* ---------- Toast ---------- */
  let toastWrap;
  function toast(title, msg, type = 'success') {
    if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; document.body.appendChild(toastWrap); }
    const icons = { success: 'checkCircle', warning: 'warning', error: 'alert', info: 'info' };
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<div class="t-ic">${ic(icons[type] || 'info')}</div><div class="flex-1"><b>${title}</b>${msg ? `<p>${msg}</p>` : ''}</div><button class="t-close icon-btn" style="width:26px;height:26px">${ic('close', 'icon-sm')}</button>`;
    toastWrap.appendChild(t);
    const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 250); };
    t.querySelector('.t-close').addEventListener('click', kill);
    setTimeout(kill, 4200);
  }

  /* ---------- Empty state ---------- */
  function empty(icon, title, sub) {
    return `<div class="empty">${ic(icon, 'icon-lg')}<h4>${title}</h4><p>${sub || ''}</p></div>`;
  }

  /* ---------- Foto placeholder (gradiente + icono) ---------- */
  function photoData(seed) {
    const grads = {
      poblado: ['#1E7DD1', '#0A2540'], bodega: ['#7E93A8', '#334155'], finca: ['#16A34A', '#065F46'],
      local: ['#2E9BE6', '#1667B2'], urbanizacion: ['#E8A317', '#B45309'], institucional: ['#7A5AF0', '#4C1D95'],
      lote: ['#16A9B8', '#0E7490'], edificio: ['#1667B2', '#071A2E'],
    };
    const g = grads[seed] || grads.poblado;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${g[0]}'/><stop offset='1' stop-color='${g[1]}'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><g fill='none' stroke='rgba(255,255,255,.5)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'><path d='M60 140V80l40-24 40 24v60'/><path d='M84 140v-30h32v30'/></g></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  return {
    ic, fmt, badge, avatar, progress, modal, closeModal: close, toast, empty, photoData,
    riesgoBadge, riesgoLabel, estadoBadge, severidadBadge, tipoHallazgoIc, tipoActuacionIc,
  };
})();
