/* ═══════════════════════════════════════════════════════════
   store.js — Estado global · CPCE Mendoza · Prode Mundial 2026

   SEGURIDAD:
   · Token en sessionStorage (se borra al cerrar el tab)
     — más seguro que localStorage ante XSS persistente
   · User info no sensible en sessionStorage (sin passwordHash)
   · Sanitización XSS en todos los datos del servidor antes
     de insertarlos en el DOM vía innerHTML
   · Expiración del token verificada en client-side también
   · Sin datos sensibles en console.log
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   SANITIZACIÓN XSS
   Escapar caracteres HTML antes de insertar texto de
   origen externo (API) en innerHTML.
   REGLA: todo texto que venga del servidor y se use en
   innerHTML debe pasar por sanitize().
═══════════════════════════════════════════════════════════ */
const XSS = {
  sanitize(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  // Alias corto para uso frecuente
  s: (v) => XSS.sanitize(v),
};

/* ═══════════════════════════════════════════════════════════
   TOKEN STORE — sessionStorage
   sessionStorage se borra al cerrar el tab/navegador.
   localStorage persiste indefinidamente → mayor superficie
   de ataque ante XSS (scripts maliciosos pueden leerlo).
═══════════════════════════════════════════════════════════ */
const Store = {
  /* Token JWT — solo en sessionStorage */
  setToken(token) {
    try { sessionStorage.setItem('prode_tk', token); } catch {}
  },
  getToken() {
    try {
      const t = sessionStorage.getItem('prode_tk');
      if (!t) return null;
      // Verificar expiración client-side (el backend igual lo verifica)
      if (Store._isTokenExpired(t)) {
        Store.clearToken();
        return null;
      }
      return t;
    } catch { return null; }
  },
  clearToken() {
    try { sessionStorage.removeItem('prode_tk'); } catch {}
  },

  /* Datos del usuario — no sensibles, solo nombre/email/rol */
  setUser(user) {
    try {
      // Guardar solo lo necesario — nunca el passwordHash
      const safe = { nombre: user.nombre, email: user.email, rol: user.rol };
      sessionStorage.setItem('prode_usr', JSON.stringify(safe));
    } catch {}
  },
  getUser() {
    try { return JSON.parse(sessionStorage.getItem('prode_usr')); }
    catch { return null; }
  },
  clearUser() {
    try { sessionStorage.removeItem('prode_usr'); } catch {}
  },

  clear() {
    Store.clearToken();
    Store.clearUser();
  },

  /* Verificar expiración del JWT sin librería externa */
  _isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp está en segundos Unix
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // si no se puede parsear, considerarlo expirado
    }
  },
};

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
const State = {
  partidos:   [],
  misPreds:   {},
  pending:    {},
  ranking:    [],
  equipos:    [],
  filter:     'todos',
  resetId:    null,
  viewStack:  [],

  get user()    { return Store.getUser(); },
  get token()   { return Store.getToken(); },
  get isAdmin() { return State.user?.rol === 'ROLE_ADMIN'; },
};

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
const Toast = {
  show(msg, type = 'ok') {
    const t = document.createElement('div');
    t.className = `toast t${type}`;
    // textContent — nunca innerHTML — para evitar XSS en los mensajes
    t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => t.remove(), 2900);
  },
  ok(msg)   { Toast.show(msg, 'ok'); },
  err(msg)  { Toast.show(msg, 'err'); },
  info(msg) { Toast.show(msg, 'info'); },
};

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
const Modal = {
  open(id)  { document.getElementById(id)?.classList.add('open'); },
  close()   { document.querySelectorAll('.moverlay').forEach(m => m.classList.remove('open')); },
};
document.addEventListener('click', e => {
  if (e.target.classList.contains('moverlay')) Modal.close();
});

