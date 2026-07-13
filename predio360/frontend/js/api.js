/* PREDIO360 · Capa de acceso a datos
   Abstrae el origen: MOCK (window.DB) | REST backend | Supabase.
   Devuelve Promesas para que migrar a red sea transparente. */
window.API = (function () {
  const cfg = window.PREDIO_CONFIG;
  const wait = (v, ms = 220) => new Promise(res => setTimeout(() => res(v), ms));

  async function rest(path, opts) {
    const r = await fetch(cfg.API_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!r.ok) throw new Error('API ' + r.status);
    return r.json();
  }

  return {
    isMock: () => cfg.USE_MOCK || (!cfg.API_BASE && !cfg.SUPABASE_URL),

    async getPredios() {
      if (this.isMock()) return wait([...DB.predios]);
      return rest('/api/predios');
    },
    async getPredio(id) {
      if (this.isMock()) return wait(DB.predioById(id));
      return rest('/api/predios/' + id);
    },
    async createPredio(payload) {
      if (this.isMock()) {
        const p = { id: 'PR-' + String(130 + DB.predios.length).padStart(5, '0'), avance: 0, riesgo: 'bajo', estado: 'En estudio', ...payload };
        DB.predios.unshift(p);
        return wait(p, 400);
      }
      return rest('/api/predios', { method: 'POST', body: JSON.stringify(payload) });
    },
    async getHallazgos() { return this.isMock() ? wait([...DB.hallazgos]) : rest('/api/hallazgos'); },
    async getActuaciones() { return this.isMock() ? wait([...DB.actuaciones]) : rest('/api/actuaciones'); },
    async getDocumentos(predioId) {
      if (this.isMock()) return wait(DB.documentos.filter(d => !predioId || d.predio === predioId));
      return rest('/api/documentos' + (predioId ? '?predio=' + predioId : ''));
    },
    async getDashboard() {
      if (this.isMock()) return wait({ kpis: DB.kpis, charts: DB.charts, actividad: DB.actividad });
      return rest('/api/dashboard');
    },
  };
})();
