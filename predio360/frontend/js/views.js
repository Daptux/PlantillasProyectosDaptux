/* PREDIO360 · Vistas de módulos
   Cada vista devuelve { html, init? }. init() se ejecuta tras montar el DOM. */
window.VIEWS = (function () {
  const { ic, fmt, badge, avatar, progress, modal, closeModal, toast, empty, photoData } = UI;
  const CHARTS = [];
  function destroyCharts() { while (CHARTS.length) { try { CHARTS.pop().destroy(); } catch (e) {} } }

  const CB = { primary: '#2563EB', blue: '#2563EB', light: '#60A5FA', green: '#16A34A', amber: '#D97706', red: '#DC2626', teal: '#0EA5A6', violet: '#7C5CE0', navy: '#1E293B', grid: 'rgba(148,163,184,.16)' };
  const chartFont = { family: "'Inter', sans-serif", size: 12 };

  function pageHead(crumb, title, sub, actions) {
    const last = crumb.length - 1;
    return `<div class="page-head fade-in">
      <div class="ph-text">
        <div class="breadcrumb">${ic('home', 'icon-sm')}${crumb.map((c, i) => `<span class="${i < last ? 'bc-link' : ''}">${c}</span>`).join(ic('chevronRight', 'icon-sm'))}</div>
        <h1 class="page-title">${title}</h1>
        ${sub ? `<p class="page-sub">${sub}</p>` : ''}
      </div>
      ${actions ? `<div class="ph-actions">${actions}</div>` : ''}
    </div>`;
  }

  const estadoSemaforo = { bajo: { c: 'green', l: 'Verde', r: 'Riesgo bajo', d: 'Información completa y coherente' },
    medio: { c: 'amber', l: 'Amarillo', r: 'Riesgo medio', d: 'Requiere revisión o conciliación' },
    alto: { c: 'red', l: 'Rojo', r: 'Riesgo alto', d: 'Atención jurídica prioritaria' } };

  /* =====================================================================
     DASHBOARD
     ===================================================================== */
  function dashboard() {
    const kpis = DB.kpis.map(k => `
      <div class="kpi">
        <div class="kpi-top">
          <div class="kpi-ic ${k.tone}">${ic(k.ic)}</div>
          <span class="kpi-trend ${k.dir}">${ic(k.dir === 'up' ? 'trendUp' : 'trendDown', 'icon-sm')}${k.trend}</span>
        </div>
        <div class="kpi-val">${k.val}</div>
        <div class="kpi-label">${k.label}</div>
      </div>`).join('');

    const actividad = DB.actividad.map(a => `
      <div class="tl-item"><div class="tl-ic kpi-ic ${a.tone}">${ic(a.ic, 'icon-sm')}</div>
        <div class="tl-body"><p>${a.texto}</p><time>${a.hace}</time></div></div>`).join('');

    const semaforo = [
      { t: 'green', n: DB.charts.porRiesgo.data[0], l: 'Riesgo bajo' },
      { t: 'amber', n: DB.charts.porRiesgo.data[1], l: 'Riesgo medio' },
      { t: 'red', n: DB.charts.porRiesgo.data[2], l: 'Riesgo alto' },
    ].map(s => `<div class="semaforo-row"><span class="light ${s.t}"></span>
        <div class="s-meta"><b>${s.n}%</b><span>${s.l}</span></div>
        <div class="progress ${s.t}" style="width:90px"><i style="width:${s.n}%"></i></div></div>`).join('');

    const html = pageHead(['Inicio', 'Dashboard'], 'Dashboard Ejecutivo',
      'Panorama integral de la gestión predial en tiempo real',
      `<button class="btn btn-ghost" data-act="export-dash">${ic('download')}Exportar</button>
       <button class="btn btn-primary" data-nav="predios/nuevo">${ic('plus')}Nuevo predio</button>`)
      + `<div class="grid grid-kpi">${kpis}</div>

      <div class="grid dash-cols mt-16">
        <div class="card card-tight">
          <div class="card-head"><div><h3>Registro de predios</h3><span class="ch-sub">Acumulado mensual · 2026</span></div></div>
          <div class="card-body"><div class="chart-box" style="height:280px"><canvas id="chPredios"></canvas></div></div>
        </div>
        <div class="card card-tight">
          <div class="card-head"><div><h3>Distribución por uso</h3></div></div>
          <div class="card-body"><div class="chart-box" style="height:180px"><canvas id="chUso"></canvas></div>
            <div class="stat-list mt-16" id="usoLegend"></div></div>
        </div>
      </div>

      <div class="grid dash-cols mt-16">
        <div class="card card-tight">
          <div class="card-head"><div><h3>Hallazgos · nuevos vs. cerrados</h3></div>
            <div class="ch-actions"><span class="badge blue"><span class="badge-dot"></span>Nuevos</span><span class="badge green"><span class="badge-dot"></span>Cerrados</span></div></div>
          <div class="card-body"><div class="chart-box" style="height:240px"><canvas id="chHallazgos"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3>Semáforo de riesgos</h3></div></div>
          <div class="card-body"><div class="semaforo">${semaforo}</div>
            <button class="btn btn-soft mt-16" style="width:100%" data-nav="hallazgos">${ic('alert')}Ver hallazgos</button></div>
        </div>
      </div>

      <div class="grid dash-cols mt-16">
        <div class="card card-tight">
          <div class="card-head"><div><h3>Mapa de predios</h3></div>
            <div class="ch-actions"><button class="btn btn-ghost btn-sm" data-nav="mapa">${ic('map', 'icon-sm')}Abrir mapa</button></div></div>
          <div class="card-body"><div id="map-mini" style="height:280px"></div></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3>Actividad reciente</h3></div></div>
          <div class="card-body"><div class="timeline">${actividad}</div></div>
        </div>
      </div>`;

    return { html, init() { initCharts(); initMiniMap(); } };
  }

  function initCharts() {
    if (!window.Chart) return;
    const gopt = { plugins: { legend: { display: false } }, maintainAspectRatio: false, responsive: true };
    const c1 = document.getElementById('chPredios');
    if (c1) {
      const g = c1.getContext('2d').createLinearGradient(0, 0, 0, 280);
      g.addColorStop(0, 'rgba(37,99,235,.24)'); g.addColorStop(1, 'rgba(37,99,235,0)');
      CHARTS.push(new Chart(c1, { type: 'line',
        data: { labels: DB.charts.prediosPorMes.labels, datasets: [{ data: DB.charts.prediosPorMes.data, borderColor: CB.primary, backgroundColor: g, fill: true, tension: .4, borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: CB.primary, pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 }] },
        options: { ...gopt, scales: { x: { grid: { display: false }, ticks: { font: chartFont } }, y: { grid: { color: CB.grid }, ticks: { font: chartFont } } } } }));
    }
    const c2 = document.getElementById('chUso');
    if (c2) {
      const colors = [CB.primary, CB.light, CB.amber, CB.violet, CB.teal, CB.green];
      CHARTS.push(new Chart(c2, { type: 'doughnut',
        data: { labels: DB.charts.porUso.labels, datasets: [{ data: DB.charts.porUso.data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
        options: { ...gopt, cutout: '70%' } }));
      const tot = DB.charts.porUso.data.reduce((a, b) => a + b, 0);
      document.getElementById('usoLegend').innerHTML = DB.charts.porUso.labels.map((l, i) =>
        `<div><span class="stat-dot" style="background:${colors[i]}"></span><span class="s-name">${l}</span><span class="s-val">${DB.charts.porUso.data[i]}</span><span class="s-pct">${Math.round(DB.charts.porUso.data[i] / tot * 100)}%</span></div>`).join('');
    }
    const c3 = document.getElementById('chHallazgos');
    if (c3) CHARTS.push(new Chart(c3, { type: 'bar',
      data: { labels: DB.charts.prediosPorMes.labels, datasets: [
        { label: 'Nuevos', data: DB.charts.hallazgosPorMes.nuevos, backgroundColor: CB.light, borderRadius: 6, maxBarThickness: 16 },
        { label: 'Cerrados', data: DB.charts.hallazgosPorMes.cerrados, backgroundColor: CB.green, borderRadius: 6, maxBarThickness: 16 } ] },
      options: { ...gopt, scales: { x: { grid: { display: false }, ticks: { font: chartFont } }, y: { grid: { color: CB.grid }, ticks: { font: chartFont } } } } }));
  }

  function initMiniMap(coords, zoom) {
    const el = document.getElementById('map-mini');
    if (!el || !window.L) return;
    const map = L.map(el, { zoomControl: false, attributionControl: false }).setView(coords || window.PREDIO_CONFIG.MAPA_CENTRO, zoom || 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    DB.predios.forEach(p => {
      const col = { bajo: CB.green, medio: CB.amber, alto: CB.red }[p.riesgo];
      L.circleMarker([p.lat, p.lng], { radius: 7, color: '#fff', weight: 2, fillColor: col, fillOpacity: .95 })
        .addTo(map).bindPopup(`<b>${p.nombre}</b><br>${p.direccion}`);
    });
    setTimeout(() => map.invalidateSize(), 180);
  }

  /* =====================================================================
     PREDIOS (listado)
     ===================================================================== */
  function predios() {
    const html = pageHead(['Inicio', 'Predios'], 'Gestión de Predios',
      'Inventario de bienes inmuebles y sus expedientes digitales',
      `<button class="btn btn-ghost" data-act="import">${ic('upload')}Importar</button>
       <button class="btn btn-primary" data-act="nuevo-predio">${ic('plus')}Registrar predio</button>`)
      + `<div class="card">
          <div class="card-body" style="padding-bottom:0">
            <div class="toolbar">
              <div class="search-mini">${ic('search', 'icon-sm')}<input id="predioSearch" placeholder="Buscar por nombre, matrícula, dirección..."></div>
              <select class="select" id="fMunicipio"><option value="">Todos los municipios</option>${DB.municipios.map(m => `<option>${m}</option>`).join('')}</select>
              <select class="select" id="fRiesgo"><option value="">Todo riesgo</option><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select>
              <select class="select" id="fEstado"><option value="">Todo estado</option><option>Activo</option><option>En estudio</option><option>Archivado</option></select>
            </div>
          </div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Predio</th><th>Matrícula</th><th>Municipio</th><th>Uso</th><th>Área terreno</th><th>Avalúo comercial</th><th>Riesgo</th><th>Avance</th><th>Estado</th><th></th></tr></thead>
            <tbody id="predioRows"></tbody>
          </table></div>
        </div>`;

    function rowsHtml(list) {
      if (!list.length) return `<tr><td colspan="10">${empty('search', 'Sin resultados', 'Ajusta los filtros de búsqueda')}</td></tr>`;
      return list.map(p => `
        <tr data-predio="${p.id}">
          <td><div class="flex items-center gap-12">
            <img src="${photoData(p.foto)}" style="width:38px;height:38px;border-radius:9px;object-fit:cover" alt="">
            <div><div class="cell-strong">${p.nombre}</div><div class="cell-mut">${p.id} · ${p.barrio}</div></div></div></td>
          <td><span class="cell-id">${p.matricula}</span></td>
          <td>${p.municipio}</td>
          <td>${badge(p.uso, 'blue')}</td>
          <td class="cell-strong">${fmt.area(p.areaTerrenoCat)}</td>
          <td class="cell-strong">${fmt.money(p.avaluoComercial)}</td>
          <td>${badge(UI.riesgoLabel[p.riesgo], UI.riesgoBadge[p.riesgo], true)}</td>
          <td style="min-width:120px">${progress(p.avance)}</td>
          <td>${badge(p.estado, UI.estadoBadge[p.estado] || 'gray')}</td>
          <td><div class="cell-actions"><button class="icon-btn" style="width:30px;height:30px" title="Abrir expediente">${ic('chevronRight', 'icon-sm')}</button></div></td>
        </tr>`).join('');
    }

    return {
      html,
      init() {
        const tbody = document.getElementById('predioRows');
        const render = () => {
          const q = (document.getElementById('predioSearch').value || '').toLowerCase();
          const mu = document.getElementById('fMunicipio').value;
          const ri = document.getElementById('fRiesgo').value;
          const es = document.getElementById('fEstado').value;
          tbody.innerHTML = rowsHtml(DB.predios.filter(p =>
            (!q || (p.nombre + p.matricula + p.direccion + p.id).toLowerCase().includes(q)) &&
            (!mu || p.municipio === mu) && (!ri || p.riesgo === ri) && (!es || p.estado === es)));
        };
        render();
        ['predioSearch', 'fMunicipio', 'fRiesgo', 'fEstado'].forEach(id =>
          document.getElementById(id).addEventListener(id === 'predioSearch' ? 'input' : 'change', render));
        tbody.addEventListener('click', e => { const tr = e.target.closest('tr[data-predio]'); if (tr) location.hash = '#/predios/' + tr.dataset.predio; });
        document.querySelectorAll('[data-act="nuevo-predio"],[data-act="import"]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); openNuevoPredio(() => window.APP.navigate()); }));
      },
    };
  }

  /* =====================================================================
     EXPEDIENTE (ficha del predio)
     ===================================================================== */
  function expediente(id) {
    const p = DB.predioById(id);
    if (!p) return { html: pageHead(['Predios', 'No encontrado'], 'Predio no encontrado', '') + empty('search', 'Este predio no existe', 'Verifica el identificador') };
    const docs = DB.documentos.filter(d => d.predio === p.id);
    const halls = DB.hallazgos.filter(h => h.predio === p.id);
    const acts = DB.actuaciones.filter(a => a.predio === p.id);
    const sem = estadoSemaforo[p.riesgo];
    const io = p.areaTerrenoCat ? (p.areaConstruidaCat / p.areaTerrenoCat).toFixed(2) : '—';
    const difArea = Math.abs(p.areaTerrenoJur - p.areaTerrenoCat);
    const difPct = p.areaTerrenoJur ? (difArea / p.areaTerrenoJur * 100).toFixed(2) : '0';

    const metaItems = [
      ['scale', 'Matrícula Inmobiliaria', p.matricula],
      ['coins', 'Destino', p.destino],
      ['ruler', 'Cédula Catastral', p.cedulaCatastral],
      ['building', 'Uso actual', p.uso],
      ['pin', 'Dirección', p.direccion + ', ' + p.municipio],
      ['calendar', 'Última actualización', '28/05/2025'],
      ['grid', 'Área jurídica', fmt.area(p.areaTerrenoJur)],
      ['layers', 'Área catastral', fmt.area(p.areaTerrenoCat)],
    ].map(m => `<div class="fm">${ic(m[0], 'icon-sm')}<span class="fm-label">${m[1]}</span><span class="fm-val">${m[2]}</span></div>`).join('');

    const stats = [
      { ic: 'building', tone: 'blue', label: 'Total predios', val: '128' },
      { ic: 'fileCheck', tone: 'green', label: 'Con matrícula', val: '96' },
      { ic: 'fileText', tone: 'amber', label: 'Sin matrícula', val: '32' },
      { ic: 'alert', tone: 'red', label: 'Con inconsistencias', val: '14' },
      { ic: 'eye', tone: 'violet', label: 'En revisión', val: '8' },
    ].map(s => `<div class="stat-card" data-nav="predios"><div class="tint ${s.tone}">${ic(s.ic)}</div>
        <div class="sc-body"><div class="sc-label">${s.label}</div><div class="sc-val">${s.val}</div>
        <span class="sc-link">Ver todos ${ic('chevronRight', 'icon-sm')}</span></div></div>`).join('');

    const tabs = [
      { id: 'resumen', label: 'Resumen', ic: 'grid' },
      { id: 'juridico', label: 'Jurídico', ic: 'scale' },
      { id: 'catastral', label: 'Catastral', ic: 'ruler' },
      { id: 'urbanistico', label: 'Urbanístico', ic: 'building' },
      { id: 'documental', label: 'Documentos', ic: 'folder', count: docs.length },
      { id: 'actuaciones', label: 'Actuaciones', ic: 'activity', count: acts.length },
      { id: 'historial', label: 'Historial', ic: 'clock' },
    ];
    const tabBtns = tabs.map((t, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${t.id}">${ic(t.ic, 'icon-sm')}${t.label}${t.count != null ? `<span class="tab-count">${t.count}</span>` : ''}</button>`).join('');

    const docsRecientes = docs.slice(0, 4).map(d => `
      <div class="doc-row"><div class="doc-badge ${d.tipo}">${d.tipo.toUpperCase()}</div>
        <div style="min-width:0;flex:1"><div class="dr-name">${d.nombre}</div><div class="dr-meta">${fmt.date(d.fecha)} · ${d.origen}</div></div>
        ${ic('download', 'icon-sm')}</div>`).join('') || `<p class="text-mut" style="font-size:13px;padding:8px 0">Sin documentos.</p>`;

    const html = pageHead(['Predios', 'Ficha del predio'], p.nombre, '',
      `<button class="btn btn-ghost" data-nav="predios">${ic('chevronLeft')}Volver</button>`).replace('<h1 class="page-title">' + p.nombre + '</h1>', '')
      + `<div class="ficha-top fade-in">
          <div class="card"><div class="card-body">
            <div class="ficha-header">
              <img class="ficha-photo" src="${photoData(p.foto)}" alt="">
              <div style="flex:1;min-width:0">
                <div class="ficha-title-row">
                  <h2>${p.nombre}</h2>
                  <span class="badge ${sem.c}"><span class="badge-dot"></span>Estado: ${sem.l}</span>
                  <div class="fh-actions">
                    <button class="btn btn-ghost btn-sm" data-act="reporte-predio">${ic('edit', 'icon-sm')}Editar predio</button>
                    <button class="icon-btn" style="width:32px;height:32px" data-act="ia-predio" title="Analizar con IA">${ic('moreH', 'icon-sm')}</button>
                  </div>
                </div>
                <div class="ficha-meta">${metaItems}</div>
              </div>
            </div>
          </div></div>
          <div class="card"><div class="card-body">
            <h3 style="font-size:14.5px;font-weight:700">Semáforo del predio</h3>
            <div class="semaforo-card" style="margin-top:16px"><span class="semaforo-dot ${sem.c}"></span>
              <div class="sf-txt"><b>${sem.r}</b><span>${sem.d}</span></div></div>
            <div class="mt-16" style="display:flex;gap:8px">
              <button class="btn btn-soft btn-sm" style="flex:1" data-act="ia-predio">${ic('sparkles', 'icon-sm')}Analizar IA</button>
              <button class="btn btn-ghost btn-sm" style="flex:1" data-act="reporte-predio">${ic('fileText', 'icon-sm')}Ficha</button>
            </div>
          </div></div>
        </div>

        <div class="grid grid-5 mt-16">${stats}</div>

        <div class="ficha-body mt-16">
          <div>
            <div class="tabs">${tabBtns}</div>
            <div id="tabContent"></div>
          </div>
          <div class="right-rail">
            <div class="card"><div class="card-head"><div><h3>Localización del predio</h3></div>
              <div class="ch-actions"><span class="cell-mut mono" style="font-size:11px">${p.lat}, ${p.lng}</span></div></div>
              <div class="card-body" style="padding:12px"><div id="map-mini" style="height:220px"></div></div></div>
            <div class="card"><div class="card-head"><div><h3>Documentos recientes</h3></div>
              <div class="ch-actions"><a class="card-link" data-tab-go="documental">Ver todos</a></div></div>
              <div class="card-body" style="padding:6px 18px 14px"><div class="docs-recent">${docsRecientes}</div></div></div>
          </div>
        </div>`;

    /* ---- pestañas ---- */
    function infoCard(title, icon, tone, rows) {
      return `<div class="card info-card"><div class="card-head"><div class="ic-title"><span class="tint sm ${tone}">${ic(icon, 'icon-sm')}</span>${title}</div></div>
        <div class="info-rows">${rows.map(r => `<div class="ir"><span class="ir-k">${r[0]}</span><span class="ir-v ${r[2] || ''}">${r[1]}</span></div>`).join('')}</div></div>`;
    }

    function tabResumen() {
      const juri = infoCard('Información Jurídica', 'scale', 'blue', [
        ['Matrícula inmobiliaria', p.matricula], ['Propietario', p.propietario], ['Naturaleza jurídica', p.naturaleza],
        ['Escritura de adquisición', p.escritura.split(' - ')[0]], ['Gravámenes', p.gravamenes ? p.gravamenes + ' vigente(s)' : 'No registra'],
        ['Tradición', 'Ver tradición completa', 'link'],
        ['Estado jurídico', `<span class="badge ${p.estadoJuridico === 'Sano' ? 'green' : p.estadoJuridico === 'En litigio' ? 'red' : 'amber'}">${p.estadoJuridico}</span>`],
      ]);
      const cata = infoCard('Información Catastral', 'ruler', 'green', [
        ['Cédula catastral', `<span class="mono" style="font-size:12px">${p.cedulaCatastral}</span>`], ['Área de terreno', fmt.area(p.areaTerrenoCat)],
        ['Área construida', fmt.area(p.areaConstruidaCat)], ['Avalúo catastral', fmt.moneyFull(p.avaluoCatastral)],
        ['Destino económico', p.destino],
        ['Diferencia de áreas', `${difArea.toFixed(2)} m² (${difPct}%) <span class="badge ${difArea > p.areaTerrenoJur * 0.02 ? 'amber' : 'green'}" style="margin-left:4px">${difArea > p.areaTerrenoJur * 0.02 ? 'Revisar' : 'Aceptable'}</span>`],
      ]);
      const urba = infoCard('Información Urbanística', 'building', 'violet', [
        ['Uso del suelo', p.uso], ['Tratamiento', p.tratamiento], ['Norma POT aplicable', 'Acuerdo 287 de 2015'],
        ['Afectaciones', p.riesgo === 'alto' ? 'Vialidad, Ronda hídrica' : 'No registra'],
        ['Riesgo', p.riesgo === 'alto' ? 'Inundación media' : 'Inundación baja'],
        ['Compatibilidad uso', '<span class="badge green">Compatible</span>'],
      ]);

      const hallList = (halls.length ? halls : DB.hallazgos.slice(0, 3)).slice(0, 3).map(h =>
        `<div class="ml-row"><span class="ml-bullet"></span><span>${h.titulo}</span></div>`).join('');
      const recs = ['Realizar actualización catastral cuando se realicen modificaciones.', 'Verificar periódicamente el estado de la ronda hídrica.', 'Mantener documentación jurídica actualizada.']
        .map(r => `<div class="ml-row"><span class="ml-mark rec-check">${ic('checkCircle', 'icon-sm')}</span><span>${r}</span></div>`).join('');
      const actList = (acts.length ? acts : DB.actuaciones.slice(0, 3)).slice(0, 3).map(a =>
        `<div class="act-row"><div class="ar-top"><span class="ar-date">${fmt.date(a.fecha)}</span><span>${a.titulo}</span></div><span class="ar-author">${a.responsable}</span></div>`).join('');

      return `<div class="grid grid-3">${juri}${cata}${urba}</div>
        <div class="grid grid-3 mt-16">
          <div class="card"><div class="card-head"><div><h3>Hallazgos principales</h3></div></div>
            <div class="card-body"><div class="mini-list">${hallList}</div>
              <a class="card-link" data-tab-go="juridico" style="display:inline-block;margin-top:14px">Ver todos los hallazgos</a></div></div>
          <div class="card"><div class="card-head"><div><h3>Recomendaciones</h3></div></div>
            <div class="card-body"><div class="mini-list">${recs}</div></div></div>
          <div class="card"><div class="card-head"><div><h3>Últimas actuaciones</h3></div>
            <div class="ch-actions"><a class="card-link" data-tab-go="actuaciones">Ver todas</a></div></div>
            <div class="card-body" style="padding:6px 18px 14px">${actList}</div></div>
        </div>`;
    }

    function tabJuridico() {
      const trad = DB.tradicion.map(t => `<tr><td class="cell-strong">${t.anio}</td><td>${badge(t.acto, 'blue')}</td><td class="cell-mut">${t.de}</td><td class="cell-strong">${t.a}</td><td class="mono cell-mut">${t.esc}</td><td class="cell-strong">${t.valor ? fmt.money(t.valor) : '—'}</td></tr>`).join('');
      return `<div class="card"><div class="card-head"><div><h3>Estado jurídico</h3></div>
          <div class="ch-actions">${badge(p.estadoJuridico, p.estadoJuridico === 'Sano' ? 'green' : p.estadoJuridico === 'En litigio' ? 'red' : 'amber', true)}</div></div>
        <div class="card-body"><dl class="dl">
          <div><dt>Matrícula inmobiliaria</dt><dd class="mono">${p.matricula}</dd></div>
          <div><dt>Escritura vigente</dt><dd>${p.escritura}</dd></div>
          <div><dt>Propietario actual</dt><dd>${p.propietario}</dd></div>
          <div><dt>Naturaleza</dt><dd>${p.naturaleza}</dd></div>
          <div><dt>Gravámenes</dt><dd>${p.gravamenes ? p.gravamenes + ' vigente(s)' : 'No registra'}</dd></div>
          <div><dt>Servidumbres / Limitaciones</dt><dd>${p.servidumbres + p.limitaciones} registradas</dd></div>
        </dl></div></div>
        <div class="card mt-16 card-tight"><div class="card-head"><div><h3>Estudio de tradición</h3></div>
          <div class="ch-actions"><button class="btn btn-soft btn-sm" data-act="ia-predio">${ic('sparkles', 'icon-sm')}Analizar con IA</button></div></div>
          <div class="table-wrap"><table class="data"><thead><tr><th>Año</th><th>Acto</th><th>Transfiere</th><th>Adquiere</th><th>Instrumento</th><th>Valor</th></tr></thead><tbody>${trad}</tbody></table></div></div>`;
    }

    function tabCatastral() {
      const rows = [
        { l: 'Área de terreno', j: fmt.area(p.areaTerrenoJur), c: fmt.area(p.areaTerrenoCat), diff: Math.abs(p.areaTerrenoJur - p.areaTerrenoCat) > p.areaTerrenoJur * 0.02 },
        { l: 'Área construida', j: fmt.area(p.areaConstruidaJur), c: fmt.area(p.areaConstruidaCat), diff: Math.abs(p.areaConstruidaJur - p.areaConstruidaCat) > 1 },
      ];
      const cmp = rows.map(r => `<div class="compare-grid">
          <div class="compare-col"><div class="compare-row ${r.diff ? 'diff' : 'match'}"><small>${r.l} · Jurídica</small><b>${r.j}</b></div></div>
          <div class="compare-mid"><div class="compare-vs">VS</div>${r.diff ? badge('Difiere', 'amber') : badge('Coincide', 'green')}</div>
          <div class="compare-col"><div class="compare-row ${r.diff ? 'diff' : 'match'}"><small>${r.l} · Catastral</small><b>${r.c}</b></div></div>
        </div>`).join('<div style="height:8px"></div>');
      return `<div class="card"><div class="card-head"><div><h3>Información catastral</h3></div></div><div class="card-body"><dl class="dl">
          <div><dt>Cédula catastral</dt><dd class="mono">${p.cedulaCatastral}</dd></div>
          <div><dt>Número CHIP</dt><dd class="mono">${p.chip}</dd></div>
          <div><dt>Destino económico</dt><dd>${p.destino}</dd></div>
          <div><dt>Avalúo catastral</dt><dd>${fmt.moneyFull(p.avaluoCatastral)}</dd></div>
          <div><dt>Avalúo comercial</dt><dd>${fmt.moneyFull(p.avaluoComercial)}</dd></div>
          <div><dt>Relación C/A</dt><dd>${Math.round(p.avaluoCatastral / p.avaluoComercial * 100)}%</dd></div>
        </dl></div></div>
        <div class="card mt-16"><div class="card-head"><div><h3>Comparación jurídica vs. catastral</h3></div></div>
          <div class="card-body">${cmp}</div></div>`;
    }

    function tabUrbanistico() {
      return `<div class="card"><div class="card-head"><div><h3>Norma urbanística (POT)</h3></div></div><div class="card-body"><dl class="dl">
          <div><dt>Uso del suelo</dt><dd>${p.uso}</dd></div>
          <div><dt>Tratamiento urbanístico</dt><dd>${p.tratamiento}</dd></div>
          <div><dt>Índice de construcción</dt><dd>${io}</dd></div>
          <div><dt>Altura permitida</dt><dd>${p.pisos + 2} pisos</dd></div>
          <div><dt>Afectaciones</dt><dd>${p.riesgo === 'alto' ? 'Vialidad, Ronda hídrica' : 'No registra'}</dd></div>
          <div><dt>Compatibilidad</dt><dd><span class="badge green">Compatible</span></dd></div>
        </dl></div></div>
        <div class="grid grid-3 mt-16">
          <div class="card"><div class="card-body flex items-center gap-12"><span class="tint amber">${ic('warning')}</span><div><div class="cell-strong">Afectaciones</div><div class="cell-mut">Vías proyectadas: 1</div></div></div></div>
          <div class="card"><div class="card-body flex items-center gap-12"><span class="tint red">${ic('leaf')}</span><div><div class="cell-strong">Riesgos</div><div class="cell-mut">${p.riesgo === 'alto' ? 'Ronda hídrica' : 'Sin amenaza alta'}</div></div></div></div>
          <div class="card"><div class="card-body flex items-center gap-12"><span class="tint green">${ic('checkCircle')}</span><div><div class="cell-strong">Cesiones</div><div class="cell-mut">Al día</div></div></div></div>
        </div>`;
    }

    function tabDocumental() {
      if (!docs.length) return empty('folder', 'Sin documentos', 'Carga los primeros documentos del expediente');
      const cards = docs.map(d => `<div class="doc-card" data-doc="${d.id}">
          <div class="doc-badge ${d.tipo}" style="width:40px;height:40px;margin-bottom:10px">${d.tipo.toUpperCase()}</div>
          <h5 title="${d.nombre}">${d.nombre}</h5><small>${d.origen} · ${d.peso}</small>
          <div class="flex items-center justify-between" style="margin-top:8px"><small>${fmt.date(d.fecha)}</small><button class="icon-btn" style="width:28px;height:28px">${ic('download', 'icon-sm')}</button></div>
        </div>`).join('');
      return `<div class="card"><div class="card-head"><div><h3>Gestión documental</h3><span class="ch-sub">${docs.length} archivos</span></div>
          <div class="ch-actions"><button class="btn btn-primary btn-sm" data-act="subir-doc">${ic('upload', 'icon-sm')}Subir</button></div></div>
        <div class="card-body"><div class="doc-grid">${cards}</div></div></div>`;
    }

    function tabActuaciones() {
      if (!acts.length) return empty('activity', 'Sin actuaciones', 'Programa visitas, conceptos u oficios');
      return `<div class="card card-tight"><div class="table-wrap"><table class="data">
        <thead><tr><th>ID</th><th>Tipo</th><th>Actuación</th><th>Estado</th><th>Responsable</th><th>Fecha</th></tr></thead>
        <tbody>${acts.map(a => `<tr><td class="cell-id">${a.id}</td>
          <td><span class="flex items-center gap-8">${ic(UI.tipoActuacionIc[a.tipo] || 'clipboard', 'icon-sm')}${a.tipo}</span></td>
          <td class="cell-strong">${a.titulo}</td><td>${badge(a.estado, UI.estadoBadge[a.estado] || 'gray')}</td>
          <td>${a.responsable}</td><td class="cell-mut">${fmt.date(a.fecha)}</td></tr>`).join('')}</tbody></table></div></div>`;
    }

    function tabHistorial() {
      const items = [
        { ic: 'upload', tone: 'green', t: '<b>Carga de documentos</b> · Santiago Orduz', d: '28/05/2025' },
        { ic: 'edit', tone: 'blue', t: '<b>Actualización de información catastral</b> · Santiago Orduz', d: '27/05/2025' },
        { ic: 'alert', tone: 'amber', t: '<b>Registro de hallazgos</b> · Santiago Orduz', d: '26/05/2025' },
        { ic: 'plus', tone: 'violet', t: '<b>Creación del expediente</b> · Sistema', d: '20/05/2025' },
      ];
      return `<div class="card"><div class="card-head"><div><h3>Historial de cambios</h3></div></div>
        <div class="card-body"><div class="timeline">${items.map(i => `<div class="tl-item"><div class="tl-ic kpi-ic ${i.tone}">${ic(i.ic, 'icon-sm')}</div><div class="tl-body"><p>${i.t}</p><time>${i.d}</time></div></div>`).join('')}</div></div></div>`;
    }

    const tabMap = { resumen: tabResumen, juridico: tabJuridico, catastral: tabCatastral, urbanistico: tabUrbanistico, documental: tabDocumental, actuaciones: tabActuaciones, historial: tabHistorial };

    return {
      html,
      init() {
        const content = document.getElementById('tabContent');
        const show = (t) => {
          document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
          content.innerHTML = `<div class="fade-in">${(tabMap[t] || tabResumen)()}</div>`;
        };
        show('resumen');
        initMiniMap([p.lat, p.lng], 16);

        document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => show(btn.dataset.tab)));

        document.addEventListener('click', expDelegate);
        function expDelegate(e) {
          if (!document.body.contains(content)) { document.removeEventListener('click', expDelegate); return; }
          const go = e.target.closest('[data-tab-go]');
          if (go) { show(go.dataset.tabGo); document.getElementById('tabContent').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
          const act = e.target.closest('[data-act]');
          if (!act) return;
          if (act.dataset.act === 'ia-predio') openIAModal(p);
          if (act.dataset.act === 'reporte-predio') toast('Ficha generada', 'La ficha predial de ' + p.nombre + ' está lista.', 'success');
          if (act.dataset.act === 'subir-doc') openUploadModal(p);
        }
      },
    };
  }

  /* =====================================================================
     Módulos agregados (Jurídico, Catastral, Urbanístico)
     ===================================================================== */
  function moduloTabla({ crumb, title, sub, cols, rows, actions }) {
    return {
      html: pageHead(crumb, title, sub, actions) + `<div class="card card-tight">
        <div class="table-wrap"><table class="data"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></div>`,
      init() { document.querySelectorAll('tr[data-predio]').forEach(tr => tr.addEventListener('click', () => location.hash = '#/predios/' + tr.dataset.predio)); },
    };
  }

  function juridico() {
    const rows = DB.predios.map(p => `<tr data-predio="${p.id}">
      <td><div class="cell-strong">${p.nombre}</div><div class="cell-mut">${p.id}</div></td>
      <td class="mono">${p.matricula}</td>
      <td>${badge(p.estadoJuridico, p.estadoJuridico === 'Sano' ? 'green' : p.estadoJuridico === 'En litigio' ? 'red' : 'amber', true)}</td>
      <td>${p.gravamenes ? badge(p.gravamenes, 'red') : badge('0', 'green')}</td>
      <td>${p.servidumbres || 0}</td><td>${p.limitaciones || 0}</td>
      <td class="cell-mut">${p.naturaleza}</td>
      <td><button class="icon-btn" style="width:30px;height:30px">${ic('chevronRight', 'icon-sm')}</button></td></tr>`).join('');
    return moduloTabla({ crumb: ['Inicio', 'Jurídico'], title: 'Módulo Jurídico', sub: 'Matrícula, tradición, gravámenes y estado jurídico',
      cols: ['Predio', 'Matrícula', 'Estado jurídico', 'Gravámenes', 'Servidumbres', 'Limitaciones', 'Naturaleza', ''], rows,
      actions: `<button class="btn btn-ghost">${ic('download')}Exportar</button>` });
  }

  function catastral() {
    const rows = DB.predios.map(p => {
      const diff = Math.abs(p.areaTerrenoJur - p.areaTerrenoCat) > p.areaTerrenoJur * 0.02;
      return `<tr data-predio="${p.id}">
        <td><div class="cell-strong">${p.nombre}</div><div class="cell-mut">${p.id}</div></td>
        <td class="mono">${p.cedulaCatastral}</td><td>${p.destino}</td>
        <td class="cell-strong">${fmt.area(p.areaTerrenoCat)}</td>
        <td>${diff ? badge('Difiere', 'amber', true) : badge('Coincide', 'green', true)}</td>
        <td class="cell-strong">${fmt.money(p.avaluoCatastral)}</td>
        <td><button class="icon-btn" style="width:30px;height:30px">${ic('chevronRight', 'icon-sm')}</button></td></tr>`;
    }).join('');
    return moduloTabla({ crumb: ['Inicio', 'Catastral'], title: 'Módulo Catastral', sub: 'Cédula catastral, áreas, avalúo y comparación con lo jurídico',
      cols: ['Predio', 'Cédula catastral', 'Destino', 'Área catastral', 'Conciliación', 'Avalúo catastral', ''], rows,
      actions: `<button class="btn btn-ghost">${ic('compare')}Conciliar áreas</button>` });
  }

  function urbanistico() {
    const rows = DB.predios.map(p => `<tr data-predio="${p.id}">
      <td><div class="cell-strong">${p.nombre}</div><div class="cell-mut">${p.id}</div></td>
      <td>${badge(p.uso, 'blue')}</td><td>${p.tratamiento}</td>
      <td class="cell-strong">${p.areaTerrenoCat ? (p.areaConstruidaCat / p.areaTerrenoCat).toFixed(2) : '—'}</td>
      <td>${badge(UI.riesgoLabel[p.riesgo], UI.riesgoBadge[p.riesgo], true)}</td>
      <td>${badge('Compatible', 'green')}</td>
      <td><button class="icon-btn" style="width:30px;height:30px">${ic('chevronRight', 'icon-sm')}</button></td></tr>`).join('');
    return moduloTabla({ crumb: ['Inicio', 'Urbanístico'], title: 'Módulo Urbanístico', sub: 'Uso del suelo, tratamiento POT, índices y afectaciones',
      cols: ['Predio', 'Uso', 'Tratamiento', 'Índice constr.', 'Riesgo', 'Compatibilidad', ''], rows,
      actions: `<button class="btn btn-ghost">${ic('treeMap')}Ver por tratamiento</button>` });
  }

  /* =====================================================================
     MAPA (GIS)
     ===================================================================== */
  function gis() {
    const layers = DB.capas.map(c => `<label class="layer-toggle">
        <span class="lt-swatch" style="background:${c.color}"></span><span class="lt-name">${c.nombre}</span>
        <span class="switch"><input type="checkbox" data-layer="${c.id}" ${c.on ? 'checked' : ''}><span class="track"></span></span></label>`).join('');
    const html = pageHead(['Inicio', 'Mapa'], 'Mapa · GIS',
      'Cartografía interactiva, capas y análisis geoespacial',
      `<button class="btn btn-ghost" data-act="import">${ic('upload')}Cargar capa (SHP)</button>
       <button class="btn btn-primary">${ic('download')}Exportar mapa</button>`)
      + `<div class="map-shell">
          <div class="map-panel">
            <h4>Mapa base</h4>
            <div class="chip-row"><span class="chip active" data-base="light">Claro</span><span class="chip" data-base="dark">Oscuro</span><span class="chip" data-base="sat">Satélite</span></div>
            <h4>Capas</h4>${layers}
            <h4>Predios en el mapa</h4><div id="mapPredioList"></div>
          </div>
          <div class="map-canvas-wrap">
            <div id="map"></div>
            <div class="map-legend"><div class="fw-700" style="margin-bottom:6px;font-size:11.5px">Nivel de riesgo</div>
              <div class="ml-row2"><i style="background:${CB.green}"></i>Bajo</div>
              <div class="ml-row2"><i style="background:${CB.amber}"></i>Medio</div>
              <div class="ml-row2"><i style="background:${CB.red}"></i>Alto</div></div>
          </div>
        </div>`;
    return {
      html,
      init() {
        const el = document.getElementById('map');
        if (!el || !window.L) return;
        const bases = {
          light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '© OpenStreetMap, © CARTO' }),
          dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }),
          sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri' }),
        };
        const map = L.map(el).setView(window.PREDIO_CONFIG.MAPA_CENTRO, window.PREDIO_CONFIG.MAPA_ZOOM);
        let current = bases.light.addTo(map);
        const predioLayer = L.layerGroup().addTo(map);
        DB.predios.forEach(p => {
          const col = { bajo: CB.green, medio: CB.amber, alto: CB.red }[p.riesgo];
          L.circleMarker([p.lat, p.lng], { radius: 9, color: '#fff', weight: 2, fillColor: col, fillOpacity: .95 })
            .addTo(predioLayer).bindPopup(`<b>${p.nombre}</b><br><span style="color:#94A3B8">${p.direccion}</span><br>Avalúo: ${fmt.money(p.avaluoComercial)}<br><a href="#/predios/${p.id}">Abrir expediente</a>`);
        });
        setTimeout(() => map.invalidateSize(), 200);
        document.getElementById('mapPredioList').innerHTML = DB.predios.map(p => `<div class="layer-toggle" data-goto="${p.lat},${p.lng}">
            <span class="lt-swatch" style="background:${{ bajo: CB.green, medio: CB.amber, alto: CB.red }[p.riesgo]}"></span>
            <span class="lt-name" style="font-size:12.5px">${p.nombre}</span>${ic('pin', 'icon-sm')}</div>`).join('');
        document.querySelectorAll('[data-goto]').forEach(d => d.addEventListener('click', () => { const [la, ln] = d.dataset.goto.split(',').map(Number); map.flyTo([la, ln], 16); }));
        document.querySelectorAll('[data-base]').forEach(c => c.addEventListener('click', () => {
          document.querySelectorAll('[data-base]').forEach(x => x.classList.remove('active')); c.classList.add('active');
          map.removeLayer(current); current = bases[c.dataset.base].addTo(map);
        }));
        document.querySelectorAll('[data-layer="predios"]').forEach(sw => sw.addEventListener('change', e => { if (e.target.checked) predioLayer.addTo(map); else map.removeLayer(predioLayer); }));
      },
    };
  }

  /* =====================================================================
     DOCUMENTAL / HALLAZGOS / ACTUACIONES / REPORTES / IA
     ===================================================================== */
  function documental() {
    const cards = DB.documentos.map(d => { const pr = DB.predioById(d.predio);
      return `<div class="doc-card"><div class="doc-badge ${d.tipo}" style="width:40px;height:40px;margin-bottom:10px">${d.tipo.toUpperCase()}</div>
        <h5 title="${d.nombre}">${d.nombre}</h5><small>${pr ? pr.nombre : d.predio} · ${d.peso}</small>
        <div class="flex items-center justify-between" style="margin-top:8px"><small>${fmt.date(d.fecha)}</small><button class="icon-btn" style="width:28px;height:28px">${ic('download', 'icon-sm')}</button></div></div>`;
    }).join('');
    const types = [['pdf', 'PDF'], ['doc', 'Word'], ['xls', 'Excel'], ['dwg', 'DWG'], ['shp', 'SHP'], ['img', 'Imágenes']];
    return {
      html: pageHead(['Inicio', 'Documentos'], 'Gestión Documental', 'Repositorio central de documentos por predio',
        `<button class="btn btn-primary" data-act="subir-doc">${ic('upload')}Subir documento</button>`)
        + `<div class="chip-row" style="margin-bottom:18px"><span class="chip active">Todos</span>${types.map(t => `<span class="chip">${t[1]}</span>`).join('')}</div>
           <div class="doc-grid">${cards}</div>`,
      init() { document.querySelectorAll('[data-act="subir-doc"]').forEach(b => b.addEventListener('click', () => openUploadModal())); },
    };
  }

  function hallazgos() {
    const cnt = { alto: 0, medio: 0, bajo: 0 };
    DB.hallazgos.forEach(h => cnt[h.severidad]++);
    const rows = DB.hallazgos.map(h => `<tr data-predio="${h.predio}">
      <td class="cell-id">${h.id}</td>
      <td><div class="cell-strong">${h.titulo}</div><div class="cell-mut">${h.predioNombre}</div></td>
      <td><span class="flex items-center gap-8">${ic(UI.tipoHallazgoIc[h.tipo] || 'flag', 'icon-sm')}${h.tipo}</span></td>
      <td>${badge(UI.riesgoLabel[h.severidad], UI.severidadBadge[h.severidad], true)}</td>
      <td>${badge(h.estado, UI.estadoBadge[h.estado] || 'gray')}</td>
      <td><span class="flex items-center gap-8">${avatar(h.responsable)}${h.responsable}</span></td>
      <td class="cell-mut">${fmt.date(h.fecha)}</td></tr>`).join('');
    return {
      html: pageHead(['Inicio', 'Hallazgos'], 'Hallazgos', 'Novedades jurídicas, catastrales, urbanísticas, ambientales y sociales',
        `<button class="btn btn-primary" data-act="nuevo-hallazgo">${ic('plus')}Registrar hallazgo</button>`)
        + `<div class="grid grid-3" style="margin-bottom:16px">
            <div class="kpi"><div class="kpi-top"><div class="kpi-ic red">${ic('alert')}</div></div><div class="kpi-val">${cnt.alto}</div><div class="kpi-label">Severidad alta</div></div>
            <div class="kpi"><div class="kpi-top"><div class="kpi-ic amber">${ic('warning')}</div></div><div class="kpi-val">${cnt.medio}</div><div class="kpi-label">Severidad media</div></div>
            <div class="kpi"><div class="kpi-top"><div class="kpi-ic blue">${ic('info')}</div></div><div class="kpi-val">${cnt.bajo}</div><div class="kpi-label">Severidad baja</div></div></div>
          <div class="card card-tight"><div class="table-wrap"><table class="data">
            <thead><tr><th>ID</th><th>Hallazgo</th><th>Tipo</th><th>Severidad</th><th>Estado</th><th>Responsable</th><th>Fecha</th></tr></thead>
            <tbody>${rows}</tbody></table></div></div>`,
      init() {
        document.querySelectorAll('tr[data-predio]').forEach(tr => tr.addEventListener('click', () => location.hash = '#/predios/' + tr.dataset.predio));
        document.querySelectorAll('[data-act="nuevo-hallazgo"]').forEach(b => b.addEventListener('click', openHallazgoModal));
      },
    };
  }

  function actuaciones() {
    const rows = DB.actuaciones.map(a => `<tr data-predio="${a.predio}">
      <td class="cell-id">${a.id}</td>
      <td><span class="flex items-center gap-8">${ic(UI.tipoActuacionIc[a.tipo] || 'clipboard', 'icon-sm')}${a.tipo}</span></td>
      <td><div class="cell-strong">${a.titulo}</div><div class="cell-mut">${a.predioNombre}</div></td>
      <td>${badge(a.estado, UI.estadoBadge[a.estado] || 'gray')}</td>
      <td><span class="flex items-center gap-8">${avatar(a.responsable)}${a.responsable}</span></td>
      <td class="cell-mut">${fmt.date(a.fecha)}</td></tr>`).join('');
    return {
      html: pageHead(['Inicio', 'Actuaciones'], 'Actuaciones', 'Visitas, conceptos, oficios, resoluciones, licencias y seguimiento',
        `<button class="btn btn-primary" data-act="nueva-actuacion">${ic('plus')}Nueva actuación</button>`)
        + `<div class="card card-tight"><div class="table-wrap"><table class="data">
            <thead><tr><th>ID</th><th>Tipo</th><th>Actuación</th><th>Estado</th><th>Responsable</th><th>Fecha</th></tr></thead>
            <tbody>${rows}</tbody></table></div></div>`,
      init() {
        document.querySelectorAll('tr[data-predio]').forEach(tr => tr.addEventListener('click', () => location.hash = '#/predios/' + tr.dataset.predio));
        document.querySelectorAll('[data-act="nueva-actuacion"]').forEach(b => b.addEventListener('click', () => toast('Formulario disponible', 'El registro de actuaciones está incluido en la plantilla.', 'info')));
      },
    };
  }

  function reportes() {
    const tpls = [
      { ic: 'fileText', t: 'Ficha predial', d: 'Documento consolidado por predio con datos jurídicos, catastrales y urbanísticos.', tone: 'blue' },
      { ic: 'scale', t: 'Concepto jurídico', d: 'Informe de estado jurídico, tradición y gravámenes.', tone: 'navy' },
      { ic: 'compare', t: 'Comparación de áreas', d: 'Conciliación jurídica vs. catastral con diferencias.', tone: 'amber' },
      { ic: 'alert', t: 'Informe de hallazgos', d: 'Reporte de hallazgos por tipo, severidad y estado.', tone: 'red' },
      { ic: 'coins', t: 'Reporte de avalúos', d: 'Consolidado de avalúos catastrales y comerciales.', tone: 'green' },
      { ic: 'treeMap', t: 'Reporte urbanístico', d: 'Usos, tratamientos e índices por sector.', tone: 'violet' },
    ];
    const cards = tpls.map(t => `<div class="card" style="cursor:pointer" data-report="${t.t}"><div class="card-body">
        <div class="flex items-center justify-between"><span class="tint ${t.tone}">${ic(t.ic)}</span>${ic('chevronRight', 'icon-sm')}</div>
        <h3 style="font-size:14.5px;margin-top:14px">${t.t}</h3><p class="text-soft" style="font-size:13px;margin-top:4px">${t.d}</p>
        <div class="flex gap-8" style="margin-top:14px"><span class="badge gray">PDF</span><span class="badge gray">Excel</span></div></div></div>`).join('');
    return {
      html: pageHead(['Inicio', 'Reportes'], 'Reportes', 'Genera informes técnicos, fichas y conceptos en PDF o Excel')
        + `<div class="grid grid-3">${cards}</div>`,
      init() {
        document.querySelectorAll('[data-report]').forEach(c => c.addEventListener('click', () => {
          const name = c.dataset.report;
          modal({ title: 'Generar ' + name, subtitle: 'Configura el alcance del reporte', icon: 'fileText',
            body: `<div class="form-grid">
              <div class="field"><label>Formato de salida</label><select><option>PDF</option><option>Excel</option><option>Word</option></select></div>
              <div class="field"><label>Municipio</label><select><option>Todos</option>${DB.municipios.map(m => `<option>${m}</option>`).join('')}</select></div>
              <div class="field full"><label>Predios incluidos</label><select><option>Todos los predios (${DB.predios.length})</option><option>Solo riesgo alto</option><option>Selección manual</option></select></div>
              <div class="field full"><label>Notas del reporte</label><textarea placeholder="Observaciones a incluir en el encabezado..."></textarea></div></div>`,
            footer: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-gen>${ic('download')}Generar</button>`,
            onOpen(m) { m.querySelector('[data-close]').addEventListener('click', closeModal); m.querySelector('[data-gen]').addEventListener('click', () => { closeModal(); toast('Reporte generado', name + ' se generó correctamente.', 'success'); }); } });
        }));
      },
    };
  }

  function ia() {
    const feats = [
      { ic: 'scale', t: 'Lectura de escrituras', d: 'Extrae partes, linderos, áreas y actos de escrituras públicas en PDF.' },
      { ic: 'fileCheck', t: 'Análisis de certificados', d: 'Interpreta el certificado de tradición y detecta gravámenes.' },
      { ic: 'compare', t: 'Comparación documental', d: 'Contrasta información jurídica vs. catastral y resalta diferencias.' },
      { ic: 'alert', t: 'Generación de hallazgos', d: 'Propone hallazgos automáticos con severidad sugerida.' },
      { ic: 'fileText', t: 'Conceptos y conclusiones', d: 'Redacta conceptos técnicos, conclusiones y recomendaciones.' },
      { ic: 'sparkles', t: 'Estudios prediales', d: 'Compila un estudio predial integral listo para revisión.' },
    ];
    return {
      html: pageHead(['Inicio', 'Inteligencia Artificial'], 'Inteligencia Artificial',
        'Automatiza la lectura documental y la generación de conceptos prediales',
        `<span class="badge blue"><span class="badge-dot"></span>OpenAI conectable</span>`)
        + `<div class="ai-hero fade-in">
            <span class="tint blue" style="width:52px;height:52px;border-radius:14px">${ic('sparkles', 'icon-lg')}</span>
            <div style="flex:1">
              <h3 style="font-size:17px;font-weight:800;letter-spacing:-.3px">Convierte documentos en conocimiento</h3>
              <p class="text-soft" style="font-size:13.5px;margin-top:3px">Carga escrituras, certificados o fichas catastrales y deja que la IA extraiga los datos, los compare y genere hallazgos, conceptos y estudios.</p>
            </div>
            <button class="btn btn-primary" data-act="ia-upload">${ic('upload')}Cargar documento</button>
          </div>
          <div class="ai-drop mt-16" data-act="ia-upload">
            <span class="tint blue" style="width:48px;height:48px;margin:0 auto 10px">${ic('fileText', 'icon-lg')}</span>
            <div style="font-weight:700">Arrastra documentos aquí o haz clic para cargar</div>
            <div class="text-mut" style="font-size:12.5px;margin-top:4px">PDF, Word, imágenes · hasta 25 MB</div>
          </div>
          <div class="grid grid-3 mt-24">${feats.map(f => `<div class="ai-feature"><span class="tint blue">${ic(f.ic)}</span><div><h5>${f.t}</h5><p>${f.d}</p></div></div>`).join('')}</div>`,
      init() { document.querySelectorAll('[data-act="ia-upload"]').forEach(d => d.addEventListener('click', () => openIAModal())); },
    };
  }

  /* =====================================================================
     USUARIOS / CONFIGURACIÓN
     ===================================================================== */
  function usuarios() {
    const users = [
      { n: 'Santiago Orduz', r: 'Administrador', e: 'santiago@daptux.co', est: 'Activo', tone: 'green' },
      { n: 'Carlos Restrepo', r: 'Abogado predial', e: 'carlos@daptux.co', est: 'Activo', tone: 'green' },
      { n: 'Laura Muñoz', r: 'Gestor catastral', e: 'laura@daptux.co', est: 'Activo', tone: 'green' },
      { n: 'Julián Herrera', r: 'Analista urbanístico', e: 'julian@daptux.co', est: 'Activo', tone: 'green' },
      { n: 'Ana Vélez', r: 'Inspector de campo', e: 'ana@daptux.co', est: 'Invitado', tone: 'amber' },
    ];
    const rows = users.map(u => `<tr>
      <td><div class="flex items-center gap-12">${avatar(u.n)}<div><div class="cell-strong">${u.n}</div><div class="cell-mut">${u.e}</div></div></div></td>
      <td>${badge(u.r, 'blue')}</td><td>${badge(u.est, u.tone)}</td>
      <td class="cell-mut">Hoy</td>
      <td class="cell-actions"><button class="icon-btn" style="width:30px;height:30px">${ic('edit', 'icon-sm')}</button></td></tr>`).join('');
    return {
      html: pageHead(['Inicio', 'Usuarios'], 'Usuarios y roles', 'Gestión del equipo y permisos de acceso',
        `<button class="btn btn-primary" data-act="nuevo-usuario">${ic('plus')}Invitar usuario</button>`)
        + `<div class="card card-tight"><div class="table-wrap"><table class="data">
            <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Último acceso</th><th></th></tr></thead>
            <tbody>${rows}</tbody></table></div></div>`,
      init() { document.querySelectorAll('[data-act="nuevo-usuario"]').forEach(b => b.addEventListener('click', () => toast('Invitación', 'Formulario de invitación disponible en la plantilla.', 'info'))); },
    };
  }

  function configuracion() {
    const groups = [
      { ic: 'building', t: 'Organización', d: 'Nombre, logo, datos de la entidad.' },
      { ic: 'users', t: 'Roles y permisos', d: 'Define qué puede ver y hacer cada rol.' },
      { ic: 'database', t: 'Integraciones', d: 'VUR, IGAC, ORIP, ArcGIS, OpenAI.' },
      { ic: 'shield', t: 'Seguridad', d: 'Autenticación, sesiones y auditoría.' },
      { ic: 'bell', t: 'Notificaciones', d: 'Alertas por correo y en la plataforma.' },
      { ic: 'sun', t: 'Apariencia', d: 'Tema claro / oscuro y personalización.' },
    ];
    const cards = groups.map(g => `<div class="card" style="cursor:pointer"><div class="card-body flex items-center gap-12">
        <span class="tint navy">${ic(g.ic)}</span><div style="flex:1"><div class="cell-strong">${g.t}</div><div class="cell-mut">${g.d}</div></div>${ic('chevronRight', 'icon-sm')}</div></div>`).join('');
    return {
      html: pageHead(['Inicio', 'Configuración'], 'Configuración', 'Ajustes generales de la plataforma')
        + `<div class="grid grid-3">${cards}</div>
           <div class="card mt-16"><div class="card-head"><div><h3>Integraciones activas</h3></div></div>
             <div class="card-body"><div class="chip-row">${window.PREDIO_CONFIG.INTEGRACIONES.map(i => `<span class="chip">${ic('link', 'icon-sm')}${i}</span>`).join('')}</div></div></div>`,
      init() {},
    };
  }

  /* =====================================================================
     MODALES compartidos
     ===================================================================== */
  function openNuevoPredio(onDone) {
    modal({ title: 'Registrar predio', subtitle: 'Crea un nuevo expediente digital', icon: 'building', size: 'lg',
      body: `<form id="fPredio"><div class="form-grid">
        <div class="field"><label>Nombre del predio <span class="req">*</span></label><input name="nombre" required placeholder="Ej: Predio Calle 37 # 40-98"></div>
        <div class="field"><label>Matrícula inmobiliaria <span class="req">*</span></label><input name="matricula" required placeholder="230-000000"></div>
        <div class="field"><label>Cédula catastral</label><input name="cedulaCatastral" placeholder="500010..."></div>
        <div class="field"><label>Propietario</label><input name="propietario" placeholder="Nombre / Razón social"></div>
        <div class="field full"><label>Dirección <span class="req">*</span></label><input name="direccion" required placeholder="Calle 00 # 00-00"></div>
        <div class="field"><label>Municipio</label><select name="municipio">${DB.municipios.map(m => `<option>${m}</option>`).join('')}</select></div>
        <div class="field"><label>Tipo</label><select name="tipo"><option>Urbano</option><option>Rural</option></select></div>
        <div class="field"><label>Uso del suelo</label><select name="uso">${DB.usos.map(u => `<option>${u}</option>`).join('')}</select></div>
        <div class="field"><label>Área de terreno (m²)</label><input name="areaTerrenoCat" type="number" placeholder="0"></div>
        <div class="field"><label>Avalúo comercial</label><input name="avaluoComercial" type="number" placeholder="0"></div>
        <div class="field"><label>Coordenada (lat, lng)</label><input name="coord" placeholder="4.142, -73.626"></div>
      </div></form>`,
      footer: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-save>${ic('check')}Crear expediente</button>`,
      onOpen(m) {
        m.querySelector('[data-close]').addEventListener('click', closeModal);
        m.querySelector('[data-save]').addEventListener('click', async () => {
          const form = m.querySelector('#fPredio'); if (!form.reportValidity()) return;
          const fd = Object.fromEntries(new FormData(form));
          const coord = (fd.coord || '').split(',').map(s => parseFloat(s.trim()));
          const payload = { nombre: fd.nombre, matricula: fd.matricula, cedulaCatastral: fd.cedulaCatastral || '—',
            direccion: fd.direccion, municipio: fd.municipio, barrio: '—', tipo: fd.tipo, uso: fd.uso, propietario: fd.propietario || '—', foto: 'poblado',
            areaTerrenoCat: +fd.areaTerrenoCat || 0, areaTerrenoJur: +fd.areaTerrenoCat || 0, areaConstruidaCat: 0, areaConstruidaJur: 0,
            avaluoComercial: +fd.avaluoComercial || 0, avaluoCatastral: 0, lat: coord[0] || window.PREDIO_CONFIG.MAPA_CENTRO[0], lng: coord[1] || window.PREDIO_CONFIG.MAPA_CENTRO[1],
            estadoJuridico: 'Sano', tratamiento: 'Consolidación', destino: 'Habitacional', gravamenes: 0, servidumbres: 0, limitaciones: 0, pisos: 0, frente: 0, fondo: 0, naturaleza: 'Propiedad privada', estrato: 0, chip: '—', escritura: '—' };
          await API.createPredio(payload);
          closeModal(); toast('Predio registrado', payload.nombre + ' fue creado como nuevo expediente.', 'success');
          if (onDone) onDone();
        });
      } });
  }

  function openHallazgoModal() {
    modal({ title: 'Registrar hallazgo', subtitle: 'Documenta una novedad del predio', icon: 'alert',
      body: `<form id="fHall"><div class="form-grid">
        <div class="field full"><label>Predio <span class="req">*</span></label><select name="predio">${DB.predios.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}</select></div>
        <div class="field"><label>Tipo</label><select name="tipo"><option>Jurídico</option><option>Catastral</option><option>Urbanístico</option><option>Ambiental</option><option>Social</option></select></div>
        <div class="field"><label>Severidad</label><select name="sev"><option value="alto">Alta</option><option value="medio">Media</option><option value="bajo">Baja</option></select></div>
        <div class="field full"><label>Título <span class="req">*</span></label><input name="titulo" required placeholder="Describe brevemente el hallazgo"></div>
        <div class="field full"><label>Descripción</label><textarea name="desc" placeholder="Detalle, fundamento y evidencia..."></textarea></div></div></form>`,
      footer: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-save>${ic('check')}Registrar</button>`,
      onOpen(m) {
        m.querySelector('[data-close]').addEventListener('click', closeModal);
        m.querySelector('[data-save]').addEventListener('click', () => {
          const form = m.querySelector('#fHall'); if (!form.reportValidity()) return;
          const fd = Object.fromEntries(new FormData(form)); const pr = DB.predioById(fd.predio);
          DB.hallazgos.unshift({ id: 'H-' + String(92 + DB.hallazgos.length).padStart(4, '0'), predio: fd.predio, predioNombre: pr.nombre, tipo: fd.tipo, severidad: fd.sev, titulo: fd.titulo, desc: fd.desc, estado: 'Abierto', responsable: 'Santiago Orduz', fecha: '2026-07-13' });
          closeModal(); toast('Hallazgo registrado', fd.titulo, 'success');
          if (location.hash.startsWith('#/hallazgos')) window.APP.navigate();
        });
      } });
  }

  function openUploadModal(predio) {
    modal({ title: 'Subir documento', subtitle: predio ? 'Expediente ' + predio.nombre : 'Selecciona el predio destino', icon: 'upload',
      body: `<div class="ai-drop"><span class="tint blue" style="width:48px;height:48px;margin:0 auto 10px">${ic('upload', 'icon-lg')}</span>
          <div style="font-weight:700">Arrastra archivos o haz clic para seleccionar</div>
          <div class="text-mut" style="font-size:12.5px;margin-top:4px">PDF, Word, Excel, DWG, SHP, imágenes</div></div>
        ${predio ? '' : `<div class="field full" style="margin-top:16px"><label>Predio destino</label><select>${DB.predios.map(p => `<option>${p.nombre}</option>`).join('')}</select></div>`}
        <div class="field full" style="margin-top:16px"><label>Categoría</label><select><option>Jurídico</option><option>Catastral</option><option>Urbanístico</option><option>Cartografía</option><option>Fotográfico</option></select></div>`,
      footer: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-save>${ic('upload')}Subir</button>`,
      onOpen(m) { m.querySelector('[data-close]').addEventListener('click', closeModal); m.querySelector('[data-save]').addEventListener('click', () => { closeModal(); toast('Documento cargado', 'El archivo se agregó al expediente.', 'success'); }); } });
  }

  function openIAModal(predio) {
    modal({ title: 'Análisis con IA', subtitle: predio ? predio.nombre : 'Procesamiento documental', icon: 'sparkles', size: 'lg',
      body: `<div class="ai-drop"><span class="tint blue" style="width:48px;height:48px;margin:0 auto 10px">${ic('fileText', 'icon-lg')}</span>
          <div style="font-weight:700">${predio ? 'Analizar documentos del expediente' : 'Cargar escritura o certificado'}</div>
          <div class="text-mut" style="font-size:12.5px;margin-top:4px">La IA extraerá datos, comparará y sugerirá hallazgos</div></div>
        <div id="iaResult" class="hidden"></div>`,
      footer: `<button class="btn btn-ghost" data-close>Cerrar</button><button class="btn btn-primary" data-run>${ic('sparkles')}Ejecutar análisis</button>`,
      onOpen(m) {
        m.querySelector('[data-close]').addEventListener('click', closeModal);
        m.querySelector('[data-run]').addEventListener('click', () => {
          const box = m.querySelector('#iaResult'); box.classList.remove('hidden');
          box.innerHTML = `<div class="flex items-center gap-12" style="padding:18px 0"><span class="tint blue">${ic('cpu')}</span><div><b>Procesando documento...</b><div class="text-mut" style="font-size:12.5px">Extrayendo linderos, áreas y actos jurídicos</div></div></div><div class="progress" style="height:6px"><i style="width:8%"></i></div>`;
          const bar = box.querySelector('.progress > i'); let w = 8;
          const t = setInterval(() => {
            w += 12 + Math.round(w / 5); bar.style.width = Math.min(w, 100) + '%';
            if (w >= 100) { clearInterval(t);
              box.innerHTML = `<div class="flex items-center gap-8" style="margin-bottom:14px">${badge('Análisis completado', 'green', true)}</div>
                <dl class="dl">
                  <div><dt>Documento</dt><dd>Escritura pública (detectado)</dd></div>
                  <div><dt>Acto identificado</dt><dd>Compraventa</dd></div>
                  <div><dt>Área en escritura</dt><dd>${predio ? fmt.area(predio.areaTerrenoJur) : '5.807,68 m²'}</dd></div>
                  <div><dt>Coincidencia catastral</dt><dd>${badge('Revisar diferencia', 'amber')}</dd></div></dl>
                <div class="ai-feature" style="margin-top:16px"><span class="tint amber">${ic('alert')}</span><div><h5>Hallazgo sugerido</h5><p>Posible diferencia de área entre escritura y catastro. Severidad media.</p></div></div>
                <div class="ai-feature" style="margin-top:10px"><span class="tint blue">${ic('fileText')}</span><div><h5>Concepto generado</h5><p>Se redactó un concepto jurídico preliminar listo para revisión.</p></div></div>`;
              toast('IA finalizó', 'Se generaron 1 hallazgo y 1 concepto.', 'success'); }
          }, 360);
        });
      } });
  }

  return {
    map: { dashboard, predios, juridico, catastral, urbanistico, gis, documental, hallazgos, actuaciones, reportes, ia, usuarios, configuracion },
    expediente, destroyCharts, openNuevoPredio, openUploadModal, openHallazgoModal, openIAModal,
  };
})();
