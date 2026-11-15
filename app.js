/* Chemie-Klausur EF – Logik für Navigation, Selbstdiagnose, Diagramme und Quiz */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function de(x, d) { return x.toFixed(d).replace('.', ','); }
  function sci(x) {
    if (x === 0) return '0';
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    if (m >= 9.95) { m /= 10; e += 1; }
    return de(m, 1) + ' · 10<sup>' + (e < 0 ? '−' + (-e) : e) + '</sup>';
  }
  function el(tag, attrs, text) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  /* ------------------------------------------------------------ Speicher */
  var KEY = 'chemie-ef-klausur1-v1';
  var state = { checks: {}, sd: {}, quiz: {} };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s && typeof s === 'object') {
        state.checks = s.checks || {}; state.sd = s.sd || {}; state.quiz = s.quiz || {};
      }
    }
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var CODES = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
  var TITLE = {
    A1: 'Chemische Reaktion, Energie, Katalysator', A2: 'Chemisches Rechnen',
    B1: 'Verlauf und Momentangeschwindigkeit', B2: 'Geschwindigkeit aufstellen und berechnen',
    B3: 'Einflussfaktoren und Stoßtheorie', C1: 'Das dynamische Gleichgewicht',
    C2: 'Massenwirkungsgesetz', C3: 'Prinzip von Le Chatelier'
  };
  var SHORT = {
    A1: 'Reaktion &amp; Energie', A2: 'Rechnen', B1: 'Verlauf &amp; Tangente', B2: 'v berechnen',
    B3: 'Einflussfaktoren', C1: 'Dynamisches GG', C2: 'Massenwirkungsgesetz', C3: 'Le Chatelier'
  };
  var LEVELS = ['Kann ich', 'Einigermaßen', 'Unsicher', 'Noch nicht'];

  /* ------------------------------------------------------------ Navigation */
  var pages = $$('.page');
  var navLinks = $$('.bar nav a');
  function route() {
    var id = decodeURIComponent(location.hash.slice(1)) || 'start';
    var target = document.getElementById(id);
    if (!target || !target.closest('.page')) target = document.getElementById('start');
    var page = target.closest('.page');
    if (window.Begriffe) window.Begriffe.hide();
    pages.forEach(function (p) { p.hidden = (p !== page); });
    navLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + page.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (target === page) window.scrollTo(0, 0);
    else target.scrollIntoView();
    if (page.id === 'geschwindigkeit') { drawTangent(); }
    if (page.id === 'gleichgewicht') { runSim(); }
  }
  window.addEventListener('hashchange', route);

  /* ------------------------------------------------------------ Checkboxen (Lernplan) */
  function planCount() {
    var boxes = $$('#lernplan input[type=checkbox]'), n = 0;
    boxes.forEach(function (c) { if (c.checked) n++; });
    $('#plan-count').textContent = n + ' von ' + boxes.length + ' Schritten erledigt.';
  }
  $$('input[type=checkbox][data-save]').forEach(function (cb) {
    cb.checked = !!state.checks[cb.id];
    cb.addEventListener('change', function () { state.checks[cb.id] = cb.checked; save(); planCount(); });
  });
  planCount();

  /* ------------------------------------------------------------ Selbstdiagnose */
  $$('.sd-row[data-code]').forEach(function (row) {
    var code = row.dataset.code, seg = $('.seg', row);
    LEVELS.forEach(function (lab, i) {
      var id = 'sd-' + code + '-' + i;
      var inp = document.createElement('input');
      inp.type = 'radio'; inp.name = 'sd-' + code; inp.id = id; inp.value = String(i);
      if (state.sd[code] === i) inp.checked = true;
      inp.addEventListener('change', function () { state.sd[code] = i; save(); renderBaustellen(); });
      var l = document.createElement('label'); l.htmlFor = id; l.textContent = lab;
      seg.appendChild(inp); seg.appendChild(l);
    });
  });

  function quizWeak() {
    var per = {};
    CODES.forEach(function (c) { per[c] = { r: 0, w: 0 }; });
    Q.forEach(function (q) {
      var a = state.quiz[q.id];
      if (typeof a === 'number') { if (a === q.a) per[q.c].r++; else per[q.c].w++; }
    });
    return CODES.filter(function (c) { var d = per[c].r + per[c].w; return d > 0 && per[c].r / d < 0.75; });
  }

  function renderBaustellen() {
    var ul = $('#baustellen');
    var rated = CODES.filter(function (c) { return typeof state.sd[c] === 'number'; });
    var open = rated.filter(function (c) { return state.sd[c] >= 1; })
      .sort(function (a, b) { return state.sd[b] - state.sd[a] || CODES.indexOf(a) - CODES.indexOf(b); });
    var html = '';
    if (!rated.length) {
      html = '<li><span class="lvl">Tipp</span><span>Noch nichts angekreuzt. Sobald du oben deine Einschätzung wählst, steht hier deine Reihenfolge, die schwächsten Punkte zuerst.</span></li>';
    } else if (!open.length) {
      html = '<li><span class="lvl lvl1">Stark</span><span>Bisher alles auf „Kann ich“. Prüfe das im <a href="#quiz">Quiz</a> und in der <a href="#probeklausur">Probeklausur</a>.</span></li>';
    } else {
      html = open.map(function (c) {
        var lv = state.sd[c];
        return '<li><span class="lvl lvl' + lv + '">' + LEVELS[lv] + '</span><span><b>' + c + '</b> · <a href="#' + c.toLowerCase() + '">' + TITLE[c] + '</a></span></li>';
      }).join('');
    }
    var weak = quizWeak().filter(function (c) { return open.indexOf(c) < 0; });
    if (weak.length) {
      html += '<li><span class="lvl lvl2">Quiz</span><span>Im Quiz unter 75 % richtig: ' +
        weak.map(function (c) { return '<a href="#' + c.toLowerCase() + '">' + c + '</a>'; }).join(', ') + '</span></li>';
    }
    ul.innerHTML = html;
  }

  /* ------------------------------------------------------------ Diagramm-Helfer */
  function grid(svg, o) {
    // o: {X0,X1,Y0,Y1, xmax, ymax, xMinor, xMajor, yMinor, yMajor, xFmt, yFmt, xLabel, yLabel}
    var sx = function (x) { return o.X0 + x / o.xmax * (o.X1 - o.X0); };
    var sy = function (y) { return o.Y0 - y / o.ymax * (o.Y0 - o.Y1); };
    var g = el('g');
    var eps = 1e-9, x, y;
    for (x = 0; x <= o.xmax + eps; x += o.xMinor) {
      var maj = Math.abs(x / o.xMajor - Math.round(x / o.xMajor)) < 1e-6;
      g.appendChild(el('line', { x1: sx(x), y1: o.Y0, x2: sx(x), y2: o.Y1, 'class': maj ? 'gmaj' : 'gmin' }));
      if (maj) g.appendChild(el('text', { x: sx(x), y: o.Y0 + 16, 'class': 'tick', 'text-anchor': 'middle' }, o.xFmt(x)));
    }
    for (y = 0; y <= o.ymax + eps; y += o.yMinor) {
      var majy = Math.abs(y / o.yMajor - Math.round(y / o.yMajor)) < 1e-6;
      g.appendChild(el('line', { x1: o.X0, y1: sy(y), x2: o.X1, y2: sy(y), 'class': majy ? 'gmaj' : 'gmin' }));
      if (majy) g.appendChild(el('text', { x: o.X0 - 7, y: sy(y) + 4, 'class': 'tick', 'text-anchor': 'end' }, o.yFmt(y)));
    }
    g.appendChild(el('line', { x1: o.X0, y1: o.Y0, x2: o.X1, y2: o.Y0, 'class': 'ax' }));
    g.appendChild(el('line', { x1: o.X0, y1: o.Y0, x2: o.X0, y2: o.Y1, 'class': 'ax' }));
    g.appendChild(el('text', { x: o.X1, y: o.Y0 + 32, 'class': 'axl', 'text-anchor': 'end' }, o.xLabel));
    var yl = el('text', { x: 14, y: (o.Y0 + o.Y1) / 2, 'class': 'axl', 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (o.Y0 + o.Y1) / 2 + ')' });
    yl.innerHTML = o.yLabel;
    g.appendChild(yl);
    svg.appendChild(g);
    return { sx: sx, sy: sy };
  }
  function clip(svg, id, o) {
    var defs = el('defs'), cp = el('clipPath', { id: id });
    cp.appendChild(el('rect', { x: o.X0, y: o.Y1, width: o.X1 - o.X0, height: o.Y0 - o.Y1 }));
    defs.appendChild(cp); svg.appendChild(defs);
  }
  function poly(pts, sx, sy) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ',' + sy(p[1]).toFixed(1); }).join(' ');
  }

  /* ------------------------------------------------------------ B1: Tangente */
  var TAN = { X0: 52, X1: 544, Y0: 256, Y1: 14, xmax: 120, ymax: 120, xMinor: 10, xMajor: 20, yMinor: 10, yMajor: 20,
    xFmt: function (v) { return String(v); }, yFmt: function (v) { return String(v); },
    xLabel: 't in s', yLabel: 'V(H<tspan font-size="9" dy="3">2</tspan><tspan dy="-3">) in mL</tspan>' };
  var DATA = [[0, 0], [10, 31], [20, 53], [30, 68], [40, 80], [60, 93], [80, 100], [100, 104], [120, 106]];
  function Vt(t) { return 108 * (1 - Math.exp(-t / 30)); }
  function dVt(t) { return 3.6 * Math.exp(-t / 30); }
  var tanBuilt = false, tanDyn, tanLab, tanS;
  function buildTangent() {
    var svg = $('#tan-svg');
    tanS = grid(svg, TAN);
    clip(svg, 'tan-clip', TAN);
    var curve = [];
    for (var t = 0; t <= 120; t += 1) curve.push([t, Vt(t)]);
    svg.appendChild(el('path', { d: poly(curve, tanS.sx, tanS.sy), 'class': 'ln-ink', 'stroke-width': 1.6 }));
    tanDyn = el('g', { 'clip-path': 'url(#tan-clip)' });
    svg.appendChild(tanDyn);
    DATA.forEach(function (p) {
      svg.appendChild(el('circle', { cx: tanS.sx(p[0]), cy: tanS.sy(p[1]), r: 3.6, 'class': 'dot' }));
    });
    tanLab = el('g');
    svg.appendChild(tanLab);
    tanBuilt = true;
  }
  function drawTangent() {
    if (!tanBuilt) buildTangent();
    var t0 = +$('#tan-t').value, V0 = Vt(t0), m = dVt(t0), sx = tanS.sx, sy = tanS.sy;
    $('#tan-t-out').textContent = t0 + ' s';
    [tanDyn, tanLab].forEach(function (g) { while (g.firstChild) g.removeChild(g.firstChild); });
    // Steigungsdreieck: rechts vom Punkt, am rechten Rand links davon
    var dt = 20, a, b, c, right = (t0 <= 65);
    if (right) { a = [t0, V0]; b = [t0 + dt, V0]; c = [t0 + dt, V0 + m * dt]; }
    else { a = [t0 - dt, V0 - m * dt]; b = [t0, V0 - m * dt]; c = [t0, V0]; }
    tanDyn.appendChild(el('path', { d: poly([a, b, c], sx, sy) + ' Z', 'class': 'tri' }));
    tanLab.appendChild(el('text', { x: sx((a[0] + b[0]) / 2), y: sy(b[1]) + 15, 'class': 'lab-b', 'text-anchor': 'middle' }, 'Δt = 20 s'));
    var dvText = 'ΔV = ' + de(m * dt, 1) + ' mL', midY = sy((b[1] + c[1]) / 2) + 4;
    if (right) tanLab.appendChild(el('text', { x: sx(b[0]) + 6, y: midY, 'class': 'lab-b' }, dvText));
    else tanLab.appendChild(el('text', { x: sx(a[0]) - 6, y: midY, 'class': 'lab-b', 'text-anchor': 'end' }, dvText));
    // Sekante 0..t0
    if (t0 > 0) tanDyn.appendChild(el('line', { x1: sx(0), y1: sy(0), x2: sx(t0), y2: sy(V0), 'class': 'ln-a', 'stroke-dasharray': '6 4' }));
    // Tangente
    var ta = Math.max(0, t0 - 40), tb = Math.min(120, t0 + 40);
    tanDyn.appendChild(el('line', { x1: sx(ta), y1: sy(V0 + m * (ta - t0)), x2: sx(tb), y2: sy(V0 + m * (tb - t0)), 'class': 'ln-b' }));
    tanLab.appendChild(el('circle', { cx: sx(t0), cy: sy(V0), r: 5, 'class': 'dot-on' }));
    var avg = t0 > 0 ? V0 / t0 : null;
    $('#tan-read').innerHTML =
      '<span><strong>Momentangeschwindigkeit bei ' + t0 + ' s</strong> (Tangente): <span class="k">' + de(m, 2) + ' mL/s ≈ ' + sci(m / 24000) + ' mol/s</span></span>' +
      '<span><strong>Durchschnitt von 0 bis ' + t0 + ' s</strong> (Sekante): <span class="k">' + (avg == null ? '–' : de(avg, 2) + ' mL/s') + '</span></span>' +
      '<span class="muted">Werte aus der Ausgleichskurve durch die Messpunkte, Umrechnung mit V<sub>m</sub> = 24 000 mL/mol.</span>';
    if (window.Begriffe) window.Begriffe.mark($('#tan-read'), true);
  }
  $('#tan-t').addEventListener('input', drawTangent);

  /* ------------------------------------------------------------ B3: Energieverteilung */
  (function drawMB() {
    var svg = $('#mb-svg');
    var X0 = 34, X1 = 306, Y0 = 160, Y1 = 16, Emax = 6, fmax = 0.5, EA = 3.5;
    var sx = function (E) { return X0 + E / Emax * (X1 - X0); };
    var sy = function (v) { return Y0 - v / fmax * (Y0 - Y1); };
    function f(E, kT) { return 2 / Math.sqrt(Math.PI) * Math.sqrt(E) * Math.exp(-E / kT) / Math.pow(kT, 1.5); }
    function curve(kT, from) {
      var pts = [];
      for (var E = from; E <= Emax + 1e-9; E += 0.05) pts.push([E, f(E, kT)]);
      return pts;
    }
    [[1.6, 'fill-a', 'ln-a'], [1.0, 'fill-b', 'ln-b']].forEach(function (c) {
      var sh = curve(c[0], EA);
      var d = 'M' + sx(EA) + ',' + sy(0) + ' ' + poly(sh, sx, sy).replace(/^M/, 'L') + ' L' + sx(Emax) + ',' + sy(0) + ' Z';
      svg.appendChild(el('path', { d: d, 'class': c[1] }));
    });
    [[1.6, 'ln-a'], [1.0, 'ln-b']].forEach(function (c) {
      svg.appendChild(el('path', { d: poly(curve(c[0], 0), sx, sy), 'class': c[1] }));
    });
    svg.appendChild(el('line', { x1: X0, y1: Y0, x2: X1 + 6, y2: Y0, 'class': 'ax', 'marker-end': 'url(#ah)' }));
    svg.appendChild(el('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 - 6, 'class': 'ax', 'marker-end': 'url(#ah)' }));
    svg.appendChild(el('line', { x1: sx(EA), y1: Y0, x2: sx(EA), y2: Y1 + 14, 'class': 'ln-dash' }));
    var t = el('text', { x: sx(EA), y: Y1 + 8, 'class': 'lab', 'text-anchor': 'middle' });
    t.innerHTML = 'E<tspan font-size="9" dy="3">A</tspan>';
    svg.appendChild(t);
    svg.appendChild(el('text', { x: X1, y: Y0 + 22, 'class': 'axl', 'text-anchor': 'end' }, 'Energie der Teilchen'));
    svg.appendChild(el('text', { x: 14, y: (Y0 + Y1) / 2, 'class': 'axl', 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (Y0 + Y1) / 2 + ')' }, 'Anteil der Teilchen'));
  })();

  /* ------------------------------------------------------------ C1: Simulation */
  var sim = { start: 'E' };
  var CC = { X0: 52, X1: 544, Y0: 190, Y1: 12, xmax: 100, ymax: 1.6, xMinor: 5, xMajor: 10, yMinor: 0.1, yMajor: 0.4,
    xFmt: function (v) { return String(Math.round(v)); }, yFmt: function (v) { return de(v, 1); },
    xLabel: 't in s', yLabel: 'c in mol/L' };
  function runSim() {
    var kh = +$('#kh').value, kr = +$('#kr').value, dist = $('#dist').checked;
    $('#kh-out').textContent = de(kh, 2); $('#kr-out').textContent = de(kr, 2);
    var cE = sim.start === 'E' ? 1 : 0, cP = 1 - cE, dt = 0.02, t = 0;
    var ser = [[0, cE, cP, kh * cE, kr * cP]];
    var gg1 = null, gg2 = null, before = null;
    var steps = Math.round(100 / dt);
    for (var i = 1; i <= steps; i++) {
      var d = (kh * cE - kr * cP) * dt;
      cE -= d; cP += d; t = i * dt;
      if (dist && Math.abs(t - 50) < dt / 2) { before = [cE, cP]; cE += 0.5; }
      var vh = kh * cE, vr = kr * cP;
      var close = Math.abs(vh - vr) <= 0.02 * Math.max(vh, vr);
      if (t < 50 - 1e-9 || !dist) { if (gg1 == null && close) gg1 = t; }
      else if (t > 50 + 1e-9 && gg2 == null && close) gg2 = t;
      if (i % 25 === 0) ser.push([t, cE, cP, vh, vr]);
    }
    if (!before) before = null;
    // c-Diagramm
    var svg = $('#gg-c'); svg.innerHTML = '';
    var s1 = grid(svg, CC);
    svg.appendChild(el('path', { d: poly(ser.map(function (p) { return [p[0], p[1]]; }), s1.sx, s1.sy), 'class': 'ln-b' }));
    svg.appendChild(el('path', { d: poly(ser.map(function (p) { return [p[0], p[2]]; }), s1.sx, s1.sy), 'class': 'ln-a' }));
    [gg1, gg2].forEach(function (g) {
      if (g == null) return;
      svg.appendChild(el('line', { x1: s1.sx(g), y1: CC.Y0, x2: s1.sx(g), y2: CC.Y1 + 14, 'class': 'ln-dash' }));
      svg.appendChild(el('text', { x: s1.sx(g) + 4, y: CC.Y1 + 12, 'class': 'lab' }, 'GG'));
    });
    if (dist) svg.appendChild(el('text', { x: s1.sx(50) + 4, y: CC.Y0 - 8, 'class': 'lab' }, '+ Edukt'));
    // v-Diagramm
    var vmax = 0; ser.forEach(function (p) { vmax = Math.max(vmax, p[3], p[4]); });
    var step = vmax > 0.2 ? 0.1 : (vmax > 0.08 ? 0.05 : 0.02);
    var ymax = Math.ceil(vmax * 1.05 / step) * step;
    var CV = { X0: 52, X1: 544, Y0: 132, Y1: 12, xmax: 100, ymax: ymax, xMinor: 5, xMajor: 10, yMinor: step / 2, yMajor: step,
      xFmt: CC.xFmt, yFmt: function (v) { return de(v, 2); }, xLabel: 't in s', yLabel: 'v in mol/(L·s)' };
    var svg2 = $('#gg-v'); svg2.innerHTML = '';
    var s2 = grid(svg2, CV);
    svg2.appendChild(el('path', { d: poly(ser.map(function (p) { return [p[0], p[3]]; }), s2.sx, s2.sy), 'class': 'ln-b' }));
    svg2.appendChild(el('path', { d: poly(ser.map(function (p) { return [p[0], p[4]]; }), s2.sx, s2.sy), 'class': 'ln-a' }));
    // Text
    var K = kh / kr, last = ser[ser.length - 1];
    var html = '';
    var first = dist ? before : [last[1], last[2]];
    if (gg1 != null) {
      html += '<span><strong>Gleichgewicht nach ca. ' + Math.round(gg1) + ' s:</strong> <span class="k">c(Edukt) = ' + de(first[0], 2) + ' mol/L, c(Produkt) = ' + de(first[1], 2) + ' mol/L</span></span>';
      html += '<span>Quotient c(Produkt) / c(Edukt) = <span class="k">' + de(first[1] / first[0], 2) + '</span> = k<sub>hin</sub> / k<sub>rück</sub> = K = <span class="k">' + de(K, 2) + '</span></span>';
    } else {
      html += '<span>Bis ' + (dist ? '50' : '100') + ' s ist noch <strong>kein Gleichgewicht</strong> erreicht. Erhöhe k<sub>hin</sub> oder k<sub>rück</sub>.</span>';
    }
    if (dist) {
      html += '<span><strong>Nach der Zugabe' + (gg2 != null ? ' (neues GG nach ca. ' + Math.round(gg2) + ' s)' : '') + ':</strong> <span class="k">c(Edukt) = ' + de(last[1], 2) + ', c(Produkt) = ' + de(last[2], 2) + ' mol/L</span>, Quotient <span class="k">' + de(last[2] / last[1], 2) + '</span>. Es liegt mehr Produkt vor, K bleibt gleich.</span>';
    }
    $('#gg-read').innerHTML = html;
    if (window.Begriffe) window.Begriffe.mark($('#gg-read'), true);
  }
  ['#kh', '#kr'].forEach(function (s) { $(s).addEventListener('input', runSim); });
  $('#dist').addEventListener('change', runSim);
  $$('#sim [data-start]').forEach(function (b) {
    b.addEventListener('click', function () {
      sim.start = b.dataset.start;
      $$('#sim [data-start]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      runSim();
    });
  });

  /* ------------------------------------------------------------ Quiz */
  var Q = [
    { id: 'a1-1', c: 'A1', q: 'Woran erkennst du eine chemische Reaktion?', o: ['Es entstehen neue Stoffe mit neuen Eigenschaften, und Energie wird umgesetzt', 'Ein Stoff ändert seinen Aggregatzustand', 'Die Temperatur steigt immer an', 'Ein Stoff löst sich in Wasser auf'], a: 0, e: 'Kennzeichen sind Stoffumwandlung und Energieumwandlung. Schmelzen oder Lösen verändert die Stoffe nicht.' },
    { id: 'a1-2', c: 'A1', q: 'Welcher Vorgang ist keine chemische Reaktion?', o: ['Magnesium verbrennt', 'Eis schmilzt', 'Eisen rostet', 'Marmor sprudelt in Salzsäure'], a: 1, e: 'Beim Schmelzen bleibt es Wasser, nur der Aggregatzustand ändert sich.' },
    { id: 'a1-3', c: 'A1', q: 'Eine Reaktion ist exotherm, wenn …', o: ['Energie aus der Umgebung aufgenommen wird (ΔH &gt; 0)', 'Energie an die Umgebung abgegeben wird (ΔH &lt; 0)', 'sie keine Aktivierungsenergie braucht', 'sie von selbst aufhört'], a: 1, e: 'Exotherm: Die Produkte sind energieärmer, die Differenz wird abgegeben, ΔH ist negativ.' },
    { id: 'a1-4', c: 'A1', q: 'Was bewirkt ein Katalysator?', o: ['Er erhöht die Aktivierungsenergie', 'Er senkt die Aktivierungsenergie und liegt nach der Reaktion unverändert vor', 'Er macht eine endotherme Reaktion exotherm', 'Er wird bei der Reaktion verbraucht'], a: 1, e: 'Der Katalysator ermöglicht einen Weg mit kleinerer Aktivierungsenergie. ΔH ändert er nicht, und er wird nicht verbraucht.' },
    { id: 'a1-5', c: 'A1', q: 'Welche Reaktionsgleichung ist richtig?', o: ['Mg + O2 → MgO2', 'Mg + O2 → MgO', '2 Mg + O2 → 2 MgO', 'Mg + O → MgO'], a: 2, e: 'Sauerstoff ist O2, das Produkt ist MgO. Ausgeglichen wird nur mit Koeffizienten: 2 Mg + O2 → 2 MgO.' },

    { id: 'a2-1', c: 'A2', q: 'Wie viel Mol sind 4,0 g Natriumhydroxid (M = 40 g/mol)?', o: ['0,10 mol', '10 mol', '160 mol', '0,40 mol'], a: 0, e: 'n = m / M = 4,0 g ÷ 40 g/mol = 0,10 mol.' },
    { id: 'a2-2', c: 'A2', q: '0,50 mol Kochsalz werden zu 250 mL Lösung gelöst. Wie groß ist c?', o: ['0,125 mol/L', '2,0 mol/L', '125 mol/L', '0,50 mol/L'], a: 1, e: 'Erst in Liter umrechnen: 250 mL = 0,250 L. c = 0,50 mol ÷ 0,250 L = 2,0 mol/L.' },
    { id: 'a2-3', c: 'A2', q: 'Welche Einheit hat die Stoffmengenkonzentration c?', o: ['g/mol', 'mol/s', 'mol/L', 'g/L'], a: 2, e: 'c = n / V, also mol/L. g/L wäre eine Massenkonzentration, g/mol die molare Masse.' },
    { id: 'a2-4', c: 'A2', q: 'Welches Volumen nehmen 0,25 mol Wasserstoff bei 20 °C ein (V<sub>m</sub> = 24 L/mol)?', o: ['96 L', '6,0 L', '0,010 L', '24 L'], a: 1, e: 'V = n · V<sub>m</sub> = 0,25 mol · 24 L/mol = 6,0 L.' },

    { id: 'b1-1', c: 'B1', q: 'Warum nimmt die Reaktionsgeschwindigkeit im Lauf einer Reaktion ab?', o: ['Die Aktivierungsenergie steigt', 'Die Edukt-Konzentration sinkt, es gibt weniger Zusammenstöße pro Zeit', 'Der Katalysator wird verbraucht', 'Die Teilchen werden langsamer'], a: 1, e: 'Edukte werden verbraucht. Weniger Teilchen pro Volumen bedeutet weniger Zusammenstöße pro Zeit.' },
    { id: 'b1-2', c: 'B1', q: 'Wie bestimmt man die Momentangeschwindigkeit aus einem c(t)-Diagramm?', o: ['Steigung der Sekante vom Start bis zum Ende', 'Konzentration zu diesem Zeitpunkt ablesen', 'Steigung der Tangente in diesem Punkt', 'Fläche unter der Kurve'], a: 2, e: 'Die Tangente berührt die Kurve nur in diesem Punkt. Ihre Steigung ist die Momentangeschwindigkeit.' },
    { id: 'b1-3', c: 'B1', q: 'Die Durchschnittsgeschwindigkeit zwischen zwei Messpunkten entspricht …', o: ['der Steigung der Sekante durch beide Punkte', 'der Steigung der Tangente am ersten Punkt', 'dem y-Wert des zweiten Punktes', 'der Zeit zwischen den Punkten'], a: 0, e: 'Durchschnitt = Δy / Δt zwischen zwei Punkten, also die Steigung der Sekante.' },
    { id: 'b1-4', c: 'B1', q: 'Wie näherst du die Momentangeschwindigkeit bei t = 20 s rechnerisch an?', o: ['V(20 s) ÷ 20 s', '(V(30 s) − V(10 s)) ÷ 20 s', 'V(30 s) − V(10 s)', '(V(20 s) − V(0 s)) ÷ 2'], a: 1, e: 'Man nimmt ein kleines Intervall rund um den Zeitpunkt. V(20 s) ÷ 20 s wäre der Durchschnitt seit dem Start.' },

    { id: 'b2-1', c: 'B2', q: 'c(Edukt) sinkt in 20 s von 0,50 mol/L auf 0,30 mol/L. Wie groß ist v?', o: ['0,20 mol/(L·s)', '0,010 mol/(L·s)', '0,025 mol/(L·s)', '4,0 mol/(L·s)'], a: 1, e: 'v = −Δc / Δt = −(0,30 − 0,50) mol/L ÷ 20 s = 0,010 mol/(L·s).' },
    { id: 'b2-2', c: 'B2', q: 'Warum steht bei Edukten ein Minus: v = −Δc / Δt?', o: ['Weil Edukte negativ geladen sind', 'Weil Δc bei Edukten negativ ist und v positiv sein soll', 'Weil die Rückreaktion abgezogen wird', 'Weil Edukte langsamer reagieren'], a: 1, e: 'Die Edukt-Konzentration nimmt ab, Δc ist negativ. Das Minus macht v positiv.' },
    { id: 'b2-3', c: 'B2', q: '2 H2O2 → 2 H2O + O2. In einer Minute entstehen 0,010 mol O2. Wie viel H2O2 wird in dieser Zeit verbraucht?', o: ['0,0050 mol', '0,010 mol', '0,020 mol', '0,040 mol'], a: 2, e: 'H2O2 : O2 = 2 : 1. Es wird also doppelt so viel H2O2 verbraucht: 0,020 mol.' },
    { id: 'b2-4', c: 'B2', q: 'Marmor reagiert mit Salzsäure. Welche Messung eignet sich, um v zu bestimmen?', o: ['Masse des Marmors vor dem Versuch', 'Massenabnahme durch entweichendes Kohlenstoffdioxid', 'Farbe der Lösung', 'Siedetemperatur der Salzsäure'], a: 1, e: 'CO2 entweicht. Die Massenabnahme pro Zeit zeigt, wie schnell die Reaktion läuft. Alternativ misst man das Gasvolumen.' },

    { id: 'b3-1', c: 'B3', q: 'Was ist ein wirksamer Stoß?', o: ['Jeder Zusammenstoß zweier Teilchen', 'Ein Stoß mit genug Energie (mindestens E<sub>A</sub>) und passender Ausrichtung', 'Ein Stoß gegen die Gefäßwand', 'Ein Stoß zwischen zwei gleichen Teilchen'], a: 1, e: 'Nur Stöße mit genug Energie und richtiger Ausrichtung führen zur Reaktion.' },
    { id: 'b3-2', c: 'B3', q: 'Warum steigt v bei höherer Temperatur?', o: ['Die Aktivierungsenergie sinkt', 'Mehr Teilchen haben genug Energie für einen wirksamen Stoß, und sie stoßen häufiger zusammen', 'Es entstehen mehr Teilchen', 'Die Konzentration steigt'], a: 1, e: 'E<sub>A</sub> bleibt gleich. Aber ein größerer Anteil der Teilchen erreicht sie, und es gibt mehr Stöße pro Zeit.' },
    { id: 'b3-3', c: 'B3', q: 'Marmorpulver reagiert schneller mit Salzsäure als ein Marmorstück gleicher Masse. Warum?', o: ['Pulver hat eine größere Oberfläche, mehr Teilchen können getroffen werden', 'Pulver ist leichter', 'Pulver wirkt als Katalysator', 'Pulver hat eine kleinere Aktivierungsenergie'], a: 0, e: 'Je feiner zerteilt, desto größer die Oberfläche. Es gibt mehr Zusammenstöße pro Zeit.' },
    { id: 'b3-4', c: 'B3', q: 'Nach der RGT-Regel wird eine Reaktion etwa 2- bis 4-mal so schnell, wenn die Temperatur steigt um …', o: ['1 K', '10 K', '50 K', '100 K'], a: 1, e: 'RGT-Regel (Reaktionsgeschwindigkeit-Temperatur-Regel): 10 K wärmer ergibt etwa die 2- bis 4-fache Geschwindigkeit.' },
    { id: 'b3-5', c: 'B3', q: 'Die Salzsäure-Konzentration wird verdoppelt, Magnesium ist der begrenzende Stoff. Was gilt für die V(H2)-Kurve?', o: ['Sie ist am Anfang steiler, das Endvolumen bleibt gleich', 'Sie ist flacher, das Endvolumen verdoppelt sich', 'Sie ist steiler, das Endvolumen verdoppelt sich', 'Nichts ändert sich'], a: 0, e: 'Mehr Zusammenstöße pro Zeit machen die Reaktion schneller. Wie viel H2 entsteht, hängt aber nur von der Menge Magnesium ab.' },

    { id: 'c1-1', c: 'C1', q: 'Was gilt im chemischen Gleichgewicht?', o: ['Die Reaktion ist zum Stillstand gekommen', 'Edukte und Produkte haben die gleiche Konzentration', 'Hin- und Rückreaktion laufen gleich schnell, die Konzentrationen bleiben konstant', 'Nur noch die Hinreaktion läuft'], a: 2, e: 'v<sub>hin</sub> = v<sub>rück</sub>. Die Konzentrationen sind konstant, aber meist nicht gleich.' },
    { id: 'c1-2', c: 'C1', q: 'Warum nennt man das chemische Gleichgewicht dynamisch?', o: ['Weil es sich ständig verschiebt', 'Weil auf Teilchenebene Hin- und Rückreaktion weiterlaufen', 'Weil die Temperatur schwankt', 'Weil sich die Konzentrationen ständig ändern'], a: 1, e: 'Nach außen passiert nichts, auf Teilchenebene laufen beide Reaktionen gleich schnell weiter.' },
    { id: 'c1-3', c: 'C1', q: 'Welche Voraussetzung braucht ein chemisches Gleichgewicht?', o: ['Ein offenes Gefäß', 'Einen Katalysator', 'Ein geschlossenes System und eine umkehrbare Reaktion', 'Gleiche Startkonzentrationen'], a: 2, e: 'Im offenen Gefäß können Produkte entweichen, etwa CO2. Dann läuft die Reaktion vollständig ab.' },
    { id: 'c1-4', c: 'C1', q: 'Man startet einmal nur mit Edukten und einmal nur mit Produkten (gleiche Atommengen, gleiche Temperatur). Was stellt sich ein?', o: ['Zwei verschiedene Gleichgewichte', 'Dasselbe Gleichgewicht', 'Nur beim Start mit Edukten ein Gleichgewicht', 'Gar kein Gleichgewicht'], a: 1, e: 'Das Gleichgewicht lässt sich von beiden Seiten erreichen. Probiere es in der Simulation zum dynamischen Gleichgewicht aus.' },

    { id: 'c2-1', c: 'C2', q: 'Wie lautet das Massenwirkungsgesetz für N2 + 3 H2 ⇌ 2 NH3?', o: ['K = c(N2) · c³(H2) / c²(NH3)', 'K = c²(NH3) / (c(N2) · c³(H2))', 'K = c(NH3) / (c(N2) · c(H2))', 'K = 2 c(NH3) / (c(N2) · 3 c(H2))'], a: 1, e: 'Produkte in den Zähler, Edukte in den Nenner, Koeffizienten als Exponenten.' },
    { id: 'c2-2', c: 'C2', q: 'Welche Einheit hat K<sub>c</sub> für N2 + 3 H2 ⇌ 2 NH3?', o: ['mol²/L²', 'L²/mol²', 'mol/L', 'keine Einheit'], a: 1, e: 'Δν = 2 − 4 = −2. (mol/L)<sup>−2</sup> = L²/mol².' },
    { id: 'c2-3', c: 'C2', q: 'K<sub>c</sub> = 4 · 10<sup>8</sup>. Wo liegt das Gleichgewicht?', o: ['Weit auf der Seite der Edukte', 'Genau in der Mitte', 'Weit auf der Seite der Produkte', 'Das kann man nicht sagen'], a: 2, e: 'K ≫ 1: Im Zähler (Produkte) stehen viel größere Werte als im Nenner (Edukte).' },
    { id: 'c2-4', c: 'C2', q: 'H2 + I2 ⇌ 2 HI. Im Gleichgewicht: c(H2) = c(I2) = 0,10 mol/L, c(HI) = 0,70 mol/L. Wie groß ist K<sub>c</sub>?', o: ['7', '70', '49', '0,020'], a: 2, e: 'K = 0,70² / (0,10 · 0,10) = 0,49 / 0,010 = 49. Keine Einheit, weil Δν = 0.' },
    { id: 'c2-5', c: 'C2', q: 'Welche Werte setzt man ins Massenwirkungsgesetz ein?', o: ['Die Startkonzentrationen', 'Die Gleichgewichtskonzentrationen', 'Die Massen der Stoffe', 'Die Änderungen der Konzentrationen'], a: 1, e: 'Nur Gleichgewichtskonzentrationen. Die Tabelle Start – Änderung – Gleichgewicht hilft, sie zu bestimmen.' },

    { id: 'c3-1', c: 'C3', q: 'Zu einem Gleichgewicht gibt man Edukt hinzu. Was passiert?', o: ['K wird größer', 'Das Gleichgewicht verschiebt sich zu den Produkten, K bleibt gleich', 'Das Gleichgewicht verschiebt sich zu den Edukten', 'Nichts'], a: 1, e: 'Das System verringert den Zwang, indem es zusätzliches Edukt verbraucht. K ändert sich nur mit der Temperatur.' },
    { id: 'c3-2', c: 'C3', q: 'N2 + 3 H2 ⇌ 2 NH3. Wie wirkt sich eine Druckerhöhung aus?', o: ['Es entsteht mehr NH3, das Gleichgewicht weicht zur Seite mit weniger Gasteilchen aus', 'Es entsteht weniger NH3', 'Kein Einfluss', 'K wird größer'], a: 0, e: 'Links 4 Gasteilchen, rechts 2. Weniger Teilchen bedeuten weniger Druck, also verschiebt sich das Gleichgewicht nach rechts.' },
    { id: 'c3-3', c: 'C3', q: '2 NO2 (braun) ⇌ N2O4 (farblos), die Hinreaktion ist exotherm. Das Gemisch wird erwärmt. Was beobachtest du?', o: ['Es wird heller', 'Es wird dunkler, weil die endotherme Rückreaktion begünstigt wird', 'Keine Änderung', 'Es wird farblos'], a: 1, e: 'Wärme zuführen begünstigt die Richtung, die Wärme verbraucht. Das ist die Rückreaktion, es entsteht mehr braunes NO2.' },
    { id: 'c3-4', c: 'C3', q: 'Wie wirkt ein Katalysator auf ein Gleichgewicht?', o: ['Es liegt danach mehr Produkt vor', 'Es liegt danach mehr Edukt vor', 'Das Gleichgewicht stellt sich schneller ein, die Lage bleibt gleich', 'K wird größer'], a: 2, e: 'Der Katalysator beschleunigt Hin- und Rückreaktion gleichermaßen.' },
    { id: 'c3-5', c: 'C3', q: 'Welche Änderung verändert den Wert von K<sub>c</sub>?', o: ['Konzentration ändern', 'Druck ändern', 'Temperatur ändern', 'Katalysator zugeben'], a: 2, e: 'K hängt nur von der Temperatur ab.' },
    { id: 'c3-6', c: 'C3', q: 'H2 + I2 ⇌ 2 HI (alle gasförmig). Wie wirkt sich eine Druckerhöhung auf die Lage aus?', o: ['Mehr HI', 'Weniger HI', 'Keine Verschiebung, auf beiden Seiten stehen 2 Gasteilchen', 'K wird kleiner'], a: 2, e: 'Die Zahl der Gasteilchen ändert sich nicht. Durch Verschieben lässt sich der Druck nicht verringern.' }
  ];

  function chem(s) {
    return s.replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>');
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var POS = 'CDABACBBAADACCABBDDCDCDCDBDDCABAACBBC';
  function order(q, n) {
    var idx = q.o.map(function (_, i) { return i; }).filter(function (i) { return i !== q.a; }), h = hash(q.id);
    for (var i = idx.length - 1; i > 0; i--) { h = (Math.imul(h ^ (h >>> 15), 2246822507) + i) >>> 0; var j = h % (i + 1); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    var p = 'ABCD'.indexOf(POS.charAt(n % POS.length));
    idx.splice(Math.max(0, Math.min(p, idx.length)), 0, q.a);
    return idx;
  }

  var list = $('#qlist'), byId = {};
  $('#sc-total').textContent = Q.length;
  var qc = $('#q-count'); if (qc) qc.textContent = Q.length;
  Q.forEach(function (q, n) {
    byId[q.id] = q;
    var art = document.createElement('article');
    art.className = 'q'; art.dataset.code = q.c; art.dataset.qid = q.id;
    art.innerHTML = '<div class="q-head"><span class="q-chip">' + q.c + ' · ' + SHORT[q.c] + '</span><span class="q-no">Frage ' + (n + 1) + '</span></div>' +
      '<p class="q-text">' + chem(q.q) + '</p>' +
      '<div class="opts">' + order(q, n).map(function (i, k) {
        return '<button type="button" class="opt" data-i="' + i + '"><span class="let">' + 'ABCD'.charAt(k) + '</span><span>' + chem(q.o[i]) + '</span></button>';
      }).join('') + '</div><p class="q-expl" hidden></p>';
    list.appendChild(art);
    paint(art, q);
  });

  function paint(art, q) {
    var c = state.quiz[q.id], answered = (typeof c === 'number');
    $$('.opt', art).forEach(function (b) {
      var i = +b.dataset.i;
      b.classList.remove('right', 'wrong', 'dim');
      b.disabled = answered;
      if (answered) b.classList.add(i === q.a ? 'right' : (i === c ? 'wrong' : 'dim'));
    });
    var ex = $('.q-expl', art);
    if (answered) {
      ex.innerHTML = (c === q.a ? '<strong class="ok">Richtig.</strong> ' : '<strong class="no">Nicht ganz.</strong> ') + chem(q.e);
      ex.hidden = false;
      if (window.Begriffe) window.Begriffe.mark(ex, true);
    } else { ex.hidden = true; ex.innerHTML = ''; }
  }

  list.addEventListener('click', function (ev) {
    var b = ev.target.closest('.opt'); if (!b || b.disabled) return;
    var art = b.closest('.q'), q = byId[art.dataset.qid];
    if (typeof state.quiz[q.id] === 'number') return;
    state.quiz[q.id] = +b.dataset.i; save(); paint(art, q); summary(); renderBaustellen();
  });

  function summary() {
    var right = 0, ans = 0, per = {};
    CODES.forEach(function (c) { per[c] = { n: 0, r: 0, w: 0 }; });
    Q.forEach(function (q) {
      per[q.c].n++;
      var a = state.quiz[q.id];
      if (typeof a === 'number') { ans++; if (a === q.a) { right++; per[q.c].r++; } else per[q.c].w++; }
    });
    $('#sc-right').textContent = right;
    $('#sc-ans').textContent = ans + ' von ' + Q.length + ' beantwortet';
    $('#tscores').innerHTML = CODES.map(function (c) {
      var p = per[c];
      return '<li><span class="tc">' + c + '</span><span class="tn">' + SHORT[c] + '</span><span class="tbar" aria-hidden="true"><i class="r" style="width:' + (p.r / p.n * 100) + '%"></i><i class="w" style="width:' + (p.w / p.n * 100) + '%"></i></span><span class="tv">' + p.r + '/' + p.n + '</span></li>';
    }).join('');
    var weak = quizWeak(), open = CODES.filter(function (c) { return per[c].r + per[c].w === 0; });
    var tip;
    if (ans === 0) tip = 'Noch nichts beantwortet. Wähle oben einen Punkt aus deiner Themenliste, oder fang einfach mit Frage 1 an.';
    else if (weak.length) tip = '<strong>Wiederhole zuerst:</strong> ' + weak.map(function (c) { return '<a href="#' + c.toLowerCase() + '">' + c + ' ' + TITLE[c] + '</a>'; }).join(', ') + '. Danach „Falsche nochmal versuchen“.';
    else if (open.length) tip = 'Bisher sitzt alles. Noch offen: ' + open.join(', ') + '.';
    else tip = 'Alles beantwortet und kein Punkt unter 75 %. Mach jetzt die <a href="#probeklausur">Probeklausur</a>.';
    $('#sc-tip').innerHTML = tip;
  }

  function repaintAll() { $$('.q', list).forEach(function (a) { paint(a, byId[a.dataset.qid]); }); summary(); renderBaustellen(); }
  $('#reset-wrong').addEventListener('click', function () {
    Q.forEach(function (q) { var a = state.quiz[q.id]; if (typeof a === 'number' && a !== q.a) delete state.quiz[q.id]; });
    save(); repaintAll();
  });
  var ra = $('#reset-all'), armed = null;
  function disarm() { armed = null; ra.textContent = 'Quiz zurücksetzen'; ra.classList.remove('warn'); ra.classList.add('ghost'); }
  ra.addEventListener('click', function () {
    if (!armed) {
      ra.textContent = 'Wirklich alle Antworten löschen?'; ra.classList.add('warn'); ra.classList.remove('ghost');
      armed = setTimeout(disarm, 4000); return;
    }
    clearTimeout(armed); disarm();
    state.quiz = {}; save(); repaintAll();
  });

  // Filter
  var fwrap = $('#filters');
  CODES.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'fbtn'; b.dataset.f = c; b.setAttribute('aria-pressed', 'false');
    b.textContent = c; b.title = TITLE[c];
    fwrap.appendChild(b);
  });
  function setFilter(f) {
    $$('.fbtn', fwrap).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.f === f ? 'true' : 'false'); });
    $$('.q', list).forEach(function (a) { a.hidden = (f !== 'all' && a.dataset.code !== f); });
  }
  fwrap.addEventListener('click', function (ev) { var b = ev.target.closest('.fbtn'); if (b) setFilter(b.dataset.f); });
  $$('[data-quiz]').forEach(function (a) {
    a.addEventListener('click', function () {
      setFilter(a.dataset.quiz);
      if (location.hash === '#quiz') route();
    });
  });

  /* ------------------------------------------------------------ Start */
  if (window.Begriffe) window.Begriffe.markAll();
  summary();
  renderBaustellen();
  route();
})();
