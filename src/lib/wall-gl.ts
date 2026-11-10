/**
 * Samples wall (raw WebGL 1, lazy chunk): the representative set as a turning cylinder of
 * tiles, one per operational environment. Each tile is a 16:9 frame of points with an
 * abstract interior (not footage). The wall turns to bring the current named example to
 * the front, where it lifts out and lights up. Schematic, generated procedurally.
 */

type V3 = [number, number, number];
type Drag = { x: number; down: boolean; t: number };
type Opts = { hot: () => number; pointer: () => number; drag: Drag; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));

function perspective(fovy: number, aspect: number, n: number, f: number) {
  const q = 1 / Math.tan(fovy / 2);
  return [q / aspect, 0, 0, 0, 0, q, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0];
}
function lookAt(eye: V3, target: V3) {
  const z = norm(sub(eye, target));
  const x = norm(cross([0, 1, 0], z));
  const y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
}
function mul(a: number[], b: number[]) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}

export const COLS = 23;
export const ROWS = 3;
const R = 3.6;
const STEP = (Math.PI * 2) / COLS;
const TW = 2 * R * Math.sin(STEP / 2) * 0.84;
const TH = (TW * 9) / 16;
const ROW_GAP = TH * 1.22;
/** Column and row of tile i (row-major across the three rows). */
export const cell = (i: number) => ({ c: i % COLS, r: Math.floor(i / COLS) });

function build() {
  let seed = 19;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  // Each point is stored in its tile's own frame (u across, v up); the shader places the
  // tile on the cylinder and pans the interior, so every tile plays like a live feed.
  for (let i = 0; i < COLS * ROWS; i++) {
    const put = (u: number, v: number, b: number) => out.push(u, v, i, b);
    // Frame.
    for (let k = 0; k <= 24; k++) {
      const u = -TW / 2 + (TW * k) / 24;
      put(u, -TH / 2, 1);
      put(u, TH / 2, 1);
    }
    for (let k = 1; k < 14; k++) {
      const v = -TH / 2 + (TH * k) / 14;
      put(-TW / 2, v, 1);
      put(TW / 2, v, 1);
    }
    // An abstract interior: a horizon and a few masses, different for every tile.
    const horizon = (rnd() - 0.3) * TH * 0.5;
    for (let k = 0; k < 18; k++) put(-TW / 2 + TW * rnd(), horizon, 0.45);
    const blobs = 2 + Math.floor(rnd() * 3);
    for (let b = 0; b < blobs; b++) {
      const bu = (rnd() - 0.5) * TW * 0.7;
      const bv = (rnd() - 0.5) * TH * 0.6;
      const br = (0.05 + rnd() * 0.12) * TW;
      for (let k = 0; k < 22; k++) {
        const a = rnd() * Math.PI * 2;
        const d = Math.sqrt(rnd()) * br;
        put(bu + Math.cos(a) * d, bv + Math.sin(a) * d * 0.7, 0.6);
      }
    }
  }
  return new Float32Array(out);
}

