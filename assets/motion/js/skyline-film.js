/* Turium — filme 3: o gráfico "Contribution Skyline" do Dashboard, reproduzido para o filme.
   Porte fiel (somente leitura) de src/features/dashboard/movement/skyline-math.ts e skyline-engine.ts
   do Turium ERP: mesma grade (semanas × dias), mesmos níveis (percentil 95), mesma câmera
   (yaw 45°, elevação 34°), mesma altura das colunas, mesma onda de subida e o mesmo sombreamento
   das faces (0,84 / 0,68). O que muda: o relógio é o do filme (render determinístico) e há uma
   câmera cinematográfica extra (zoom/foco) e um realce dourado opcional.

   DADOS ILUSTRATIVOS: a série abaixo é sintética, gerada por semente fixa (o mesmo resultado em
   toda reprodução). Não vem de banco de cliente nem da base DEMO. Edite DATA_CFG para mudar. */
(function () {
  'use strict';
  var F = window.Film;

  /* ---------- dados ilustrativos (determinísticos) ---------- */
  var DATA_CFG = {
    product: { name: 'Cimento CP-II 50 kg', unit: 'UN', sku: null },
    from: '2025-10-09', to: '2026-10-08',        // "Últimos 365 dias" até a data da base de demonstração
    seed: 20261008,
    base: 13,                                     // sacos por dia útil, antes dos fatores
    month: { 1: .62, 2: .70, 3: .90, 4: .98, 5: 1.08, 6: 1.18, 7: 1.24, 8: 1.32, 9: 1.16, 10: 1.02, 11: 1.05, 12: .85 },
    weekday: [0, 1.18, 1.0, .98, 1.04, 1.22, .58], // domingo fechado
    closed: ['2025-11-20', '2025-12-25', '2026-01-01', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04', '2026-09-07'],
    half: ['2025-12-24', '2025-12-31', '2026-02-16', '2026-02-17'],
    bigOrderChance: .045                          // pedidos de obra (picos isolados)
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function parts(d) { return [Number(d.slice(0, 4)), Number(d.slice(5, 7)), Number(d.slice(8, 10))]; }
  function addDays(d, n) { var p = parts(d); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
  function weekdayOf(d) { var p = parts(d); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }

  function makeSeries(c) {
    var rnd = mulberry32(c.seed), out = [];
    for (var d = c.from; d <= c.to; d = addDays(d, 1)) {
      var dow = weekdayOf(d), m = parts(d)[1], day = parts(d)[2];
      var r1 = rnd(), r2 = rnd(), r3 = rnd();
      var q = 0;
      if (dow !== 0 && c.closed.indexOf(d) < 0) {
        q = c.base * c.month[m] * c.weekday[dow] * (.72 + .56 * r1);
        if (day <= 5) q *= 1.12;                    // começo do mês: obras retomam as compras
        if (c.half.indexOf(d) >= 0) q *= .45;
        if (r2 < c.bigOrderChance && dow !== 6) q += 28 + r3 * 46;
        if (r2 > .985) q = 0;                        // raro dia sem saída
        q = Math.round(q);
      }
      out.push({ date: d, count: q });
    }
    return out;
  }

  /* ---------- skyline-math (porte) ---------- */
  var clamp01 = function (v) { return v > 0 ? (v < 1 ? v : 1) : 0; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOutCubic = function (x) { var t = clamp01(x); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeOutCubic = function (x) { return 1 - Math.pow(1 - clamp01(x), 3); };
  var smoothstep = function (a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var levelOf = function (count, busy) { return count <= 0 ? 0 : busy <= 0 ? 4 : 1 + Math.min(3, Math.floor((count / busy) * 4)); };
  var barHeight = function (count, max, scale) { return count > 0 && max > 0 ? .4 + Math.pow(count / max, .85) * 7.2 * (scale || 1) : .2; };
  var WAVE = .42;
  var riseAt = function (t, week, weeks, day) {
    var d = (weeks > 1 ? week / (weeks - 1) : 0) * .36 + (day / 6) * .06;
    return easeOutCubic((t - d) / (1 - WAVE));
  };
  var YAW_3D = Math.PI / 4, ELEV_3D = 34 * Math.PI / 180;
  function camera(e, dYaw, dElev) {
    var yaw = lerp(0, YAW_3D + (dYaw || 0), e);
    var elev = lerp(Math.PI / 2, ELEV_3D + (dElev || 0), e);
    return { cs: Math.cos(yaw), sn: Math.sin(yaw), se: Math.sin(elev), ce: Math.cos(elev) };
  }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function levelColors(bg, fg, accent) {
    return [mix(bg, fg, .11), mix(bg, accent, .32), mix(bg, accent, .55), mix(bg, accent, .78), accent];
  }
  function rgb(r, g, b, a) {
    return a === undefined ? 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')'
      : 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',' + a.toFixed(3) + ')';
  }

  function buildGrid(data, from, to, weekStart) {
    var counts = {};
    data.forEach(function (d) { if (d.count > 0) counts[d.date] = d.count; });
    var cells = [];
    var start = addDays(from, -((weekdayOf(from) - weekStart + 7) % 7));
    for (var date = start, i = 0; date <= to; date = addDays(date, 1), i++) {
      var outside = date < from;
      cells.push({ date: date, count: outside ? 0 : (counts[date] || 0), level: 0, week: Math.floor(i / 7), day: i % 7, outside: outside });
    }
    var nz = cells.map(function (c) { return c.count; }).filter(function (c) { return c > 0; }).sort(function (a, b) { return a - b; });
    var busy = nz.length ? nz[Math.floor(.95 * (nz.length - 1))] : 0;
    cells.forEach(function (c) { c.level = levelOf(c.count, busy); });
    return { cells: cells, weeks: cells[cells.length - 1].week + 1, max: nz[nz.length - 1] || 0 };
  }

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var MESES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function monthLabels(cells, weeks) {
    var out = [], prev = -1;
    for (var w = 0; w < weeks; w++) {
      var c = cells[w * 7]; if (!c) break;
      var m = parts(c.date)[1];
      if (m !== prev) out.push({ week: w, label: MESES[m - 1] });
      prev = m;
    }
    if (out.length > 1 && out[1].week - out[0].week < 3) out.shift();
    return out;
  }

  /* ---------- modelo ---------- */
  var series = makeSeries(DATA_CFG);
  var grid = buildGrid(series, DATA_CFG.from, DATA_CFG.to, 0);
  var cells = grid.cells, n = cells.length, weeks = grid.weeks;
  var months = monthLabels(cells, weeks);
  var hgt = cells.map(function (c) { return barHeight(c.count, grid.max, 1); });

  // indicadores como em product-view.ts (métrica: quantidade)
  var total = 0, best = null, byMonth = {}, byDow = [0, 0, 0, 0, 0, 0, 0], occ = [0, 0, 0, 0, 0, 0, 0];
  series.forEach(function (d) {
    total += d.count;
    if (!best || d.count > best.count) best = d;
    var k = d.date.slice(0, 7); byMonth[k] = (byMonth[k] || 0) + d.count;
    var w = weekdayOf(d.date); byDow[w] += d.count; occ[w]++;
  });
  var bestMonth = null;
  Object.keys(byMonth).forEach(function (k) { if (!bestMonth || byMonth[k] > byMonth[bestMonth]) bestMonth = k; });
  var bestDow = 0;
  for (var w = 1; w < 7; w++) if (byDow[w] / occ[w] > byDow[bestDow] / occ[bestDow]) bestDow = w;
  var bestIdx = cells.findIndex(function (c) { return c.date === best.date; });
  // os 12 dias de maior saída (realce dourado)
  var topSet = {};
  cells.map(function (c, i) { return i; }).filter(function (i) { return !cells[i].outside && cells[i].count > 0; })
    .sort(function (a, b) { return cells[b].count - cells[a].count; }).slice(0, 12).forEach(function (i) { topSet[i] = 1; });

  var fmtInt = function (v) { return v.toLocaleString('pt-BR'); };
  var br = function (d) { var p = parts(d); return ('0' + p[2]).slice(-2) + '/' + ('0' + p[1]).slice(-2) + '/' + p[0]; };
  var unit = DATA_CFG.product.unit;
  var monthTotals = Object.keys(byMonth).sort().map(function (k) { return { month: k, total: byMonth[k] }; });

  var STATS = {
    product: DATA_CFG.product.name, unit: unit,
    from: DATA_CFG.from, to: DATA_CFG.to, fromBR: br(DATA_CFG.from), toBR: br(DATA_CFG.to),
    total: total, totalText: fmtInt(total) + ' ' + unit,
    bestDay: { date: best.date, br: br(best.date), value: best.count, weekday: DIAS[weekdayOf(best.date)] },
    bestMonth: { month: bestMonth, label: MESES[Number(bestMonth.slice(5)) - 1] + '/' + bestMonth.slice(0, 4), longLabel: MESES_LONGO[Number(bestMonth.slice(5)) - 1] + ' de ' + bestMonth.slice(0, 4), value: byMonth[bestMonth] },
    bestWeekday: { weekday: bestDow, label: DIAS[bestDow], average: byDow[bestDow] / occ[bestDow] },
    months: monthTotals
  };

  /* ---------- desenho (porte do draw() do skyline-engine) ---------- */
  var order = []; for (var i0 = 0; i0 < n; i0++) order.push(i0);
  var zs = new Float64Array(n);
  var last = null;

  /* o: { x, y, w, h: moldura em px do canvas; t: 0 = 2D … 1 = 3D (a mesma variável do motor);
         yaw, elev: órbita; zoom, focus:[wx,wy,wz], pull: 0..1 leva o foco ao centro;
         hi: 0..1 realce dourado (topo) e neutro (resto); alpha; font; bg, fg, accent: [r,g,b];
         labels: 0..1 } */
  function draw(ctx, o) {
    var t = o.t, e = easeInOutCubic(t);
    var cam = camera(e, o.yaw || 0, o.elev || 0);
    for (var i = 0; i < n; i++) zs[i] = riseAt(o.rise === undefined ? t : o.rise, cells[i].week, weeks, cells[i].day) * hgt[i];
    var w = lerp(.78, .9, e), off = (1 - w) / 2;

    // extensão projetada (como extent(cam, e, false))
    var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    function add(x, y, z) {
      var px = x * cam.cs - y * cam.sn, py = (x * cam.sn + y * cam.cs) * cam.se - z * cam.ce;
      if (px < minx) minx = px; if (px > maxx) maxx = px; if (py < miny) miny = py; if (py > maxy) maxy = py;
    }
    for (i = 0; i < n; i++) {
      var X0 = cells[i].week + off, Y0 = cells[i].day + off, Z = o.fitFull ? hgt[i] * e : zs[i];
      add(X0, Y0, Z); add(X0 + w, Y0, Z); add(X0, Y0 + w, Z); add(X0 + w, Y0 + w, 0); add(X0, Y0 + w, 0); add(X0 + w, Y0, 0);
    }
    add(0, 7 + 1.5 * e, 0); add(weeks, 7 + 1.5 * e, 0);

    var fs = o.font || 18;
    var gutter = (o.gutter === undefined ? fs * 3 : o.gutter);
    var pad = lerp(4, 30, e), left = o.x + pad + gutter * (1 - e), top = o.y + pad + fs * 2 * (1 - e);
    var aw = o.w - (left - o.x) - pad, ah = o.h - (top - o.y) - pad;
    var bw = Math.max(1e-6, maxx - minx), bh = Math.max(1e-6, maxy - miny);
    var s = Math.min(aw / bw, ah / bh);
    var ox = left + (aw - bw * s) / 2 - minx * s, oy = top + (ah - bh * s) / 2 - miny * s;

    // câmera do filme: zoom em torno de um ponto do mundo, que pode ser trazido ao centro
    var z = o.zoom || 1, f = o.focus || [weeks / 2, 3.5, 0], pull = o.pull || 0;
    var fx = ox + (f[0] * cam.cs - f[1] * cam.sn) * s, fy = oy + ((f[0] * cam.sn + f[1] * cam.cs) * cam.se - f[2] * cam.ce) * s;
    var cx = lerp(fx, o.x + o.w / 2, pull), cy = lerp(fy, o.y + o.h / 2, pull);
    var S = s * z;
    var PX = function (x, y) { return cx + ((ox + (x * cam.cs - y * cam.sn) * s) - fx) * z; };
    var PY = function (x, y, zz) { return cy + ((oy + ((x * cam.sn + y * cam.cs) * cam.se - zz * cam.ce) * s) - fy) * z; };
    last = { PX: PX, PY: PY, S: S, off: off, w: w };

    var bg = o.bg, fg = o.fg, cols = levelColors(bg, fg, o.accent);
    var hi = o.hi || 0, A = o.alpha === undefined ? 1 : o.alpha;
    var sn = cam.sn, cs = cam.cs, se = cam.se, ce = cam.ce;
    order.sort(function (a, c) {
      return (cells[a].week + .5) * sn + (cells[a].day + .5) * cs - ((cells[c].week + .5) * sn + (cells[c].day + .5) * cs);
    });
    var radius = lerp(.17, .03, e) * S, outline = (1 - e) * .07;
    ctx.save();
    ctx.globalAlpha = A;
    ctx.lineJoin = 'round';

    function quad(p, r) {
      ctx.beginPath();
      if (r > .5) {
        // cantos arredondados (como quadPath com raio)
        for (var k = 0; k < 4; k++) {
          var a = p[k], b = p[(k + 1) % 4], pv = p[(k + 3) % 4];
          var d1 = Math.hypot(a[0] - pv[0], a[1] - pv[1]), d2 = Math.hypot(b[0] - a[0], b[1] - a[1]);
          var rr = Math.min(r, d1 / 2, d2 / 2);
          var sx = a[0] + (pv[0] - a[0]) * rr / d1, sy = a[1] + (pv[1] - a[1]) * rr / d1;
          if (k === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          ctx.quadraticCurveTo(a[0], a[1], a[0] + (b[0] - a[0]) * rr / d2, a[1] + (b[1] - a[1]) * rr / d2);
        }
        ctx.closePath();
      } else {
        ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[1][0], p[1][1]); ctx.lineTo(p[2][0], p[2][1]); ctx.lineTo(p[3][0], p[3][1]); ctx.closePath();
      }
    }

    for (var k2 = 0; k2 < n; k2++) {
      i = order[k2];
      var c = cells[i];
      if (c.outside) continue;
      var x0 = c.week + off, y0 = c.day + off, x1 = x0 + w, y1 = y0 + w, zz = zs[i];
      var T0 = [PX(x0, y0), PY(x0, y0, zz)], T1 = [PX(x1, y0), PY(x1, y0, zz)], T2 = [PX(x1, y1), PY(x1, y1, zz)], T3 = [PX(x0, y1), PY(x0, y1, zz)];
      var col = cols[c.level].slice();
      var glow = 0;
      if (hi > 0) {
        if (topSet[i]) { col = mix(col, [255, 206, 84], .35 * hi); glow = hi; }
        else { var g = (col[0] * .2126 + col[1] * .7152 + col[2] * .0722); col = mix(col, [g * .42 + 14, g * .44 + 16, g * .48 + 19], .85 * hi); }
      }
      var tall = zz * ce * S;
      if (tall > .35 && w * cs * S > .35) {
        quad([[PX(x0, y1), PY(x0, y1, 0)], [PX(x1, y1), PY(x1, y1, 0)], T2, T3], 0);
        ctx.fillStyle = rgb(col[0] * .84, col[1] * .84, col[2] * .84); ctx.fill();
      }
      if (tall > .35 && w * sn * S > .35) {
        quad([[PX(x1, y0), PY(x1, y0, 0)], [PX(x1, y1), PY(x1, y1, 0)], T2, T1], 0);
        ctx.fillStyle = rgb(col[0] * .68, col[1] * .68, col[2] * .68); ctx.fill();
      }
      quad([T0, T1, T2, T3], radius);
      if (glow > .01) { ctx.shadowColor = rgb(243, 182, 31, .9 * glow); ctx.shadowBlur = 28 * glow; }
      ctx.fillStyle = rgb(col[0], col[1], col[2]); ctx.fill();
      ctx.shadowBlur = 0;
      if (outline > .004) { ctx.strokeStyle = rgb(fg[0], fg[1], fg[2], outline); ctx.lineWidth = 1; ctx.stroke(); }
    }

    // rótulos: em cima/à esquerda no 2D; na borda da frente no 3D
    var L = o.labels === undefined ? 1 : o.labels;
    var muted = mix(bg, fg, .55);
    ctx.font = '400 ' + fs + 'px Inter, sans-serif';
    var a2 = (1 - smoothstep(0, .4, e)) * L, a3 = smoothstep(.62, 1, e) * L;
    if (a2 > .004) {
      ctx.fillStyle = rgb(muted[0], muted[1], muted[2], a2);
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      months.forEach(function (m) { ctx.fillText(m.label, PX(m.week + off, -.3), PY(m.week + off, -.3, 0) - 5); });
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [[1, 'seg'], [3, 'qua'], [5, 'sex']].forEach(function (r) { ctx.fillText(r[1], PX(0, r[0] + .5) - 10, PY(0, r[0] + .5, 0)); });
    }
    if (a3 > .004) {
      ctx.fillStyle = rgb(muted[0], muted[1], muted[2], a3);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      var edge = -Infinity;
      months.forEach(function (m) {
        var x = PX(m.week + .5, 7.3), tw = ctx.measureText(m.label).width;
        if (x < edge) return;
        ctx.fillText(m.label, x, PY(m.week + .5, 7.3, 0) + 3);
        edge = x + tw + 10;
      });
    }
    ctx.restore();
  }

  // posição de tela do topo de uma célula (último desenho)
  function topOf(i) {
    if (!last) return [0, 0];
    var c = cells[i], x = c.week + .5, y = c.day + .5;
    return [last.PX(x, y), last.PY(x, y, zs[i])];
  }
  // centro (no chão, frente) de um mês
  function monthAnchor(ym) {
    var ws = cells.filter(function (c) { return c.date.slice(0, 7) === ym; }).map(function (c) { return c.week; });
    var wk = (Math.min.apply(null, ws) + Math.max.apply(null, ws) + 1) / 2;
    return last ? [last.PX(wk, 3.5), last.PY(wk, 3.5, 0)] : [0, 0];
  }

  F.sky = {
    draw: draw, topOf: topOf, monthAnchor: monthAnchor, stats: STATS, cells: cells, weeks: weeks,
    bestIdx: bestIdx, topSet: topSet, series: series, cfg: DATA_CFG, levelColors: levelColors, hgt: hgt
  };
})();
