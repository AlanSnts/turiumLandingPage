/* =====================================================================
   FUNDO DO HERO — shader WebGL próprio (protótipo hero-fluido-v2 aprovado).
   Valores escolhidos no protótipo: luz 0.75 · linhas 0.55 · velocidade 1.25
   · centro limpo 0.45 · grão 0.01 · mouse ligado · véu 0.90 (no CSS).
   ===================================================================== */
(function () {
  'use strict';
  var HERO_BG = { amount: 0.75, lines: 0.55, speed: 1.25, clear: 0.45, grain: 0.01, mouse: true };
  var canvas = document.getElementById('hero-bg');
  var hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');
  var fallback = 'radial-gradient(ellipse 35% 45% at 85% 25%, rgba(243,182,31,.28), transparent 70%), radial-gradient(ellipse 30% 40% at 12% 70%, rgba(216,157,14,.22), transparent 70%)';

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { canvas.style.background = fallback; return; }

  var FRAG = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uTime; uniform float uAmount; uniform float uLines;',
    'uniform vec2 uMouse; uniform float uMouseOn; uniform float uClear; uniform float uGrain; uniform float uScroll; uniform float uIntro;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p){ float v = 0.0; float a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8);',
    '  for (int i = 0; i < 3; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; } return v / 0.875; }',
    // Campo de manchas com domain warping (mesmo motor da v1), parametrizado por camada.
    'float field(vec2 p, float t, float seed){',
    '  vec2 q = vec2(fbm(p + vec2(seed, t * 0.06)), fbm(p + vec2(5.2 + seed, 1.3) - t * 0.05));',
    '  vec2 r = vec2(fbm(p + 1.4 * q + vec2(1.7, 9.2) + t * 0.08), fbm(p + 1.4 * q + vec2(8.3, 2.8) - t * 0.06));',
    '  return smoothstep(0.30, 0.60, fbm(p + 1.2 * r));',
    '}',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  float aspect = uRes.x / uRes.y;',
    '  float t = uTime;',
    '  vec2 m = (uMouse - 0.5) * uMouseOn;',
    '  vec2 base = vec2(uv.x * aspect, uv.y + uScroll * 0.18);',
    // Duas camadas: fundo (maior, lenta, parallax menor) e principal.
    '  float back = field(base * 0.55 - m * 0.05, t * 0.55, 11.0);',
    '  float f = field(base * 0.85 - m * 0.12, t, 0.0);',
    '  vec2 d = (uv - uMouse) * vec2(aspect, 1.0);',
    '  float near = exp(-dot(d, d) * 9.0) * uMouseOn;',
    '  f += 0.28 * uMouseOn * exp(-dot(d, d) * 6.0);',
    // Centro limpo: as manchas evitam a área da headline.
    '  vec2 c = (uv - vec2(0.5, 0.6)) * vec2(aspect * 0.85, 1.7);',
    '  float away = smoothstep(0.0, 0.95, length(c));',
    '  f *= mix(1.0, mix(0.5, 1.0, away), uClear);',
    '  back *= mix(1.0, mix(0.65, 1.0, away), uClear);',
    '  float shift = (uAmount - 1.0) * 0.18;',
    '  float glow = smoothstep(-0.15 - shift, 0.6 - shift, f);',
    '  float blob = smoothstep(0.05 - shift, 0.55 - shift, f);',
    '  float hot  = smoothstep(0.40 - shift, 0.80 - shift, f);',
    '  float core = smoothstep(0.78 - shift, 1.05 - shift, f);',
    '  vec3 bg   = vec3(0.067, 0.075, 0.086);',
    '  vec3 deep = vec3(0.847, 0.616, 0.055);',
    '  vec3 gold = vec3(0.953, 0.714, 0.122);',
    '  vec3 warm = vec3(1.0, 0.90, 0.70);',
    '  vec3 col = bg + deep * 0.20 * smoothstep(0.1, 0.75, back);',
    '  col += deep * 0.16 * glow;',
    '  col = mix(col, deep * 0.72, blob * 0.7);',
    '  col = mix(col, gold, hot * 0.9);',
    '  col = mix(col, warm, core * 0.35);',
    // Linhas: mais espaçadas, cada fileira desliza na sua velocidade, tracejado variado.
    '  float period = 9.0;',
    '  float row = floor(gl_FragCoord.y / period);',
    '  float inRow = fract(gl_FragCoord.y / period);',
    '  float line = smoothstep(0.0, 0.07, inRow) * (1.0 - smoothstep(0.2, 0.27, inRow));',
    '  float speed = (hash(vec2(row, 3.1)) - 0.5) * 70.0;',
    '  float xs = gl_FragCoord.x + speed * t;',
    '  float seg = noise(vec2(xs / 110.0 + row * 7.31, row * 1.7));',
    '  float dash = smoothstep(0.30, 0.36, seg) * (0.55 + 0.45 * hash(vec2(floor(xs / 18.0), row)));',
    '  float lineMask = line * dash * smoothstep(0.50 - shift, 0.85 - shift, f) * uLines * (1.0 + 0.9 * near);',
    '  col = mix(col, vec3(1.0, 0.94, 0.84), clamp(lineMask, 0.0, 1.0) * 0.85);',
    '  col *= 0.85 + 0.15 * smoothstep(1.1, 0.3, length((uv - 0.5) * vec2(aspect * 0.7, 1.0)));',
    '  col += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 100.0) - 0.5) * uGrain;',
    // Entrada: surge do preto.
    '  col = mix(vec3(0.035, 0.043, 0.055), col, uIntro);',
    '  col += (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');
  var VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('[Turium] Fundo do hero indisponível, usando fallback:', err);
    canvas.style.background = fallback;
    return;
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uTime', 'uAmount', 'uLines', 'uMouse', 'uMouseOn', 'uClear', 'uGrain', 'uScroll', 'uIntro'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  // Resolução 1:1 com o pixel CSS: as linhas de 2 px precisam ficar nítidas.
  function resize() {
    var w = Math.max(1, Math.round(canvas.clientWidth));
    var h = Math.max(1, Math.round(canvas.clientHeight));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }

  // Mouse suavizado; só em dispositivos com ponteiro preciso (desktop).
  var mouse = { x: 0.72, y: 0.62, tx: 0.72, ty: 0.62, on: 0, ton: 0 };
  hero.addEventListener('pointermove', function (e) {
    if (!HERO_BG.mouse || !finePointer.matches) return;
    var rect = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - rect.left) / rect.width;
    mouse.ty = 1 - (e.clientY - rect.top) / rect.height;
    mouse.ton = 1;
  });
  hero.addEventListener('pointerleave', function () { mouse.ton = 0; });

  var simTime = 20.0, last = performance.now(), introStart = last, visible = true, running = false;
  function draw() {
    resize();
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, simTime);
    gl.uniform1f(U.uAmount, HERO_BG.amount);
    gl.uniform1f(U.uLines, HERO_BG.lines);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uMouseOn, mouse.on);
    gl.uniform1f(U.uClear, HERO_BG.clear);
    gl.uniform1f(U.uGrain, HERO_BG.grain);
    gl.uniform1f(U.uScroll, Math.min(window.scrollY / window.innerHeight, 1.5));
    var k0 = reduce.matches ? 1 : Math.min(1, (performance.now() - introStart) / 1600);
    gl.uniform1f(U.uIntro, 1 - Math.pow(1 - k0, 3));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(now - last, 50) / 1000;
    last = now;
    simTime += dt * HERO_BG.speed;
    var k = 1 - Math.pow(0.02, dt);
    mouse.x += (mouse.tx - mouse.x) * k; mouse.y += (mouse.ty - mouse.y) * k;
    mouse.on += (mouse.ton - mouse.on) * k;
    draw();
    requestAnimationFrame(frame);
  }
  // Pausa fora da tela, com a aba oculta e com "reduzir movimento" (quadro estático).
  function update() {
    var shouldRun = visible && !document.hidden && !reduce.matches;
    if (shouldRun && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    if (!shouldRun) { running = false; draw(); }
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; update(); }).observe(canvas);
  document.addEventListener('visibilitychange', update);
  reduce.addEventListener('change', update);
  window.addEventListener('resize', function () { if (!running) draw(); });
  draw();
  update();
})();
