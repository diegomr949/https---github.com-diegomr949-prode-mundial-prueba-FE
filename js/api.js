/* ═══════════════════════════════════════════════════════════
   api.js — Capa HTTP · CPCE Mendoza · Prode Mundial 2026

   SEGURIDAD:
   · URL base leída desde <meta name="api-base"> — sin código hardcodeado
   · HTTPS obligatorio en producción
   · Timeout de 15s en cada request
   · Sin logs de tokens ni passwords
   · Validación de inputs antes de cada llamada
═══════════════════════════════════════════════════════════ */

/* ── URL base desde meta tag (configurado en index.html) ── */
const _meta    = document.querySelector('meta[name="api-base"]');
const API_BASE = _meta ? _meta.getAttribute('content').replace(/\/$/, '') : '';

if (!API_BASE) {
  console.error('[API] ⚠ Falta <meta name="api-base"> en el HTML.');
}
if (API_BASE && !API_BASE.startsWith('https://') && location.protocol === 'https:') {
  console.error('[API] ⚠ El backend debe usar HTTPS en producción.');
}

const TIMEOUT_MS = 30_000;

/* ── HTTP helper ── */
async function http(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token   = Store.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_BASE + path, {
      method, headers,
      body:        body ? JSON.stringify(body) : null,
      signal:      ctrl.signal,
      credentials: 'omit',           // nunca enviar cookies cross-origin
    });
    clearTimeout(tid);

    if (res.status === 401) { Auth.logout(); return null; }
    if (res.status === 429) {
      const retry = res.headers.get('Retry-After') || '60';
      Toast.err(`Demasiados intentos. Esperá ${retry} segundos.`);
      return null;
    }

    const txt = await res.text();
    if (!txt) return { ok: res.ok, status: res.status, data: null };
    try { return { ok: res.ok, status: res.status, data: JSON.parse(txt) }; }
    catch { return { ok: res.ok, status: res.status, data: txt }; }

  } catch (e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') Toast.err('El servidor tardó demasiado. Intentá de nuevo.');
    else                          Toast.err('Error de conexión.');
    return null;
  }
}

/* ── Módulos ── */
const ApiAuth = {
  login:    (email, pass)                    => http('/auth/login', 'POST', { email, password: pass }),
  registro: (nombre, email, pass, area)      => http('/auth/registro', 'POST', { nombre, email, password: pass, area: area || null }),
};

const ApiPartidos = {
  getAll: (estado = null) => http('/partidos' + (estado ? `?estado=${encodeURIComponent(estado)}` : '')),
};

const ApiPredicciones = {
  getMias: () => http('/predicciones/mis-predicciones'),
  guardar(pid, gl, gv) {
    // Validación client-side — el backend también valida, esto es defensa en profundidad
    if (!Number.isInteger(pid) || pid <= 0)     return null;
    if (!Number.isInteger(gl) || gl < 0 || gl > 20)  return null;
    if (!Number.isInteger(gv) || gv < 0 || gv > 20)  return null;
    return http('/predicciones', 'POST', { partidoId: pid, golesLocal: gl, golesVisitante: gv });
  },
};

const ApiRanking  = {
  get:              (area = null) => http('/ranking' + (area ? `?area=${encodeURIComponent(area)}` : '')),
  getAreas:         ()            => http('/ranking/areas'),
};

const ApiEquipos  = {
  getAll:       ()  => http('/equipos'),
  getJugadores: (id) => Number.isInteger(id) && id > 0 ? http(`/equipos/${id}/jugadores`) : null,
};

const ApiAdmin = {
  getUsuarios:       ()           => http('/admin/usuarios'),
  getDashboard:      (id)         => Number.isInteger(id) && id > 0 ? http(`/admin/usuarios/${id}/dashboard`) : null,
  resetPassword:     (id, p)      => (Number.isInteger(id) && p?.length >= 6)
                                       ? http(`/admin/usuarios/${id}/reset-password`, 'PUT', { nuevaPassword: p })
                                       : null,
  actualizarArea:    (id, area)   => Number.isInteger(id) && id > 0
                                       ? http(`/admin/usuarios/${id}/area`, 'PUT', { area: area || null })
                                       : null,
  getAreas:          ()           => http('/admin/areas'),
  cargarResultado:   (pid, gl, gv) => http(`/admin/partidos/${pid}/resultado`, 'PUT', { golesLocal: gl, golesVisitante: gv }),
};

const ApiPerfil = {
  cambiarPassword: (actual, nueva) => (actual && nueva?.length >= 6)
    ? http('/perfil/cambiar-password', 'PUT', { passwordActual: actual, nuevaPassword: nueva })
    : null,
};