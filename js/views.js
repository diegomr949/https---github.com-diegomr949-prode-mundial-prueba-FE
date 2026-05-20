/* ═══════════════════════════════════════════════════════════
   views.js — Lógica de todas las vistas de la SPA
   CPCE Mendoza · Prode Mundial 2026
═══════════════════════════════════════════════════════════ */

const Views = {

  /* Dispatcher: carga datos según qué vista se navega */
  load(name, params = {}) {
    switch (name) {
      case 'partidos':    Views.Partidos.load();           break;
      case 'ranking':     Views.Ranking.load();            break;
      case 'selecciones': Views.Selecciones.load();        break;
      case 'perfil':      Views.Perfil.load();             break;
      case 'admin':       Views.Admin.load();              break;
    }
  },

  /* ═══════════════════════════════════════════════
     AUTH VIEW — Login / Registro
  ═══════════════════════════════════════════════ */
  Auth: {
    switchTab(tab) {
      document.getElementById('fl').style.display = tab === 'login' ? '' : 'none';
      document.getElementById('fr').style.display = tab === 'reg'   ? '' : 'none';
      document.querySelectorAll('.atab').forEach((b, i) =>
        b.classList.toggle('active',
          (i === 0 && tab === 'login') || (i === 1 && tab === 'reg')
        )
      );
    },

    async doLogin() {
      const email = document.getElementById('le').value.trim();
      const pass  = document.getElementById('lp').value;
      if (!email || !pass) return Toast.err('Completá todos los campos');

      const btn = document.getElementById('bl');
      btn.disabled = true; btn.textContent = 'Ingresando...';

      const r = await ApiAuth.login(email, pass);
      btn.disabled = false; btn.textContent = 'Ingresar';

      if (!r?.ok) return Toast.err(r?.data?.error || 'Credenciales incorrectas');

      Auth.saveSession(r.data);
      Auth.boot();
    },

    async doReg() {
      const nombre = document.getElementById('rn').value.trim();
      const email  = document.getElementById('re').value.trim();
      const pass   = document.getElementById('rp').value;

      if (!nombre || !email || !pass) return Toast.err('Completá todos los campos');
      if (pass.length < 6) return Toast.err('La contraseña debe tener al menos 6 caracteres');

      const btn = document.getElementById('br');
      btn.disabled = true; btn.textContent = 'Creando cuenta...';

      const r = await ApiAuth.registro(nombre, email, pass);
      btn.disabled = false; btn.textContent = 'Crear cuenta';

      if (!r?.ok) return Toast.err(r?.data?.error || 'Error al registrarse');

      Toast.ok('¡Cuenta creada! Bienvenido/a 🎉');
      Auth.saveSession(r.data);
      Auth.boot();
    },
  },

  /* ═══════════════════════════════════════════════
     FIXTURE — PARTIDOS
  ═══════════════════════════════════════════════ */
  Partidos: {
    async load() {
      document.getElementById('mout').innerHTML = '<div class="spinner"></div>';

      const [rp, rm] = await Promise.all([
        ApiPartidos.getAll(),
        ApiPredicciones.getMias(),
      ]);

      if (!rp?.ok) return Toast.err('No se pudieron cargar los partidos');

      State.partidos = rp.data || [];
      State.misPreds = {};
      (rm?.data || []).forEach(p => { State.misPreds[p.partidoId] = p; });

      Views.Partidos.refreshStats();
      Views.Partidos.render();
    },

    refreshStats() {
      const vals   = Object.values(State.misPreds);
      const pts    = vals.reduce((s, p) => s + (p.puntosObtenidos || 0), 0);
      const plenos = vals.filter(p => p.puntosObtenidos === 3).length;
      const pct    = State.partidos.length
        ? Math.round(vals.length / State.partidos.length * 100) : 0;

      document.getElementById('sp').textContent    = pts;
      document.getElementById('spl').textContent   = plenos;
      document.getElementById('spr').textContent   = vals.length;
      document.getElementById('sprs').textContent  = `de ${State.partidos.length} partidos`;
      document.getElementById('ubp').textContent   = `${pts} pts`;
      document.getElementById('plbl').textContent  = `${vals.length} de ${State.partidos.length} pronosticados`;
      document.getElementById('pbar').style.width  = pct + '%';
      document.getElementById('ppct').textContent  = pct + '%';
    },

    setFilter(f, btn) {
      State.filter = f;
      document.querySelectorAll('#view-partidos .tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Views.Partidos.render();
    },

    render() {
      let lista = State.partidos;
      if (State.filter !== 'todos') lista = lista.filter(p => p.estado === State.filter);

      const out = document.getElementById('mout');
      if (!lista.length) {
        out.innerHTML = `<div class="empty"><div class="eico">🔍</div>No hay partidos en esta categoría</div>`;
        return;
      }

      // Agrupar por grupo
      const grupos = {};
      lista.forEach(p => { (grupos[p.grupo] = grupos[p.grupo] || []).push(p); });

      out.innerHTML = Object.keys(grupos).sort().map(g => `
        <div class="grp-section">
          <div class="grp-label">
            <span class="grp-pill">GRUPO ${g}</span>
            <div class="grp-line"></div>
          </div>
          <div class="mgrid">${grupos[g].map(Views.Partidos.cardHTML).join('')}</div>
        </div>`).join('');
    },

    cardHTML(p) {
      const m  = State.misPreds[p.id];
      const pd = State.pending[p.id];
      const lk = p.prediccionBloqueada;

      // Centro: marcador real o inputs de predicción
      let center = '';
      if (p.estado === 'FINALIZADO') {
        center = `
          <div class="sdisplay">
            <span class="snum">${p.golesLocal ?? '?'}</span>
            <span class="ssep">–</span>
            <span class="snum">${p.golesVisitante ?? '?'}</span>
          </div>`;
      } else {
        const vl = pd?.golesLocal      ?? m?.golesLocalPredichos      ?? '';
        const vv = pd?.golesVisitante  ?? m?.golesVisitantePredichos  ?? '';
        center = `
          <div class="pinputs">
            <input type="number" min="0" max="20" class="pi"
              value="${vl}" placeholder="0" ${lk ? 'disabled' : ''}
              oninput="Views.Partidos.onInput(${p.id},'l',this.value)" />
            <span class="psep">–</span>
            <input type="number" min="0" max="20" class="pi"
              value="${vv}" placeholder="0" ${lk ? 'disabled' : ''}
              oninput="Views.Partidos.onInput(${p.id},'v',this.value)" />
          </div>`;
      }

      // Footer con resultado de mi predicción
      let footer = '';
      if (p.estado === 'FINALIZADO') {
        if (m) {
          footer = `
            <div class="mfooter">
              <span class="my-lbl">Tu pronóstico:
                <span class="my-sc">${m.golesLocalPredichos} – ${m.golesVisitantePredichos}</span>
              </span>
              <span class="pbadge ${Fmt.puntosClass(m.puntosObtenidos)}">
                ${Fmt.puntosLabel(m.puntosObtenidos)}
              </span>
            </div>`;
        } else {
          footer = `
            <div class="mfooter">
              <span class="my-lbl">Sin pronóstico</span>
              <span class="pbadge p0">❌ Sin puntos</span>
            </div>`;
        }
      } else if (pd) {
        footer = `
          <div class="mfooter">
            <span style="color:var(--amber);font-size:12px;font-weight:600">● Cambios sin guardar</span>
          </div>`;
      } else if (m && !lk) {
        footer = `
          <div class="mfooter">
            <span style="color:var(--green);font-size:12px;font-weight:600">
              ✓ Guardado: ${m.golesLocalPredichos}–${m.golesVisitantePredichos}
            </span>
          </div>`;
      } else if (lk && m) {
        footer = `
          <div class="mfooter">
            <span class="my-lbl">Tu pronóstico:
              <span class="my-sc">${m.golesLocalPredichos} – ${m.golesVisitantePredichos}</span>
            </span>
            <span class="pbadge pp">En juego</span>
          </div>`;
      }

      return `
        <div class="mcard ${lk ? 'locked' : ''}">
          <div class="mcard-top">
            <span class="mdate">${Fmt.fecha(p.fechaHora)}</span>
            ${Fmt.badge(p.estado, p.prediccionBloqueada)}
          </div>
          <div class="mteams">
            <div class="team">
              ${Fmt.flag(p.banderaLocal, p.equipoLocal)}
              <div class="tname">${p.equipoLocal}</div>
            </div>
            <div class="mcenter">${center}</div>
            <div class="team">
              ${Fmt.flag(p.banderaVisitante, p.equipoVisitante)}
              <div class="tname">${p.equipoVisitante}</div>
            </div>
          </div>
          ${footer}
        </div>`;
    },

    onInput(pid, side, val) {
      if (!State.pending[pid]) {
        const m = State.misPreds[pid];
        State.pending[pid] = {
          golesLocal:     m?.golesLocalPredichos     ?? null,
          golesVisitante: m?.golesVisitantePredichos ?? null,
        };
      }
      State.pending[pid][side === 'l' ? 'golesLocal' : 'golesVisitante'] =
        val === '' ? null : parseInt(val);
      Fab.update();
    },
  },

  /* ═══════════════════════════════════════════════
     RANKING
  ═══════════════════════════════════════════════ */
  Ranking: {
    async load() {
      document.getElementById('rout').innerHTML = '<div class="spinner"></div>';
      const r = await ApiRanking.get();
      if (!r?.ok) return Toast.err('Error al cargar el ranking');

      State.ranking = r.data || [];

      // Actualizar mi posición en las stats del fixture
      const mio = State.ranking.find(u => u.email === State.user?.email);
      const posEl = document.getElementById('spos');
      if (posEl) posEl.textContent = mio ? `#${mio.posicion}` : '—';

      Views.Ranking.render(State.ranking);
    },

    render(data) {
      if (!data.length) {
        document.getElementById('rout').innerHTML =
          `<div class="empty"><div class="eico">📊</div>Aún no hay datos en el ranking</div>`;
        return;
      }

      const myEmail = State.user?.email;
      const rows = data.map(u => `
        <tr class="${u.email === myEmail ? 'isme' : ''}">
          <td><div class="rpos">${Fmt.posicion(u.posicion)}</div></td>
          <td>
            <div class="rname">
              ${u.nombre}
              ${u.email === myEmail ? '<span class="metag">vos</span>' : ''}
            </div>
            <div class="remail">${u.email}</div>
          </td>
          <td><span class="rpts">${u.puntosTotales}</span></td>
          <td><strong>${u.plenosTotales}</strong></td>
          <td style="color:var(--tmut);font-size:13px">${u.porcentajeAciertos ?? 0}%</td>
          <td style="color:var(--tmut);font-size:13px">${u.partidosPredichos}</td>
        </tr>`).join('');

      document.getElementById('rout').innerHTML = `
        <div class="rtable-wrap">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th style="text-align:left">Participante</th>
                <th>Puntos</th>
                <th>Plenos ⭐</th>
                <th>% Aciertos</th>
                <th>Predicciones</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="margin-top:14px;padding:12px 16px;background:var(--white);
                    border:1px solid var(--border);border-radius:var(--r);
                    font-size:12px;color:var(--tmut);box-shadow:var(--sh)">
          <strong style="color:var(--tmid)">Sistema de puntos:</strong>
          &nbsp;🎯 Resultado exacto = 3 pts &nbsp;·&nbsp;
          👍 Ganador/empate = 1 pt &nbsp;·&nbsp;
          ❌ Sin acierto = 0 pts &nbsp;·&nbsp;
          Desempate: más plenos → registro más antiguo
        </div>`;
    },
  },

  /* ═══════════════════════════════════════════════
     SELECCIONES — Estadísticas y jugadores
  ═══════════════════════════════════════════════ */
  Selecciones: {
    all: [],
    selected: null,

    async load() {
      document.getElementById('sel-out').innerHTML = '<div class="spinner"></div>';
      const r = await ApiEquipos.getAll();

      if (!r?.ok) {
        // Si el endpoint no existe aún, usamos datos del fixture
        Views.Selecciones.loadFromFixture();
        return;
      }

      Views.Selecciones.all = r.data || [];
      Views.Selecciones.render(Views.Selecciones.all);
    },

    // Fallback: construye la lista de equipos a partir del fixture ya cargado
    loadFromFixture() {
      const equiposMap = {};
      State.partidos.forEach(p => {
        if (!equiposMap[p.equipoLocal]) {
          equiposMap[p.equipoLocal] = {
            id: null, nombre: p.equipoLocal,
            grupo: p.grupo, banderaUrl: p.banderaLocal,
          };
        }
        if (!equiposMap[p.equipoVisitante]) {
          equiposMap[p.equipoVisitante] = {
            id: null, nombre: p.equipoVisitante,
            grupo: p.grupo, banderaUrl: p.banderaVisitante,
          };
        }
      });

      // Si tampoco hay fixture, usar listado hardcodeado de grupos
      if (!Object.keys(equiposMap).length) {
        Views.Selecciones.renderSinDatos();
        return;
      }

      Views.Selecciones.all = Object.values(equiposMap);
      Views.Selecciones.render(Views.Selecciones.all);
    },

    renderSinDatos() {
      document.getElementById('sel-out').innerHTML =
        `<div class="empty"><div class="eico">🏳️</div>
         Cargá los partidos primero para ver las selecciones</div>`;
    },

    render(equipos) {
      if (!equipos.length) { Views.Selecciones.renderSinDatos(); return; }

      // Agrupar por grupo
      const grupos = {};
      equipos.forEach(e => { (grupos[e.grupo] = grupos[e.grupo] || []).push(e); });

      const cards = Object.keys(grupos).sort().map(g => `
        <div class="grp-section">
          <div class="grp-label">
            <span class="grp-pill">GRUPO ${g}</span>
            <div class="grp-line"></div>
          </div>
          <div class="equipos-grid">
            ${grupos[g].map(Views.Selecciones.equipoCardHTML).join('')}
          </div>
        </div>`).join('');

      document.getElementById('sel-out').innerHTML = `
        <div class="equipos-search">
          <span class="ico">🔍</span>
          <input type="text" placeholder="Buscar selección..."
            oninput="Views.Selecciones.search(this.value)" />
        </div>
        <div id="sel-grupos">${cards}</div>`;
    },

    equipoCardHTML(e) {
      // Calcular stats del equipo desde los partidos cargados
      const stats = Views.Selecciones.calcStats(e.nombre);
      return `
        <div class="equipo-card" onclick="Views.Selecciones.showDetail('${e.nombre}')">
          <div class="eq-top">
            <img class="eq-flag" src="${e.banderaUrl || ''}" alt="${e.nombre}"
                 onerror="this.style.visibility='hidden'" />
            <div>
              <div class="eq-name">${e.nombre}</div>
              <div class="eq-grp">Grupo ${e.grupo}</div>
            </div>
          </div>
          <div class="eq-stats">
            <div class="eq-stat">
              <div class="eq-stat-v">${stats.pj}</div>
              <div class="eq-stat-l">PJ</div>
            </div>
            <div class="eq-stat">
              <div class="eq-stat-v">${stats.pts}</div>
              <div class="eq-stat-l">PTS</div>
            </div>
            <div class="eq-stat">
              <div class="eq-stat-v">${stats.gf}</div>
              <div class="eq-stat-l">GF</div>
            </div>
            <div class="eq-stat">
              <div class="eq-stat-v">${stats.gc}</div>
              <div class="eq-stat-l">GC</div>
            </div>
          </div>
        </div>`;
    },

    // Calcula stats de un equipo a partir de los partidos finalizados
    calcStats(nombre) {
      const stats = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      State.partidos
        .filter(p => p.estado === 'FINALIZADO' &&
                     (p.equipoLocal === nombre || p.equipoVisitante === nombre))
        .forEach(p => {
          const esLocal = p.equipoLocal === nombre;
          const gf = esLocal ? p.golesLocal  : p.golesVisitante;
          const gc = esLocal ? p.golesVisitante : p.golesLocal;
          stats.pj++;
          stats.gf += gf ?? 0;
          stats.gc += gc ?? 0;
          if (gf > gc)      { stats.pg++; stats.pts += 3; }
          else if (gf === gc){ stats.pe++; stats.pts += 1; }
          else                { stats.pp++; }
        });
      return stats;
    },

    search(q) {
      const txt = q.toLowerCase();
      const filtrado = Views.Selecciones.all.filter(e =>
        e.nombre.toLowerCase().includes(txt) || e.grupo.toLowerCase().includes(txt)
      );
      // Re-render solo las cards dentro del contenedor
      const grupos = {};
      filtrado.forEach(e => { (grupos[e.grupo] = grupos[e.grupo] || []).push(e); });

      document.getElementById('sel-grupos').innerHTML = Object.keys(grupos).sort().map(g => `
        <div class="grp-section">
          <div class="grp-label">
            <span class="grp-pill">GRUPO ${g}</span>
            <div class="grp-line"></div>
          </div>
          <div class="equipos-grid">
            ${grupos[g].map(Views.Selecciones.equipoCardHTML).join('')}
          </div>
        </div>`).join('') || '<div class="empty"><div class="eico">🔍</div>Sin resultados</div>';
    },

    async showDetail(nombre) {
      const equipo = Views.Selecciones.all.find(e => e.nombre === nombre);
      if (!equipo) return;

      Views.Selecciones.selected = equipo;
      const stats = Views.Selecciones.calcStats(nombre);

      // Intentar cargar jugadores desde API, si no hay endpoint usamos placeholder
      let jugadoresHTML = '<div class="empty" style="padding:20px"><div class="eico">⏳</div>Plantilla no disponible aún</div>';

      if (equipo.id) {
        const rj = await ApiEquipos.getJugadores(equipo.id);
        if (rj?.ok && rj.data?.length) {
          jugadoresHTML = Views.Selecciones.jugadoresHTML(rj.data);
        }
      }

      // Partidos del equipo en el fixture
      const misPartidos = State.partidos
        .filter(p => p.equipoLocal === nombre || p.equipoVisitante === nombre);

      const partidosHTML = misPartidos.map(p => {
        const rival    = p.equipoLocal === nombre ? p.equipoVisitante : p.equipoLocal;
        const eLocal   = p.equipoLocal === nombre;
        const gf       = eLocal ? p.golesLocal : p.golesVisitante;
        const gc       = eLocal ? p.golesVisitante : p.golesLocal;
        const resultado = p.estado === 'FINALIZADO'
          ? `<strong>${gf} – ${gc}</strong>` : Fmt.fechaCorta(p.fechaHora);
        return `
          <div class="pred-row">
            <span style="color:var(--tmut);font-size:11px">${eLocal ? 'vs.' : 'vs.'}</span>
            <span class="pred-teams">${rival}</span>
            <span class="pred-score">${resultado}</span>
            ${Fmt.badge(p.estado, p.prediccionBloqueada)}
          </div>`;
      }).join('') || '<div style="color:var(--tmut);font-size:13px">Sin partidos cargados</div>';

      document.getElementById('sel-detail-content').innerHTML = `
        <div class="eq-detail">
          <div class="eq-detail-head">
            <img class="eq-detail-flag" src="${equipo.banderaUrl || ''}"
                 alt="${equipo.nombre}" onerror="this.style.display='none'" />
            <div>
              <div class="eq-detail-name">${equipo.nombre}</div>
              <div class="eq-detail-sub">Grupo ${equipo.grupo} · FIFA World Cup 2026</div>
            </div>
          </div>
          <div class="eq-detail-body">

            <!-- Stats en el torneo -->
            <div style="margin-bottom:16px">
              <div style="font-family:var(--disp);font-size:16px;font-weight:800;
                          color:var(--navy);margin-bottom:12px">Rendimiento en el torneo</div>
              <div class="eq-info-grid">
                <div class="eq-info-item">
                  <div class="eq-info-val">${stats.pj}</div>
                  <div class="eq-info-lbl">Jugados</div>
                </div>
                <div class="eq-info-item">
                  <div class="eq-info-val">${stats.pg}</div>
                  <div class="eq-info-lbl">Ganados</div>
                </div>
                <div class="eq-info-item">
                  <div class="eq-info-val">${stats.pe}</div>
                  <div class="eq-info-lbl">Empatados</div>
                </div>
                <div class="eq-info-item">
                  <div class="eq-info-val">${stats.pp}</div>
                  <div class="eq-info-lbl">Perdidos</div>
                </div>
                <div class="eq-info-item">
                  <div class="eq-info-val">${stats.gf}</div>
                  <div class="eq-info-lbl">Goles a favor</div>
                </div>
                <div class="eq-info-item">
                  <div class="eq-info-val">${stats.gc}</div>
                  <div class="eq-info-lbl">Goles en contra</div>
                </div>
                <div class="eq-info-item">
                  <div class="eq-info-val" style="color:var(--blue)">${stats.pts}</div>
                  <div class="eq-info-lbl">Puntos</div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Fixture del equipo -->
            <div style="margin-bottom:16px">
              <div style="font-family:var(--disp);font-size:16px;font-weight:800;
                          color:var(--navy);margin-bottom:12px">Fixture</div>
              <div class="pred-list">${partidosHTML}</div>
            </div>

            <div class="divider"></div>

            <!-- Jugadores -->
            <div>
              <div style="font-family:var(--disp);font-size:16px;font-weight:800;
                          color:var(--navy);margin-bottom:12px">Plantilla convocada</div>
              ${jugadoresHTML}
            </div>
          </div>
        </div>`;

      Modal.open('modal-sel-detail');
    },

    jugadoresHTML(jugadores) {
      // Agrupar por posición
      const orden = ['PORTERO', 'DEFENSA', 'MEDIOCAMPO', 'DELANTERO'];
      const grupos = {};
      jugadores.forEach(j => { (grupos[j.posicion] = grupos[j.posicion] || []).push(j); });

      return orden.filter(pos => grupos[pos]?.length).map(pos => {
        const info = Fmt.posicionJugador(pos);
        const lista = grupos[pos].sort((a, b) => (a.nroCamiseta || 99) - (b.nroCamiseta || 99));
        return `
          <div style="margin-bottom:14px">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                        letter-spacing:.8px;color:var(--tmut);margin-bottom:8px">
              <span class="pos-badge ${info.cls}">${info.label}</span>
              &nbsp;${pos.charAt(0) + pos.slice(1).toLowerCase()}s
            </div>
            <div class="jugadores-grid">
              ${lista.map(j => `
                <div class="jugador-card">
                  <div class="jug-num">${j.nroCamiseta || '—'}</div>
                  <div>
                    <div class="jug-name">
                      ${j.nombre}
                      ${j.esEstrella ? '<span class="estrella">⭐</span>' : ''}
                    </div>
                    <span class="pos-badge ${info.cls}">${info.label}</span>
                  </div>
                </div>`).join('')}
            </div>
          </div>`;
      }).join('');
    },
  },

  /* ═══════════════════════════════════════════════
     MI PERFIL
  ═══════════════════════════════════════════════ */
  Perfil: {
    async load() {
      const out = document.getElementById('perfil-out');
      out.innerHTML = '<div class="spinner"></div>';

      const user = State.user;
      if (!user) return;

      // Stats del usuario (desde misPreds)
      const vals   = Object.values(State.misPreds);
      const pts    = vals.reduce((s, p) => s + (p.puntosObtenidos || 0), 0);
      const plenos = vals.filter(p => p.puntosObtenidos === 3).length;
      const tend   = vals.filter(p => p.puntosObtenidos === 1).length;
      const fallos = vals.filter(p => p.puntosObtenidos === 0).length;

      // Mi posición en el ranking
      const mio    = State.ranking.find(u => u.email === user.email);
      const pos    = mio ? `#${mio.posicion}` : '—';

      // Si no tenemos predicciones cargadas, las pedimos
      if (!vals.length) await Views.Partidos.load();

      const predsOrdenadas = vals
        .filter(p => {
          const partido = State.partidos.find(pt => pt.id === p.partidoId);
          return partido?.estado === 'FINALIZADO';
        })
        .sort((a, b) => new Date(b.fechaCarga) - new Date(a.fechaCarga));

      const historialHTML = predsOrdenadas.length
        ? predsOrdenadas.slice(0, 20).map(p => {
            const partido = State.partidos.find(pt => pt.id === p.partidoId);
            if (!partido) return '';
            return `
              <div class="pred-row">
                <div class="pred-teams">
                  ${partido.equipoLocal} vs. ${partido.equipoVisitante}
                </div>
                <span class="pred-score" style="white-space:nowrap">
                  Real: ${partido.golesLocal ?? '?'}–${partido.golesVisitante ?? '?'}
                </span>
                <span class="pred-mi">${p.golesLocalPredichos}–${p.golesVisitantePredichos}</span>
                <span class="pbadge ${Fmt.puntosClass(p.puntosObtenidos)}">
                  ${Fmt.puntosLabel(p.puntosObtenidos)}
                </span>
              </div>`;
          }).join('')
        : '<div style="color:var(--tmut);font-size:13px">Aún no tenés predicciones finalizadas</div>';

      out.innerHTML = `
        <!-- Header de perfil -->
        <div class="perfil-header">
          <div class="perfil-av">${Fmt.iniciales(user.nombre)}</div>
          <div class="perfil-info">
            <h2>${user.nombre}</h2>
            <p>${user.email}</p>
            <p style="margin-top:4px">
              <span class="ucrole ${user.rol === 'ROLE_ADMIN' ? 'radm' : 'rusr'}">
                ${user.rol === 'ROLE_ADMIN' ? 'Administrador' : 'Participante'}
              </span>
            </p>
          </div>
          <div class="perfil-badge">
            <div class="val">${pos}</div>
            <div class="lbl">Posición</div>
          </div>
        </div>

        <!-- Stats detalladas -->
        <div class="stats-row" style="margin-bottom:20px">
          <div class="scard">
            <div class="slabel">Puntos totales</div>
            <div class="sval">${pts}</div>
            <div class="ssub">acumulados</div>
          </div>
          <div class="scard accent-amber">
            <div class="slabel">Plenos 🎯</div>
            <div class="sval amber">${plenos}</div>
            <div class="ssub">resultado exacto</div>
          </div>
          <div class="scard accent-green">
            <div class="slabel">Tendencias 👍</div>
            <div class="sval green">${tend}</div>
            <div class="ssub">ganador/empate</div>
          </div>
          <div class="scard">
            <div class="slabel">Fallos ❌</div>
            <div class="sval navy">${fallos}</div>
            <div class="ssub">sin acierto</div>
          </div>
          <div class="scard">
            <div class="slabel">Predicciones</div>
            <div class="sval">${vals.length}</div>
            <div class="ssub">de ${State.partidos.length} partidos</div>
          </div>
        </div>

        <!-- Historial -->
        <div class="panel" style="margin-bottom:20px">
          <div class="panel-head">
            <div class="panel-title">📋 Historial de predicciones</div>
            <span style="font-size:12px;color:var(--tmut)">últimas ${Math.min(predsOrdenadas.length, 20)}</span>
          </div>
          <div class="panel-body">
            <div class="pred-list">${historialHTML}</div>
          </div>
        </div>

        <!-- Cambiar contraseña -->
        <div class="pass-section">
          <h3>🔑 Cambiar contraseña</h3>
          <div class="pass-grid">
            <div class="field" style="margin:0">
              <label>Contraseña actual</label>
              <input type="password" id="pass-actual" placeholder="••••••••" />
            </div>
            <div class="field" style="margin:0">
              <label>Nueva contraseña</label>
              <input type="password" id="pass-nueva" placeholder="mín. 6 caracteres" />
            </div>
            <div class="field" style="margin:0">
              <label>Confirmar nueva</label>
              <input type="password" id="pass-confirm" placeholder="repetir contraseña" />
            </div>
            <button class="btn-sec" onclick="Views.Perfil.cambiarPassword()">
              Actualizar
            </button>
          </div>
        </div>`;
    },

    async cambiarPassword() {
      const actual   = document.getElementById('pass-actual').value;
      const nueva    = document.getElementById('pass-nueva').value;
      const confirm  = document.getElementById('pass-confirm').value;

      if (!actual || !nueva || !confirm) return Toast.err('Completá todos los campos');
      if (nueva.length < 6) return Toast.err('La nueva contraseña debe tener al menos 6 caracteres');
      if (nueva !== confirm) return Toast.err('Las contraseñas no coinciden');

      const r = await ApiPerfil.cambiarPassword(actual, nueva);
      if (!r?.ok) return Toast.err(r?.data?.error || 'Error al cambiar la contraseña');

      Toast.ok('✅ Contraseña actualizada correctamente');
      document.getElementById('pass-actual').value  = '';
      document.getElementById('pass-nueva').value   = '';
      document.getElementById('pass-confirm').value = '';
    },
  },

  /* ═══════════════════════════════════════════════
     ADMIN
  ═══════════════════════════════════════════════ */
  Admin: {
    load() {
      Views.Admin.loadUsuarios();
    },

    switchTab(tab, btn) {
      document.querySelectorAll('.atab2').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('apu').style.display = tab === 'u' ? '' : 'none';
      document.getElementById('apr').style.display = tab === 'r' ? '' : 'none';
      if (tab === 'u') Views.Admin.loadUsuarios();
      if (tab === 'r') Views.Admin.loadResultados();
    },

    /* ── Usuarios ── */
    async loadUsuarios() {
      document.getElementById('apu').innerHTML = '<div class="spinner"></div>';
      const r = await ApiAdmin.getUsuarios();
      if (!r?.ok) return Toast.err('Error al cargar usuarios');

      const users = r.data || [];
      if (!users.length) {
        document.getElementById('apu').innerHTML =
          '<div class="empty"><div class="eico">👥</div>Sin usuarios registrados</div>';
        return;
      }

      // Barra de resumen rápido
      const totalPts   = users.reduce((s, u) => s + u.puntosTotales, 0);
      const totalPreds = users.reduce((s, u) => s + u.partidosPredichos, 0);

      document.getElementById('apu').innerHTML = `
        <!-- Resumen -->
        <div class="stats-row" style="margin-bottom:20px">
          <div class="scard">
            <div class="slabel">Participantes</div>
            <div class="sval">${users.filter(u => u.rol !== 'ROLE_ADMIN').length}</div>
            <div class="ssub">registrados</div>
          </div>
          <div class="scard">
            <div class="slabel">Total predicciones</div>
            <div class="sval">${totalPreds}</div>
            <div class="ssub">en el sistema</div>
          </div>
          <div class="scard accent-amber">
            <div class="slabel">Puntos repartidos</div>
            <div class="sval amber">${totalPts}</div>
            <div class="ssub">acumulados</div>
          </div>
        </div>

        <!-- Cards de usuarios -->
        <div class="agrid">
          ${users.map(Views.Admin.userCardHTML).join('')}
        </div>`;
    },

    userCardHTML(u) {
      const ini  = Fmt.iniciales(u.nombre);
      const adm  = u.rol === 'ROLE_ADMIN';
      return `
        <div class="ucard">
          <div class="uchead">
            <div class="ucav">${ini}</div>
            <div>
              <div class="ucname">${u.nombre}</div>
              <div class="ucemail">${u.email}</div>
            </div>
            <span class="ucrole ${adm ? 'radm' : 'rusr'}">${adm ? 'Admin' : 'Usuario'}</span>
          </div>
          <div class="ucstats">
            <div><div class="usv">${u.puntosTotales}</div><div class="usl">Puntos</div></div>
            <div><div class="usv">${u.plenosTotales}</div><div class="usl">Plenos</div></div>
            <div><div class="usv">${u.partidosPredichos}</div><div class="usl">Pred.</div></div>
            <div><div class="usv">${u.partidosPendientes}</div><div class="usl">Pend.</div></div>
          </div>
          <div class="ucact">
            <button class="btnsm" onclick="Views.Admin.openReset(${u.id},'${u.nombre.replace(/'/g,"\\'")}')">
              🔑 Reset contraseña
            </button>
            <button class="btnsm" onclick="Views.Admin.verDashboard(${u.id},'${u.nombre.replace(/'/g,"\\'")}')">
              👁 Ver predicciones
            </button>
          </div>
        </div>`;
    },

    openReset(id, nombre) {
      State.resetId = id;
      document.getElementById('mresub').textContent = `Nueva contraseña para: ${nombre}`;
      document.getElementById('mpass').value = '';
      Modal.open('modal-reset');
    },

    async confirmReset() {
      const pass = document.getElementById('mpass').value;
      if (pass.length < 6) return Toast.err('Mínimo 6 caracteres');
      const r = await ApiAdmin.resetPassword(State.resetId, pass);
      if (!r?.ok) return Toast.err('Error al resetear contraseña');
      Modal.close();
      Toast.ok('✅ Contraseña actualizada correctamente');
    },

    /* ── Dashboard de usuario individual ── */
    async verDashboard(id, nombre) {
      // Mostrar modal con spinner mientras carga
      document.getElementById('mdash-title').textContent = nombre;
      document.getElementById('mdash-body').innerHTML    = '<div class="spinner"></div>';
      Modal.open('modal-dashboard');

      const r = await ApiAdmin.getDashboardUsuario(id);
      if (!r?.ok) {
        document.getElementById('mdash-body').innerHTML =
          '<div class="empty"><div class="eico">⚠️</div>Error al cargar datos</div>';
        return;
      }

      const u = r.data;
      const predsHTML = u.predicciones?.length
        ? u.predicciones.map(p => {
            const partido = State.partidos.find(pt => pt.id === p.partidoId);
            const teams   = partido
              ? `${partido.equipoLocal} vs. ${partido.equipoVisitante}`
              : `Partido #${p.partidoId}`;
            return `
              <div class="pred-row">
                <span class="pred-teams">${teams}</span>
                <span class="pred-mi">${p.golesLocalPredichos}–${p.golesVisitantePredichos}</span>
                <span class="pbadge ${Fmt.puntosClass(p.puntosObtenidos)}">
                  ${p.puntosObtenidos !== null ? Fmt.puntosLabel(p.puntosObtenidos) : '— Pendiente'}
                </span>
              </div>`;
          }).join('')
        : '<div style="color:var(--tmut);font-size:13px">Sin predicciones cargadas</div>';

      document.getElementById('mdash-body').innerHTML = `
        <div class="stats-row" style="margin-bottom:16px">
          <div class="scard"><div class="slabel">Puntos</div>
            <div class="sval">${u.puntosTotales}</div></div>
          <div class="scard accent-amber"><div class="slabel">Plenos</div>
            <div class="sval amber">${u.plenosTotales}</div></div>
          <div class="scard"><div class="slabel">Predicciones</div>
            <div class="sval">${u.partidosPredichos}</div></div>
          <div class="scard"><div class="slabel">Pendientes</div>
            <div class="sval navy">${u.partidosPendientes}</div></div>
        </div>
        <div class="pred-list">${predsHTML}</div>`;
    },

    /* ── Carga de resultados ── */
    async loadResultados() {
      document.getElementById('apr').innerHTML = '<div class="spinner"></div>';

      // Traer EN_JUEGO primero, sino PENDIENTE
      let r  = await ApiPartidos.getAll('EN_JUEGO');
      let ps = r?.data || [];
      if (!ps.length) {
        r  = await ApiPartidos.getAll('PENDIENTE');
        ps = (r?.data || []).slice(0, 24);
      }

      if (!ps.length) {
        document.getElementById('apr').innerHTML =
          '<div class="empty"><div class="eico">✅</div>No hay partidos pendientes de resultado</div>';
        return;
      }

      document.getElementById('apr').innerHTML = `
        <div style="background:var(--abg);border:1px solid #f0c060;border-radius:var(--r);
                    padding:11px 15px;margin-bottom:18px;font-size:13px;color:var(--amber)">
          ⚠️ Al confirmar un resultado se calcularán los puntos de todos los participantes.
          Esta acción no se puede deshacer.
        </div>
        <div class="rlist">
          ${ps.map(p => {
            const d = Fmt.fechaCorta(p.fechaHora);
            return `
              <div class="rentry">
                <div style="flex:1;min-width:180px">
                  <div class="rteams">${p.equipoLocal} vs. ${p.equipoVisitante}</div>
                  <div class="rdate">
                    Grupo ${p.grupo} — ${d}
                    <span class="badge ${p.estado === 'EN_JUEGO' ? 'b-live' : 'b-open'}"
                          style="margin-left:6px">${p.estado}</span>
                  </div>
                </div>
                <div class="rinputs">
                  <img src="${p.banderaLocal}" style="width:22px;height:15px;
                       border-radius:2px;object-fit:cover"
                       onerror="this.style.display='none'" />
                  <input type="number" min="0" max="20" class="ri"
                         id="rl-${p.id}" placeholder="0" />
                  <span style="color:var(--tmut)">–</span>
                  <input type="number" min="0" max="20" class="ri"
                         id="rv-${p.id}" placeholder="0" />
                  <img src="${p.banderaVisitante}" style="width:22px;height:15px;
                       border-radius:2px;object-fit:cover"
                       onerror="this.style.display='none'" />
                </div>
                <button class="btnok" onclick="Views.Admin.confirmarResultado(${p.id})">
                  ✓ Confirmar
                </button>
              </div>`;
          }).join('')}
        </div>`;
    },

    async confirmarResultado(pid) {
      const l = document.getElementById(`rl-${pid}`).value;
      const v = document.getElementById(`rv-${pid}`).value;
      if (l === '' || v === '') return Toast.err('Ingresá ambos valores');

      const r = await ApiAdmin.cargarResultado(pid, parseInt(l), parseInt(v));
      if (!r?.ok) return Toast.err(r?.data?.error || 'Error al cargar resultado');

      Toast.ok('✅ Resultado cargado · Puntos calculados automáticamente');
      Views.Admin.loadResultados();

      // Refrescar partidos en background para mantener datos actualizados
      ApiPartidos.getAll().then(rp => {
        if (rp?.ok) State.partidos = rp.data || [];
      });
    },
  },
};
