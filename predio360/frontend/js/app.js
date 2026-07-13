/* PREDIO360 · Aplicación (shell + router + eventos globales) */
window.APP = (function () {
  const { ic } = UI;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'predios', label: 'Predios', icon: 'building' },
    { id: 'mapa', label: 'Mapa', icon: 'map' },
    { id: 'juridico', label: 'Jurídico', icon: 'scale' },
    { id: 'catastral', label: 'Catastral', icon: 'ruler' },
    { id: 'urbanistico', label: 'Urbanístico', icon: 'building' },
    { id: 'documental', label: 'Documentos', icon: 'folder' },
    { id: 'hallazgos', label: 'Hallazgos', icon: 'alert', badge: '37' },
    { id: 'actuaciones', label: 'Actuaciones', icon: 'activity' },
    { id: 'reportes', label: 'Reportes', icon: 'fileText' },
    { id: 'ia', label: 'Inteligencia Artificial', icon: 'sparkles' },
    { id: 'usuarios', label: 'Usuarios', icon: 'users' },
    { id: 'configuracion', label: 'Configuración', icon: 'settings' },
  ];

  const TITLES = {
    dashboard: 'Dashboard', predios: 'Predios', mapa: 'Mapa', juridico: 'Jurídico',
    catastral: 'Catastral', urbanistico: 'Urbanístico', documental: 'Documentos',
    hallazgos: 'Hallazgos', actuaciones: 'Actuaciones', reportes: 'Reportes',
    ia: 'Inteligencia Artificial', usuarios: 'Usuarios', configuracion: 'Configuración',
  };

  function renderShell() {
    const navHtml = NAV.map(it =>
      `<a class="nav-item" href="#/${it.id}" data-route="${it.id}">${ic(it.icon)}<span>${it.label}</span>${it.badge ? `<span class="nav-badge">${it.badge}</span>` : ''}</a>`).join('');

    document.getElementById('app').innerHTML = `
      <div class="sidebar-backdrop" id="backdrop"></div>
      <aside class="sidebar">
        <div class="sidebar-head">
          <img class="logo-mark" src="assets/logo-mark.svg" alt="Predio360">
          <div class="sidebar-brand"><b>Predio360</b><small>Gestión Integral Predial</small></div>
        </div>
        <nav class="sidebar-nav">${navHtml}</nav>
        <div class="sidebar-foot">
          <div class="side-user">
            <div class="avatar green">SO</div>
            <div class="su-meta"><b>Santiago Orduz</b><small>Administrador</small></div>
          </div>
          <a class="side-logout" id="btnLogout">${ic('logout')}<span>Cerrar sesión</span></a>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <button class="icon-btn menu-toggle" id="btnMenu" aria-label="Menú">${ic('menu')}</button>
          <button class="icon-btn collapse-toggle" id="btnCollapse" aria-label="Contraer">${ic('panelLeft')}</button>
          <div class="topbar-title" id="topbarTitle">Dashboard</div>
          <div class="searchbar">
            ${ic('search', 'icon-sm')}
            <input id="globalSearch" placeholder="Buscar predio (matrícula, catastral, dirección...)">
            <kbd>Ctrl K</kbd>
          </div>
          <button class="icon-btn" id="btnTheme" aria-label="Tema">${ic('moon')}</button>
          <button class="icon-btn" id="btnHelp" aria-label="Ayuda">${ic('help')}</button>
          <div style="position:relative">
            <button class="icon-btn" id="btnBell" aria-label="Notificaciones">${ic('bell')}<span class="dot">${DB.notificaciones.length}</span></button>
            <div class="dropdown" id="ddBell">
              <div class="dropdown-head flex items-center justify-between"><b>Notificaciones</b><span class="badge blue">${DB.notificaciones.length} nuevas</span></div>
              <div style="max-height:340px;overflow:auto">
                ${DB.notificaciones.map(n => `<div class="notif-item"><div class="tint sm ${n.tone}">${ic(n.ic, 'icon-sm')}</div><div><p>${n.texto}</p><time>${n.hace}</time></div></div>`).join('')}
              </div>
              <div class="dropdown-item text-c" style="justify-content:center;color:var(--c-primary)">Ver todas</div>
            </div>
          </div>
          <div style="position:relative">
            <button class="user-chip" id="btnUser"><div class="avatar green">SO</div>${ic('chevronDown', 'icon-sm')}</button>
            <div class="dropdown" id="ddUser">
              <div class="dropdown-head flex items-center gap-12"><div class="avatar green">SO</div><div><b>Santiago Orduz</b><div class="text-mut" style="font-size:12px">Administrador</div></div></div>
              <div class="dropdown-item">${ic('user','icon-sm')}Mi perfil</div>
              <div class="dropdown-item" data-nav="configuracion">${ic('settings','icon-sm')}Configuración</div>
              <div class="dropdown-item" data-nav="usuarios">${ic('users','icon-sm')}Equipo y roles</div>
              <div class="dropdown-sep"></div>
              <div class="dropdown-item danger">${ic('logout','icon-sm')}Cerrar sesión</div>
            </div>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>`;

    bindShell();
  }

  function bindShell() {
    const app = document.getElementById('app');
    document.getElementById('btnCollapse').addEventListener('click', () => app.classList.toggle('sidebar-collapsed'));
    document.getElementById('btnMenu').addEventListener('click', () => app.classList.toggle('sidebar-open'));
    document.getElementById('backdrop').addEventListener('click', () => app.classList.remove('sidebar-open'));
    document.getElementById('btnTheme').addEventListener('click', toggleTheme);
    document.getElementById('btnHelp').addEventListener('click', () => UI.toast('Centro de ayuda', 'Documentación disponible en el README del proyecto.', 'info'));
    document.getElementById('btnLogout').addEventListener('click', () => UI.toast('Sesión', 'Cierre de sesión (demo).', 'info'));

    setupDropdown('btnBell', 'ddBell');
    setupDropdown('btnUser', 'ddUser');
    document.querySelector('#ddUser .danger').addEventListener('click', () => UI.toast('Sesión', 'Cierre de sesión (demo).', 'info'));

    const gs = document.getElementById('globalSearch');
    gs.addEventListener('keydown', e => {
      if (e.key === 'Enter' && gs.value.trim()) {
        const q = gs.value.toLowerCase();
        const hit = DB.predios.find(p => (p.nombre + p.matricula + p.direccion + p.cedulaCatastral).toLowerCase().includes(q));
        if (hit) { location.hash = '#/predios/' + hit.id; gs.value = ''; }
        else UI.toast('Sin resultados', 'No se encontraron predios para "' + gs.value + '"', 'warning');
      }
    });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); gs.focus(); }
    });

    document.addEventListener('click', e => {
      const nav = e.target.closest('[data-nav]');
      if (nav) { location.hash = '#/' + nav.dataset.nav.replace(/^#?\/?/, ''); document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open')); }
      const act = e.target.closest('[data-act]');
      if (act) handleAction(act.dataset.act);
    });
  }

  function handleAction(a) {
    switch (a) {
      case 'nuevo-predio':
      case 'import': VIEWS.openNuevoPredio(() => { if (location.hash.replace(/^#\/?/, '').split('/')[0] === 'predios' && !location.hash.split('/')[2]) navigate(); }); break;
      case 'export-dash': UI.toast('Exportando', 'El dashboard se está exportando a PDF.', 'info'); break;
    }
  }

  function setupDropdown(btnId, ddId) {
    const btn = document.getElementById(btnId), dd = document.getElementById(ddId);
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown.open').forEach(d => { if (d !== dd) d.classList.remove('open'); });
      dd.classList.toggle('open');
    });
    dd.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => dd.classList.remove('open'));
  }

  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    document.getElementById('btnTheme').innerHTML = ic(dark ? 'moon' : 'sun');
    try { localStorage.setItem('predio-theme', dark ? 'light' : 'dark'); } catch (e) {}
  }

  /* ---------- Router ---------- */
  function navigate() {
    const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [route, param] = hash.split('/');
    const content = document.getElementById('content');

    VIEWS.destroyCharts();
    const activeRoute = (route === 'predios' && param && param !== 'nuevo') ? 'predios' : route;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.route === activeRoute));
    document.getElementById('app').classList.remove('sidebar-open');
    document.getElementById('topbarTitle').textContent =
      (route === 'predios' && param && param !== 'nuevo') ? 'Ficha del predio' : (TITLES[route] || 'Dashboard');

    let view;
    if (route === 'predios' && param && param !== 'nuevo') view = VIEWS.expediente(param);
    else if (route === 'predios' && param === 'nuevo') view = VIEWS.map.predios();
    else if (route === 'mapa') view = VIEWS.map.gis();
    else if (VIEWS.map[route]) view = VIEWS.map[route]();
    else view = VIEWS.map.dashboard();

    content.innerHTML = view.html;
    content.scrollTop = 0;
    if (view.init) view.init();
    if (route === 'predios' && param === 'nuevo') setTimeout(() => VIEWS.openNuevoPredio(() => { location.hash = '#/predios'; }), 100);
  }

  function init() {
    try { const t = localStorage.getItem('predio-theme'); if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) {}
    renderShell();
    if (document.documentElement.getAttribute('data-theme') === 'dark') document.getElementById('btnTheme').innerHTML = ic('sun');
    window.addEventListener('hashchange', navigate);
    navigate();
    if (API.isMock()) console.info('%cPredio360', 'color:#16A34A;font-weight:700', 'ejecutando con datos de demostración (mock). Configura Supabase/Backend en js/config.js');
  }

  return { init, navigate };
})();

document.addEventListener('DOMContentLoaded', window.APP.init);
