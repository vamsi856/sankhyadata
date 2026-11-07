/**
 * Delivery batch (raw WebGL 1, lazy chunk). Seven plates, one per deliverable, each drawn
 * in points with its own pattern: footage, lines of description, subtitles, a waveform, a
 * folder grid, a manifest table, a check. Once in view they fly in one by one and settle
 * into a batch, Verification landing on top. The current layer (hovered row, or the last
 * to arrive) lifts and lights. Schematic, generated procedurally.
 */

type V3 = [number, number, number];
type Opts = { current: () => number; pointer: () => number; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

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
/** Translate, then turn about y. */
function model(p: V3, yaw: number) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, p[0], p[1], p[2], 1];
}

const LAYERS = 7;
const W = 0.8; // plate half-width (x)
const D = 0.45; // plate half-depth (z)
const GAP = 0.25;

/** One plate's points in the x-z plane, centred at the origin. */
function plate(kind: number) {
  let seed = 31 + kind * 7;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  const put = (x: number, z: number, b = 1) => out.push(x, 0, z, b);
  const seg = (x0: number, z0: number, x1: number, z1: number, n: number, b = 1) => {
    for (let i = 0; i < n; i++) put(x0 + ((x1 - x0) * i) / (n - 1), z0 + ((z1 - z0) * i) / (n - 1), b);
  };
  seg(-W, -D, W, -D, 40);
  seg(-W, D, W, D, 40);
  seg(-W, -D, -W, D, 24);
  seg(W, -D, W, D, 24);
  const iw = W * 0.82;
  const id = D * 0.78;
  if (kind === 0) {
    for (let i = 0; i < 700; i++) put((rnd() * 2 - 1) * iw, (rnd() * 2 - 1) * id, 0.35 + 0.65 * rnd());
  } else if (kind === 1) {
    for (let l = 0; l < 7; l++) {
      const z = -id + (l * 2 * id) / 6;
      seg(-iw, z, -iw + iw * 2 * (0.45 + 0.5 * rnd()), z, 26, 0.8);
    }
  } else if (kind === 2) {
    seg(-iw * 0.55, id * 0.55, iw * 0.55, id * 0.55, 22);
    seg(-iw * 0.35, id * 0.85, iw * 0.35, id * 0.85, 16);
    for (let i = 0; i < 160; i++) put((rnd() * 2 - 1) * iw, -id + rnd() * id * 1.1, 0.25);
  } else if (kind === 3) {
    for (let k = -18; k <= 18; k++) {
      const x = (k / 18) * iw;
      const h = 0.04 + 0.3 * Math.abs(Math.sin(k * 0.55)) * (1 - Math.abs(k) / 22);
      seg(x, -h, x, h, 8);
    }
  } else if (kind === 4) {
    for (let a = 0; a < 4; a++)
      for (let b = 0; b < 3; b++) {
        const cx = -iw + 0.21 + a * 0.42;
        const cz = -id + 0.12 + b * 0.24;
        seg(cx - 0.13, cz - 0.07, cx + 0.13, cz - 0.07, 9);
        seg(cx - 0.13, cz + 0.07, cx + 0.13, cz + 0.07, 9);
        seg(cx - 0.13, cz - 0.07, cx - 0.13, cz + 0.07, 5);
        seg(cx + 0.13, cz - 0.07, cx + 0.13, cz + 0.07, 5);
      }
  } else if (kind === 5) {
    for (let l = 0; l < 6; l++) seg(-iw, -id + (l * 2 * id) / 5, iw, -id + (l * 2 * id) / 5, 36, 0.7);
    for (const x of [-iw * 0.2, iw * 0.25, iw * 0.6]) seg(x, -id, x, id, 14, 0.7);
  } else {
    seg(-0.3, 0.0, -0.08, 0.2, 14);
    seg(-0.08, 0.2, 0.34, -0.22, 24);
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2;
      put(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0.6);
    }
  }
  return new Float32Array(out);
}

const VS = `
attribute vec4 a;
uniform mat4 mvp; uniform float px; uniform vec4 lc;
varying vec4 c;
void main() {
  vec4 q = mvp * vec4(a.xyz, 1.0);
  gl_Position = q;
  gl_PointSize = px * clamp(4.5 / q.w, 0.7, 1.8);
  c = vec4(lc.rgb, lc.a * a.w);
}`;
const FS = `
precision mediump float; varying vec4 c;
void main() {
  vec2 d = gl_PointCoord - 0.5; if (dot(d, d) > 0.25) discard;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

const INK: V3 = [0.17, 0.19, 0.21];
const HOT: V3 = [0.38, 0.58, 0.0];

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
  const uMvp = gl.getUniformLocation(prog, "mvp");
  const uPx = gl.getUniformLocation(prog, "px");
  const uLc = gl.getUniformLocation(prog, "lc");
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  const plates = Array.from({ length: LAYERS }, (_, i) => {
    const d = plate(i);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
    return { buf, n: d.length / 4 };
  });
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

  // Assembly runs on its own clock from the first time the canvas is seen.
  let built = opts.still ? LAYERS : 0;
  let t = 0;
  let sx = 0;
  const lift = new Array(LAYERS).fill(0);

  function draw() {
    const cur = opts.current();
    const focus = cur >= 0 ? cur : Math.min(LAYERS - 1, Math.floor(built - 0.6));
    sx += (opts.pointer() - sx) * 0.05;
    const aspect = canvas.width / canvas.height;
    const va = 0.72 + sx * 0.35 + (opts.still ? 0 : 0.06 * Math.sin(t * 0.3));
    const R = aspect < 1.1 ? 5.0 : 4.3;
    const eye: V3 = [Math.sin(va) * R, 3.0, Math.cos(va) * R];
    const vp = mul(perspective((34 * Math.PI) / 180, aspect, 0.1, 30), lookAt(eye, [0, 0.8, 0]));
    gl.uniform1f(uPx, dpr * 1.7);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < LAYERS; i++) {
      const a = ease(clamp(built - i));
      if (a <= 0.001) continue;
      const on = i === focus ? 1 : 0;
      lift[i] += (on - lift[i]) * (opts.still ? 1 : 0.12);
      const y = i * GAP + lift[i] * 0.22 + (1 - a) * 1.4;
      const x = (1 - a) * 2.2;
      const yaw = (1 - a) * 0.9;
      const k = lift[i];
      const col: V3 = [INK[0] + (HOT[0] - INK[0]) * k, INK[1] + (HOT[1] - INK[1]) * k, INK[2] * (1 - k)];
      const alpha = a * (0.55 + 0.45 * Math.max(k, i === LAYERS - 1 ? 0.6 : 0));
      gl.uniformMatrix4fv(uMvp, false, mul(vp, model([x, y, 0], yaw)));
      gl.uniform4f(uLc, col[0] * alpha, col[1] * alpha, col[2] * alpha, alpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, plates[i].buf);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, plates[i].n);
    }
  }

  let raf = 0;
  let last = performance.now();
  let visible = false;
  const loop = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    if (visible) built = Math.min(LAYERS, built + dt * 2.2);
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const run = () => {
    if (opts.still || raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      run();
    },
    { threshold: 0.35 },
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", run);
  draw();
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