const VS = `
attribute vec4 a;
uniform mat4 vp; uniform float yaw, hot, lift, px, time; uniform vec3 eye;
varying vec4 c;
void main() {
  float idx = a.z; float b = a.w;
  float col = mod(idx, ${COLS.toFixed(1)}); float row = floor(idx / ${COLS.toFixed(1)});
  float phi = col * ${STEP.toFixed(6)};
  float u = a.x;
  if (b < 0.95) {
    // Interior drifts across its frame, each tile at its own pace and direction.
    float spd = (fract(sin(idx * 12.9898) * 43758.5453) - 0.5) * 0.16;
    u = mod(u + ${(TW / 2).toFixed(6)} + time * spd, ${TW.toFixed(6)}) - ${(TW / 2).toFixed(6)};
  }
  vec3 w = vec3(${R.toFixed(3)} * sin(phi) + cos(phi) * u, (1.0 - row) * ${ROW_GAP.toFixed(6)} + a.y, ${R.toFixed(3)} * cos(phi) - sin(phi) * u);
  float cy = cos(yaw), sy = sin(yaw);
  vec3 p = vec3(cy * w.x + sy * w.z, w.y, -sy * w.x + cy * w.z);
  vec3 n = normalize(vec3(p.x, 0.0, p.z));
  float on = 1.0 - step(0.5, abs(idx - hot));
  p += n * on * lift;
  vec4 q = vp * vec4(p, 1.0);
  gl_Position = q;
  float facing = dot(n, normalize(eye - p));
  float vis = smoothstep(-0.15, 0.55, facing);
  gl_PointSize = px * (1.0 + 0.5 * on) * clamp(9.0 / q.w, 0.6, 1.6);
  vec3 tint = mix(vec3(0.17, 0.19, 0.21), vec3(0.38, 0.58, 0.0), on * lift * 3.0);
  c = vec4(tint, (0.2 + 0.6 * b) * mix(0.12, 1.0, vis) + on * 0.3);
}`;
const FS = `
precision mediump float; varying vec4 c;
void main() {
  vec2 d = gl_PointCoord - 0.5; if (dot(d, d) > 0.25) discard;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

export function start(canvas: HTMLCanvasElement, opts: Opts) {
  const ctx = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!ctx) return null;
  const gl: WebGLRenderingContext = ctx;
  const prog = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { vp: U("vp"), yaw: U("yaw"), hot: U("hot"), lift: U("lift"), px: U("px"), eye: U("eye"), time: U("time") };
  const data = build();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  const ro = new ResizeObserver(() => {
    resize();
    draw();
  });
  ro.observe(canvas);
  resize();

  const targetYaw = (i: number) => -cell(i).c * STEP;
  let shown = opts.hot();
  let yaw = targetYaw(shown);
  let lift = opts.still ? 0.28 : 0;
  let sx = 0;
  let t = 0;
  // Drag: the visitor spins the wall; it coasts, then after a few idle seconds eases back
  // so the current example faces front again.
  let spin = 0;
  let vel = 0;
  let lastX = opts.drag.x;

  function draw() {
    const want = opts.hot();
    if (want !== shown) {
      shown = want;
      lift = opts.still ? 0.28 : 0;
    }
    // Turn the shortest way round to the target.
    let d = targetYaw(shown) - yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    yaw += opts.still ? d : d * 0.06;
    const dx = opts.drag.x - lastX;
    lastX = opts.drag.x;
    if (opts.drag.down) {
      vel = dx * 0.006;
      spin += vel;
    } else {
      spin += vel;
      vel *= 0.93;
      if (performance.now() - opts.drag.t > 4000) spin = Math.atan2(Math.sin(spin), Math.cos(spin)) * 0.95;
    }
    if (!opts.still && Math.abs(d) < 0.05) lift += (0.28 - lift) * 0.08;
    sx += (opts.pointer() - sx) * 0.05;
    const aspect = canvas.width / canvas.height;
    const narrow = aspect < 1.2;
    const eye: V3 = [sx * 1.2, 0.75 + (opts.still ? 0 : 0.08 * Math.sin(t * 0.4)), narrow ? 9.6 : 8.2];
    const vp = mul(perspective(((narrow ? 38 : 30) * Math.PI) / 180, aspect, 0.1, 40), lookAt(eye, [0, 0, R * 0.6]));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(u.vp, false, vp);
    gl.uniform3fv(u.eye, eye);
    gl.uniform1f(u.yaw, yaw + spin);
    gl.uniform1f(u.time, opts.still ? 0 : t);
    gl.uniform1f(u.hot, shown);
    gl.uniform1f(u.lift, lift);
    gl.uniform1f(u.px, dpr * 1.5);
    gl.drawArrays(gl.POINTS, 0, data.length / 4);
  }

  let raf = 0;
  let last = performance.now();
  let visible = true;
  const loop = (now: number) => {
    raf = 0;
    t += Math.min(0.05, (now - last) / 1000);
    last = now;
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const run = () => {
    if (opts.still || raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver((es) => {
    visible = es[es.length - 1].isIntersecting;
    run();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", run);
  draw();
  run();
  return {
    poke: () => (opts.still ? draw() : run()),
    stop: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
    },
  };
}
