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
      case 'reglamento':  Views.Reglamento.load();         break;
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
      const area   = document.getElementById('ra').value.trim();
      const pass   = document.getElementById('rp').value;

      if (!nombre || !email || !pass) return Toast.err('Completá todos los campos obligatorios');
      if (pass.length < 6) return Toast.err('La contraseña debe tener al menos 6 caracteres');

      const btn = document.getElementById('br');
      btn.disabled = true; btn.textContent = 'Creando cuenta...';

      const r = await ApiAuth.registro(nombre, email, pass, area || null);
      btn.disabled = false; btn.textContent = 'Crear cuenta';

      if (!r?.ok) return Toast.err(r?.data?.error || 'Error al registrarse');

      Toast.ok('¡Cuenta creada! Bienvenido/a 🎉');
      Auth.saveSession(r.data);
      Auth.boot();
    },
  },

  /* ═══════════════════════════════════════════════
     REGLAMENTO
  ═══════════════════════════════════════════════ */
  Reglamento: {
    load() {
      const out = document.getElementById('reglamento-content');
      if (!out) return;
      out.innerHTML = Views.Reglamento.html();
    },

    html() {
      return `
        <!-- ══ HERO ══ -->
        <div style="background:linear-gradient(135deg,var(--navy) 0%,var(--blue) 100%);
                    border-radius:var(--rl);padding:32px 36px;margin-bottom:24px;
                    display:flex;align-items:center;gap:24px;flex-wrap:wrap">
          <div style="font-size:56px;line-height:1;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3))">🏆</div>
          <div>
            <div style="font-family:var(--disp);font-size:clamp(24px,4vw,36px);
                        font-weight:800;color:#fff;letter-spacing:.5px;line-height:1">
              PRODE MUNDIAL 2026
            </div>
            <div style="font-size:14px;color:rgba(255,255,255,.7);margin-top:6px">
              Reglamento oficial · Consejo Profesional de Ciencias Económicas de Mendoza
            </div>
            <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
              <span style="background:rgba(255,255,255,.15);color:#fff;font-size:12px;
                           font-weight:600;padding:4px 12px;border-radius:20px;
                           border:1px solid rgba(255,255,255,.25)">
                📅 Junio – Julio 2026
              </span>
              <span style="background:rgba(255,255,255,.15);color:#fff;font-size:12px;
                           font-weight:600;padding:4px 12px;border-radius:20px;
                           border:1px solid rgba(255,255,255,.25)">
                🏟️ 48 selecciones · 12 grupos
              </span>
              <span style="background:rgba(255,255,255,.15);color:#fff;font-size:12px;
                           font-weight:600;padding:4px 12px;border-radius:20px;
                           border:1px solid rgba(255,255,255,.25)">
                🎯 Uso interno CPCE Mendoza
              </span>
            </div>
          </div>
        </div>

        <!-- ══ PUNTUACIÓN — la sección más importante ══ -->
        <div style="background:var(--white);border:1px solid var(--border);
                    border-radius:var(--rl);overflow:hidden;
                    box-shadow:var(--shm);margin-bottom:20px">
          <div style="background:var(--navy);padding:16px 24px;
                      display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🎯</span>
            <span style="font-family:var(--disp);font-size:20px;font-weight:800;
                         color:#fff;letter-spacing:.5px">SISTEMA DE PUNTUACIÓN</span>
          </div>
          <div style="padding:20px 24px">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
                        gap:14px;margin-bottom:20px">

              <!-- 3 pts -->
              <div style="background:var(--abg);border:2px solid #f0c060;
                          border-radius:var(--r);padding:20px;text-align:center">
                <div style="font-family:var(--disp);font-size:52px;font-weight:800;
                             color:var(--amber);line-height:1">3</div>
                <div style="font-size:13px;font-weight:700;color:var(--amber);
                             text-transform:uppercase;letter-spacing:1px;margin-top:2px">
                  PUNTOS
                </div>
                <div style="font-size:13px;font-weight:600;color:var(--text);
                             margin-top:10px">Resultado exacto</div>
                <div style="font-size:12px;color:var(--tmut);margin-top:4px;line-height:1.4">
                  Acertás los goles exactos de ambos equipos
                </div>
                <div style="margin-top:10px;background:var(--white);border-radius:6px;
                             padding:6px 10px;font-size:12px;color:var(--tmid);
                             border:1px solid #f0c060">
                  Ej: predecís <strong>2-1</strong> y termina <strong>2-1</strong>
                </div>
              </div>

              <!-- 1 pt -->
              <div style="background:var(--light);border:2px solid #a0c0e8;
                          border-radius:var(--r);padding:20px;text-align:center">
                <div style="font-family:var(--disp);font-size:52px;font-weight:800;
                             color:var(--blue);line-height:1">1</div>
                <div style="font-size:13px;font-weight:700;color:var(--blue);
                             text-transform:uppercase;letter-spacing:1px;margin-top:2px">
                  PUNTO
                </div>
                <div style="font-size:13px;font-weight:600;color:var(--text);
                             margin-top:10px">Tendencia correcta</div>
                <div style="font-size:12px;color:var(--tmut);margin-top:4px;line-height:1.4">
                  Acertás quién gana o que hay empate, pero no los goles exactos
                </div>
                <div style="margin-top:10px;background:var(--white);border-radius:6px;
                             padding:6px 10px;font-size:12px;color:var(--tmid);
                             border:1px solid #a0c0e8">
                  Ej: predecís <strong>2-0</strong> y termina <strong>1-0</strong>
                </div>
              </div>

              <!-- 0 pts -->
              <div style="background:var(--rbg);border:2px solid #f0a0a0;
                          border-radius:var(--r);padding:20px;text-align:center">
                <div style="font-family:var(--disp);font-size:52px;font-weight:800;
                             color:var(--red);line-height:1">0</div>
                <div style="font-size:13px;font-weight:700;color:var(--red);
                             text-transform:uppercase;letter-spacing:1px;margin-top:2px">
                  PUNTOS
                </div>
                <div style="font-size:13px;font-weight:600;color:var(--text);
                             margin-top:10px">Sin acierto</div>
                <div style="font-size:12px;color:var(--tmut);margin-top:4px;line-height:1.4">
                  No acertás ni el resultado ni quién gana o empata
                </div>
                <div style="margin-top:10px;background:var(--white);border-radius:6px;
                             padding:6px 10px;font-size:12px;color:var(--tmid);
                             border:1px solid #f0a0a0">
                  Ej: predecís <strong>2-0</strong> y termina <strong>0-1</strong>
                </div>
              </div>

            </div>

            <!-- Tabla de ejemplos -->
            <div style="background:var(--bg);border-radius:var(--r);overflow:hidden;
                        border:1px solid var(--border)">
              <div style="padding:10px 16px;border-bottom:1px solid var(--border);
                          font-size:12px;font-weight:700;text-transform:uppercase;
                          letter-spacing:.8px;color:var(--tmut)">
                📊 Ejemplos de puntuación
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead>
                  <tr style="background:var(--white)">
                    <th style="padding:10px 14px;text-align:left;color:var(--tmid);
                                font-weight:600;border-bottom:1px solid var(--border)">Resultado real</th>
                    <th style="padding:10px 14px;text-align:left;color:var(--tmid);
                                font-weight:600;border-bottom:1px solid var(--border)">Tu predicción</th>
                    <th style="padding:10px 14px;text-align:center;color:var(--tmid);
                                font-weight:600;border-bottom:1px solid var(--border)">Puntos</th>
                    <th style="padding:10px 14px;text-align:left;color:var(--tmid);
                                font-weight:600;border-bottom:1px solid var(--border)">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  ${[
                    ['2 – 1','2 – 1','🎯 3','Resultado exacto — ¡pleno!'],
                    ['3 – 0','1 – 0','👍 1','Acertaste que ganaba el local'],
                    ['1 – 1','2 – 2','👍 1','Acertaste el empate'],
                    ['0 – 0','0 – 0','🎯 3','Empate exacto — ¡pleno!'],
                    ['1 – 2','2 – 0','❌ 0','Predijiste local, ganó visitante'],
                    ['0 – 1','1 – 1','❌ 0','Predijiste empate, ganó visitante'],
                  ].map(([r, p, pts, m], i) => `
                    <tr style="background:${i % 2 === 0 ? 'var(--white)' : 'var(--bg)'}">
                      <td style="padding:9px 14px;font-weight:700;color:var(--navy)">${r}</td>
                      <td style="padding:9px 14px;color:var(--tmid)">${p}</td>
                      <td style="padding:9px 14px;text-align:center;font-weight:700">${pts}</td>
                      <td style="padding:9px 14px;color:var(--tmut);font-size:12px">${m}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ══ SECCIONES EN GRID ══ -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
                    gap:16px;margin-bottom:20px">

          <!-- Participación -->
          <div style="background:var(--white);border:1px solid var(--border);
                      border-radius:var(--rl);box-shadow:var(--sh);overflow:hidden">
            <div style="background:var(--cpce-blue,var(--blue));padding:14px 20px;
                        display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">👥</span>
              <span style="font-family:var(--disp);font-size:17px;font-weight:800;
                           color:#fff;letter-spacing:.3px">PARTICIPACIÓN</span>
            </div>
            <div style="padding:18px 20px">
              <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
                ${[
                  ['✅','Puede participar todo el personal matriculado y colaboradores del CPCE Mendoza.'],
                  ['✅','El registro es gratuito y de uso exclusivo interno.'],
                  ['✅','Cada participante tiene una cuenta individual e intransferible.'],
                  ['✅','La participación es voluntaria.'],
                  ['⚠️','Queda prohibido compartir o ceder el acceso a la cuenta a otra persona.'],
                ].map(([ico, txt]) => `
                  <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;
                              color:var(--tmid)">
                    <span style="flex-shrink:0;margin-top:1px">${ico}</span>
                    <span>${txt}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Predicciones -->
          <div style="background:var(--white);border:1px solid var(--border);
                      border-radius:var(--rl);box-shadow:var(--sh);overflow:hidden">
            <div style="background:var(--green);padding:14px 20px;
                        display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">⚽</span>
              <span style="font-family:var(--disp);font-size:17px;font-weight:800;
                           color:#fff;letter-spacing:.3px">PREDICCIONES</span>
            </div>
            <div style="padding:18px 20px">
              <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
                ${[
                  ['📝','Se pronostica el marcador exacto (goles de cada equipo) de cada partido.'],
                  ['🔓','Las predicciones están abiertas desde que el partido aparece en el fixture.'],
                  ['🔒','Las predicciones se cierran automáticamente <strong>15 minutos antes</strong> del inicio del partido.'],
                  ['✏️','Podés modificar tu predicción todas las veces que quieras hasta el cierre.'],
                  ['🚫','Una vez cerrado el partido no se puede cargar ni modificar ningún pronóstico.'],
                  ['0️⃣','Los partidos sin predicción cargada otorgan 0 puntos automáticamente.'],
                ].map(([ico, txt]) => `
                  <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;
                              color:var(--tmid)">
                    <span style="flex-shrink:0;margin-top:1px">${ico}</span>
                    <span>${txt}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Ranking y desempates -->
          <div style="background:var(--white);border:1px solid var(--border);
                      border-radius:var(--rl);box-shadow:var(--sh);overflow:hidden">
            <div style="background:var(--amber);padding:14px 20px;
                        display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">🏅</span>
              <span style="font-family:var(--disp);font-size:17px;font-weight:800;
                           color:#fff;letter-spacing:.3px">RANKING Y DESEMPATES</span>
            </div>
            <div style="padding:18px 20px">
              <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
                ${[
                  ['📊','La tabla de posiciones se actualiza automáticamente al cargar cada resultado.'],
                  ['🌐','Existe un ranking general y rankings por área/sector del Consejo.'],
                  ['1️⃣','<strong>Primer criterio de desempate:</strong> mayor cantidad de plenos (resultados exactos).'],
                  ['2️⃣','<strong>Segundo criterio de desempate:</strong> fecha de registro más antigua en el sistema.'],
                  ['👁️','Todos los participantes pueden ver el ranking completo en tiempo real.'],
                ].map(([ico, txt]) => `
                  <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;
                              color:var(--tmid)">
                    <span style="flex-shrink:0;margin-top:1px">${ico}</span>
                    <span>${txt}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Resultados y transparencia -->
          <div style="background:var(--white);border:1px solid var(--border);
                      border-radius:var(--rl);box-shadow:var(--sh);overflow:hidden">
            <div style="background:#6b21a8;padding:14px 20px;
                        display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">🔍</span>
              <span style="font-family:var(--disp);font-size:17px;font-weight:800;
                           color:#fff;letter-spacing:.3px">TRANSPARENCIA</span>
            </div>
            <div style="padding:18px 20px">
              <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
                ${[
                  ['📡','Los resultados reales los carga únicamente el administrador del sistema.'],
                  ['⚡','El cálculo de puntos es automático e inmediato al cargar el resultado.'],
                  ['👀','Una vez iniciado el partido, cualquier participante puede ver los pronósticos de todos.'],
                  ['🔐','Las predicciones son privadas hasta el inicio del partido para garantizar la equidad.'],
                  ['⚠️','Ante errores de carga, el administrador puede corregir un resultado. El sistema recalcula los puntos automáticamente.'],
                ].map(([ico, txt]) => `
                  <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;
                              color:var(--tmid)">
                    <span style="flex-shrink:0;margin-top:1px">${ico}</span>
                    <span>${txt}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Fases del torneo -->
          <div style="background:var(--white);border:1px solid var(--border);
                      border-radius:var(--rl);box-shadow:var(--sh);overflow:hidden">
            <div style="background:#0f766e;padding:14px 20px;
                        display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">🗓️</span>
              <span style="font-family:var(--disp);font-size:17px;font-weight:800;
                           color:#fff;letter-spacing:.3px">FASES DEL TORNEO</span>
            </div>
            <div style="padding:18px 20px">
              <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
                ${[
                  ['⚽','<strong>Fase de grupos:</strong> 48 partidos, 12 grupos de 4 equipos. Los 2 primeros de cada grupo avanzan más 8 mejores terceros.'],
                  ['⚽','<strong>Ronda de 32:</strong> 32 equipos clasificados.'],
                  ['⚽','<strong>Octavos, cuartos, semifinales y final</strong> completan el torneo.'],
                  ['📋','Las predicciones de cada fase se habilitarán a medida que avance el Mundial.'],
                  ['🏆','El sistema acumula puntos de <strong>todas las fases</strong> del torneo.'],
                ].map(([ico, txt]) => `
                  <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;
                              color:var(--tmid)">
                    <span style="flex-shrink:0;margin-top:1px">${ico}</span>
                    <span>${txt}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Soporte -->
          <div style="background:var(--white);border:1px solid var(--border);
                      border-radius:var(--rl);box-shadow:var(--sh);overflow:hidden">
            <div style="background:var(--navy);padding:14px 20px;
                        display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">🛠️</span>
              <span style="font-family:var(--disp);font-size:17px;font-weight:800;
                           color:#fff;letter-spacing:.3px">SOPORTE Y CONTACTO</span>
            </div>
            <div style="padding:18px 20px">
              <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
                ${[
                  ['🔑','¿Olvidaste tu contraseña? Contactá al administrador del sistema para que te la resetee.'],
                  ['✏️','¿Querés cambiar tu contraseña? Podés hacerlo desde <strong>Mi Perfil → Cambiar contraseña</strong>.'],
                  ['🏢','¿Tu área no está asignada? Consultá al administrador para que te la agregue.'],
                  ['🐛','¿Encontraste un error en un resultado? Notificalo inmediatamente al administrador.'],
                  ['📱','El sistema funciona desde cualquier dispositivo con navegador web.'],
                ].map(([ico, txt]) => `
                  <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;
                              color:var(--tmid)">
                    <span style="flex-shrink:0;margin-top:1px">${ico}</span>
                    <span>${txt}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>

        </div>

        <!-- ══ NOTA FINAL ══ -->
        <div style="background:var(--light);border:1px solid var(--bstrong);
                    border-radius:var(--r);padding:16px 20px;
                    display:flex;gap:12px;align-items:flex-start">
          <span style="font-size:20px;flex-shrink:0">ℹ️</span>
          <div style="font-size:13px;color:var(--tmid);line-height:1.6">
            <strong style="color:var(--navy)">Nota:</strong>
            Este Prode es una actividad recreativa interna del Consejo Profesional de Ciencias Económicas de Mendoza.
            No tiene fines económicos ni constituye apuesta de ningún tipo.
            La participación implica la aceptación de este reglamento.
            El CPCE se reserva el derecho de realizar modificaciones al reglamento en caso de ser necesario,
            comunicándolo oportunamente a los participantes.
          </div>
        </div>
      `;
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

      // Cargar áreas para el selector (en paralelo con el ranking)
      const [r, rAreas] = await Promise.all([
        ApiRanking.get(),
        ApiRanking.getAreas(),
      ]);

      if (!r?.ok) return Toast.err('Error al cargar el ranking');

      State.ranking = r.data || [];

      // Poblar el select de áreas
      const sel = document.getElementById('ranking-area-filter');
      if (sel && rAreas?.ok && rAreas.data?.length) {
        // Mantener la opción "Todas las áreas" y agregar las demás
        sel.innerHTML = '<option value="">🌐 Todas las áreas</option>' +
          rAreas.data.map(a => `<option value="${XSS.s(a)}">${XSS.s(a)}</option>`).join('');
      }

      // Actualizar posición del usuario en stats
      const mio = State.ranking.find(u => u.email === State.user?.email);
      const posEl = document.getElementById('spos');
      if (posEl) posEl.textContent = mio ? `#${mio.posicion}` : '—';

      Views.Ranking.render(State.ranking);
    },

    async filtrarPorArea(area) {
      document.getElementById('rout').innerHTML = '<div class="spinner"></div>';
      const r = await ApiRanking.get(area || null);
      if (!r?.ok) return Toast.err('Error al filtrar el ranking');
      Views.Ranking.render(r.data || []);
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
              ${XSS.s(u.nombre)}
              ${u.email === myEmail ? '<span class="metag">vos</span>' : ''}
            </div>
            <div class="remail">${XSS.s(u.email)}</div>
            ${u.area ? `<div style="font-size:11px;color:var(--blue);margin-top:2px;font-weight:500">🏢 ${XSS.s(u.area)}</div>` : ''}
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
            <h2>${XSS.s(user.nombre)}</h2>
            <p>${XSS.s(user.email)}</p>
            <p style="margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span class="ucrole ${user.rol === 'ROLE_ADMIN' ? 'radm' : 'rusr'}">
                ${user.rol === 'ROLE_ADMIN' ? 'Administrador' : 'Participante'}
              </span>
              ${user.area
                ? `<span style="font-size:12px;color:var(--blue);font-weight:600">🏢 ${XSS.s(user.area)}</span>`
                : `<span style="font-size:12px;color:var(--tmut)">Sin área asignada — pedísela al admin</span>`}
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
      const area = u.area ? XSS.s(u.area) : null;
      const nom  = XSS.s(u.nombre);
      const nomJ = nom.replace(/'/g, "\\'");
      const areaJ = (area || '').replace(/'/g, "\\'");
      return `
        <div class="ucard">
          <div class="uchead">
            <div class="ucav">${ini}</div>
            <div>
              <div class="ucname">${nom}</div>
              <div class="ucemail">${XSS.s(u.email)}</div>
              ${area
                ? `<div style="font-size:11px;color:var(--blue);font-weight:500;margin-top:2px">🏢 ${area}</div>`
                : `<div style="font-size:11px;color:var(--tmut);margin-top:2px">Sin área asignada</div>`}
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
            <button class="btnsm" onclick="Views.Admin.openReset(${u.id},'${nomJ}')">
              🔑 Reset contraseña
            </button>
            <button class="btnsm" onclick="Views.Admin.openArea(${u.id},'${nomJ}','${areaJ}')">
              🏢 ${area ? 'Cambiar área' : 'Asignar área'}
            </button>
            <button class="btnsm" onclick="Views.Admin.verDashboard(${u.id},'${nomJ}')">
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

    openArea(id, nombre, areaActual) {
      State.areaId = id;
      document.getElementById('marea-sub').textContent =
        `Área o sector para: ${nombre}`;
      document.getElementById('marea-input').value = areaActual || '';
      Modal.open('modal-area');
      // Foco automático en el input
      setTimeout(() => document.getElementById('marea-input').focus(), 100);
    },

    async confirmArea() {
      const area = document.getElementById('marea-input').value.trim();
      const r = await ApiAdmin.actualizarArea(State.areaId, area || null);
      if (!r?.ok) return Toast.err('Error al actualizar el área');
      Modal.close();
      Toast.ok(`✅ Área ${area ? `"${area}" asignada` : 'removida'} correctamente`);
      // Refrescar la lista de usuarios
      Views.Admin.loadUsuarios();
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