/* ═══════════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════════ */
const Router = {
  current: null,
  // Vistas permitidas — whitelist para evitar navegación a vistas arbitrarias
  VIEWS: ['partidos', 'ranking', 'selecciones', 'perfil', 'admin'],

  go(name, params = {}) {
    if (!Router.VIEWS.includes(name)) return; // bloquear navegación inválida
    if (name === 'admin' && !State.isAdmin) return;

    if (Router.current) State.viewStack.push(Router.current);
    document.querySelectorAll('#main .view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${name}`)?.classList.add('active');
    Router.current = name;
    document.querySelectorAll('[data-v]').forEach(b =>
      b.classList.toggle('active', b.dataset.v === name)
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Views.load(name, params);
  },
};

/* ═══════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════ */
const Auth = {
  saveSession(data) {
    Store.setToken(data.token);
    Store.setUser({ nombre: data.nombre, email: data.email, rol: data.rol });
  },

  logout() {
    Store.clear();
    State.partidos = []; State.misPreds = {}; State.pending = {}; State.ranking = [];

    document.getElementById('topbar').style.display     = 'none';
    document.getElementById('mobile-nav').style.display = 'none';
    document.getElementById('main').style.display       = 'none';
    document.querySelectorAll('#main .view').forEach(v => v.classList.remove('active'));

    const lv = document.getElementById('view-login');
    lv.style.display = 'flex'; lv.classList.add('active');
  },

  boot() {
    const user = State.user;
    if (!State.token || !user) { Auth.logout(); return; }

    document.getElementById('view-login').style.display = 'none';
    document.getElementById('view-login').classList.remove('active');
    document.getElementById('topbar').style.display     = 'flex';
    document.getElementById('mobile-nav').style.display = 'block';
    document.getElementById('main').style.display       = 'block';

    // Usar textContent — no innerHTML — para datos del usuario
    document.getElementById('ubn').textContent  = user.nombre;
    document.getElementById('ubp').textContent  = '0 pts';
    document.getElementById('ubav').textContent = Fmt.iniciales(user.nombre);

    if (State.isAdmin) {
      document.querySelectorAll('.admin-nav-item').forEach(el => el.style.display = '');
    }

    Router.go('partidos');
  },
};

/* ═══════════════════════════════════════════════════════════
   FORMATO — todos usan XSS.s() en datos externos
═══════════════════════════════════════════════════════════ */
const Fmt = {
  fecha(iso) {
    return new Date(iso).toLocaleString('es-AR', {
      weekday: 'short', day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }) + ' hs';
  },
  fechaCorta(iso) {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }) + ' hs';
  },
  iniciales(nombre) {
    return (nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  },
  puntosLabel(pts) {
    if (pts === 3) return '🎯 Pleno · 3 pts';
    if (pts === 1) return '👍 Tendencia · 1 pt';
    if (pts === 0) return '❌ Sin puntos';
    return '— Pendiente';
  },
  puntosClass(pts) {
    if (pts === 3) return 'p3';
    if (pts === 1) return 'p1';
    if (pts === 0) return 'p0';
    return 'pp';
  },
  posicion(n) { return ({ 1:'🥇', 2:'🥈', 3:'🥉' })[n] || n; },
  posicionJugador(pos) {
    return ({
      PORTERO:    { label:'POR', cls:'pos-P' },
      DEFENSA:    { label:'DEF', cls:'pos-D' },
      MEDIOCAMPO: { label:'MED', cls:'pos-M' },
      DELANTERO:  { label:'DEL', cls:'pos-A' },
    })[pos] || { label: XSS.s(pos), cls: '' };
  },
  // Flags: src y alt sanitizados
  flag(url, nombre) {
    return `<img class="flag" src="${XSS.s(url)}" alt="${XSS.s(nombre)}" onerror="this.style.visibility='hidden'" />`;
  },
  badge(estado, bloqueada) {
    if (estado === 'EN_JUEGO')   return '<span class="badge b-live">En vivo</span>';
    if (estado === 'FINALIZADO') return '<span class="badge b-done">Finalizado</span>';
    if (bloqueada)               return '<span class="badge b-lock">🔒 Cerrado</span>';
    return '<span class="badge b-open">Abierto</span>';
  },

  /* Sanitizar un número entero de goles antes de mostrarlo */
  goles(val) {
    const n = parseInt(val);
    return (!isNaN(n) && n >= 0 && n <= 20) ? n : '?';
  },
};

/* ═══════════════════════════════════════════════════════════
   FAB
═══════════════════════════════════════════════════════════ */
const Fab = {
  update() {
    const n   = Object.keys(State.pending).length;
    const fab = document.getElementById('fab');
    document.getElementById('fabn').textContent = n; // textContent — seguro
    fab.style.display = n > 0 ? 'flex' : 'none';
  },

  async saveAll() {
    const keys = Object.keys(State.pending);
    if (!keys.length) return;

    const fab = document.getElementById('fab');
    fab.disabled  = true;
    fab.textContent = '⏳ Guardando...';

    let ok = 0, fail = 0;

    for (const pid of keys) {
      const { golesLocal, golesVisitante } = State.pending[pid];
      if (golesLocal === null || golesVisitante === null) { fail++; continue; }

      const r = await ApiPredicciones.guardar(parseInt(pid), golesLocal, golesVisitante);
      if (r?.ok) {
        State.misPreds[pid] = r.data;
        delete State.pending[pid];
        ok++;
      } else {
        const msg = r?.data?.error ? XSS.s(r.data.error) : `Error al guardar partido ${pid}`;
        Toast.err(msg);
        fail++;
      }
    }

    fab.disabled = false;
    // Reconstruir con textContent para los nodos de texto y solo un span numérico seguro
    fab.innerHTML = '💾 Guardar predicciones ';
    const span = document.createElement('span');
    span.className = 'fabn';
    span.id        = 'fabn';
    span.textContent = Object.keys(State.pending).length;
    fab.appendChild(span);

    if (ok)   Toast.ok(`✅ ${ok} predicción${ok > 1 ? 'es' : ''} guardada${ok > 1 ? 's' : ''}`);
    if (fail) Toast.err(`⚠️ ${fail} no ${fail > 1 ? 'pudieron' : 'pudo'} guardarse`);

    Views.Partidos.refreshStats();
    Fab.update();
    Views.Partidos.render();
  },
};

/* ── Verificación periódica de token expirado (cada 5 min) ── */
setInterval(() => {
  if (State.token === null && document.getElementById('main').style.display !== 'none') {
    Auth.logout();
    Toast.info('Tu sesión expiró. Por favor iniciá sesión nuevamente.');
  }
}, 5 * 60 * 1000);
