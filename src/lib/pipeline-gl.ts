/**
 * Methodology pipeline (raw WebGL 1, lazy chunk). Seven gates stand along a curved track,
 * one per stage, each with a point-cloud glyph above it. A clip rides the track as the
 * visitor scrolls through the steps and gathers each stage's layer as it passes: footage
 * at Acquisition, boxes at Annotation, a waveform at Narration, a check at Quality control,
 * then it settles on the batch at Delivery. Schematic, generated procedurally.
 */

type V3 = [number, number, number];
type Opts = { stage: () => number; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

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
/** Translation plus a turn about the vertical axis. */
function model(p: V3, yaw: number) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, p[0], p[1], p[2], 1];
}

const STEPS = 7;
const SPACING = 1.7;
/** The track: along x, with a gentle bend in depth. */
const track = (s: number): V3 => [s * SPACING, 0, 0.55 * Math.sin(s * 0.85)];
const tangent = (s: number): V3 => norm(sub(track(s + 0.01), track(s - 0.01)));

function pts(seed0: number) {
  let seed = seed0;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  const put = (p: V3, b = 1) => out.push(p[0], p[1], p[2], b);
  const seg = (a: V3, b: V3, n: number, w = 1) => {
    for (let i = 0; i < n; i++) put(add(a, scale(sub(b, a), i / (n - 1))), w);
  };
  const poly = (ps: V3[], n: number, closed = false, w = 1) => {
    const list = closed ? [...ps, ps[0]] : ps;
    for (let i = 0; i < list.length - 1; i++) seg(list[i], list[i + 1], n, w);
  };
  const rect = (cx: number, cy: number, w: number, h: number, z: number, n: number, b = 1) =>
    poly([[cx - w, cy - h, z], [cx + w, cy - h, z], [cx + w, cy + h, z], [cx - w, cy + h, z]], n, true, b);
  return { rnd, out, put, seg, poly, rect, done: () => new Float32Array(out) };
}

/** Glyph for each stage, in the x-y plane (facing the camera), centred at the origin. */
function glyph(i: number) {
  const g = pts(100 + i);
  if (i === 0) {
    for (let x = -3; x <= 3; x++) for (let y = -2; y <= 2; y++) g.put([x * 0.07, y * 0.07, 0], 0.6);
    g.rect(0.035, 0.0, 0.1, 0.075, 0, 14);
  } else if (i === 1) {
    g.rect(0, 0, 0.1, 0.18, 0, 26);
    g.rect(0, 0.13, 0.015, 0.015, 0, 4);
  } else if (i === 2) {
    const o: V3 = [-0.18, 0, 0];
    const c: V3[] = [[0.2, 0.13, 0.1], [0.2, -0.13, 0.1], [0.2, -0.13, -0.1], [0.2, 0.13, -0.1]];
    for (const p of c) g.seg(o, p, 24);
    g.poly(c, 16, true);
  } else if (i === 3) {
    g.rect(-0.05, 0.02, 0.13, 0.11, 0, 18);
    g.rect(0.09, -0.05, 0.1, 0.09, 0, 14);
  } else if (i === 4) {
    for (let k = -6; k <= 6; k++) {
      const h = 0.03 + 0.14 * Math.abs(Math.sin(k * 0.9)) * (1 - Math.abs(k) / 8);
      g.seg([k * 0.032, -h, 0], [k * 0.032, h, 0], 10);
    }
  } else if (i === 5) {
    for (let k = 0; k < 60; k++) {
      const a = (k / 60) * Math.PI * 2;
      g.put([Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0]);
    }
    g.poly([[-0.09, 0.0, 0], [-0.02, -0.07, 0], [0.1, 0.08, 0]], 16);
  } else {
    for (let k = 0; k < 3; k++) {
      const y = -0.08 + k * 0.08;
      g.poly([[-0.2, y, 0], [0, y - 0.05, 0.12], [0.2, y, 0], [0, y + 0.05, -0.12]], 12, true);
    }
  }
  return g.done();
}

/** Static world: the dotted track, its rails, and a gate (a vertical ring) at each station. */
function world() {
  const g = pts(5);
  for (let s = -0.6; s <= STEPS - 0.4; s += 0.02) {
    const p = track(s);
    const n = cross(tangent(s), [0, 1, 0]);
    g.put(add(p, scale(n, 0.42)), 0.55);
    g.put(add(p, scale(n, -0.42)), 0.55);
    if (Math.round(s * 50) % 6 === 0) g.seg(add(p, scale(n, -0.42)), add(p, scale(n, 0.42)), 10, 0.25);
  }
  for (let i = 0; i < 1500; i++) g.put([g.rnd() * 13.5 - 1.5, 0, g.rnd() * 4 - 2], 0.12);
  return g.done();
}
function gate() {
  const g = pts(9);
  for (let k = 0; k < 160; k++) {
    const a = (k / 160) * Math.PI;
    g.put([0, 0.05 + Math.sin(a) * 0.62, Math.cos(a) * 0.62]);
  }
  return g.done();
}

/** The clip and its layers, in local coordinates: the plate stands in the y-z plane. */
function clipParts() {
  const W = 0.34;
  const H = 0.19;
  const Y = 0.42;
  const frame = pts(1);
  frame.poly([[0, Y - H, -W], [0, Y - H, W], [0, Y + H, W], [0, Y + H, -W]], 28, true);
  const footage = pts(2);
  for (let i = 0; i < 700; i++) footage.put([0, Y + (footage.rnd() * 2 - 1) * H * 0.92, (footage.rnd() * 2 - 1) * W * 0.95], 0.5 + 0.5 * footage.rnd());
  const boxes = pts(3);
  boxes.poly([[0, Y - 0.1, -0.2], [0, Y - 0.1, -0.02], [0, Y + 0.12, -0.02], [0, Y + 0.12, -0.2]], 10, true);
  boxes.poly([[0, Y - 0.14, 0.04], [0, Y - 0.14, 0.24], [0, Y + 0.04, 0.24], [0, Y + 0.04, 0.04]], 10, true);
  const wave = pts(4);
  for (let k = -10; k <= 10; k++) {
    const h = 0.015 + 0.05 * Math.abs(Math.sin(k * 0.7));
    wave.seg([0, Y - H - 0.09 - h, k * 0.031], [0, Y - H - 0.09 + h, k * 0.031], 6);
  }
  const check = pts(6);
  check.poly([[0, Y + H + 0.1, W - 0.12], [0, Y + H + 0.05, W - 0.07], [0, Y + H + 0.15, W + 0.02]], 10);
  return [frame.done(), footage.done(), boxes.done(), wave.done(), check.done()];
}

const VS = `
attribute vec4 a;
uniform mat4 mvp; uniform float px; uniform vec4 lc;
varying vec4 c;
void main() {
  vec4 q = mvp * vec4(a.xyz, 1.0);
  gl_Position = q;
  gl_PointSize = px * clamp(5.0 / q.w, 0.7, 1.8);
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

  const mesh = (data: Float32Array) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buf, n: data.length / 4 };
  };
  const worldMesh = mesh(world());
  const gateMesh = mesh(gate());
  const glyphs = Array.from({ length: STEPS }, (_, i) => mesh(glyph(i)));
  const clip = clipParts().map(mesh);
  const stack = mesh(
    (() => {
      const g = pts(77);
      for (let k = 0; k < 4; k++) {
        const y = 0.05 + k * 0.05;
        g.poly([[-0.2, y, -0.34], [0.2, y, -0.34], [0.2, y, 0.34], [-0.2, y, 0.34]], 22, true, 0.8);
      }
      return g.done();
    })(),
  );

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

  let s = opts.stage();
  let t = 0;
  const draw = () => {
    const target = clamp(opts.stage(), -0.9, STEPS - 1);
    s += (target - s) * (opts.still ? 1 : 0.08);
    const aspect = canvas.width / canvas.height;
    const at = track(s);
    const wide = aspect > 1.6;
    const eye = add(at, wide ? [-1.9, 1.35, 3.0] : [-1.5, 1.6, 3.4]);
    const look = add(at, [0.9, 0.3, 0]);
    const vp = mul(perspective(((wide ? 34 : 40) * Math.PI) / 180, aspect, 0.05, 40), lookAt(eye, look));
    gl.uniform1f(uPx, dpr * 1.6);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const drawMesh = (m: { buf: WebGLBuffer | null; n: number }, M: number[], col: V3, alpha: number) => {
      if (alpha < 0.01 || !m.n) return;
      gl.uniformMatrix4fv(uMvp, false, mul(vp, M));
      gl.uniform4f(uLc, col[0] * alpha, col[1] * alpha, col[2] * alpha, alpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, m.n);
    };
    const I = model([0, 0, 0], 0);
    drawMesh(worldMesh, I, INK, 0.75);
    for (let i = 0; i < STEPS; i++) {
      const p = track(i);
      const tg = tangent(i);
      const yaw = Math.atan2(-tg[2], tg[0]);
      const on = clamp(1 - Math.abs(s - i) * 1.4);
      const done = s > i + 0.5 ? 1 : 0;
      const col: V3 = [INK[0] + (HOT[0] - INK[0]) * Math.max(on, done * 0.5), INK[1] + (HOT[1] - INK[1]) * Math.max(on, done * 0.5), INK[2] * (1 - on)];
      drawMesh(gateMesh, model(p, yaw), col, 0.55 + 0.45 * on);
      const bob = opts.still ? 0 : 0.03 * Math.sin(t * 1.4 + i);
      // The stage being read turns slowly and breathes, so its symbol reads in depth.
      const turn = opts.still ? 0 : on * Math.sin(t * 0.9 + i) * 0.9;
      const pulse = 1 + (opts.still ? 0 : on * 0.07 * Math.sin(t * 3.2));
      const G = mul(model(add(p, [0, 1.05 + 0.12 * on + bob, 0]), turn), [pulse, 0, 0, 0, 0, pulse, 0, 0, 0, 0, pulse, 0, 0, 0, 0, 1]);
      drawMesh(glyphs[i], G, col, 0.5 + 0.5 * on);
    }
    drawMesh(stack, model(track(STEPS - 1), Math.atan2(-tangent(STEPS - 1)[2], tangent(STEPS - 1)[0])), INK, 0.7);
    // A production line: faint clips flow along the track all the time, each gathering the
    // layers of the stages it has passed, so the pipeline reads as continuous work.
    if (!opts.still)
      for (let g = 0; g < 6; g++) {
        const gs = ((t * 0.22 + g / 6) % 1) * (STEPS - 1.2) + 0.1;
        if (Math.abs(gs - s) < 0.45) continue; // keep clear of the visitor's clip
        const gt = tangent(gs);
        const GM = mul(model(track(gs), Math.atan2(-gt[2], gt[0])), model([0, 0, 0], 0));
        const fadeIn = clamp(gs / 0.4) * clamp((STEPS - 1.1 - gs) / 0.4);
        const gl2 = (k: number) => clamp((gs - k + 0.45) / 0.35) * fadeIn;
        drawMesh(clip[0], GM, INK, 0.35 * fadeIn);
        drawMesh(clip[1], GM, INK, 0.3 * gl2(2));
        drawMesh(clip[2], GM, HOT, 0.4 * gl2(3));
        drawMesh(clip[3], GM, HOT, 0.4 * gl2(4));
        drawMesh(clip[4], GM, HOT, 0.4 * gl2(5));
      }
    // The clip: rides the track, gathering layers; at Delivery it settles onto the stack.
    const tg = tangent(s);
    const yaw = Math.atan2(-tg[2], tg[0]);
    // At Delivery the clip tips over about its own centre and lies on top of the batch.
    const settle = clamp((s - (STEPS - 1.7)) / 0.7);
    const e = settle * settle * (3 - 2 * settle);
    const th = e * Math.PI * 0.5;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const tip = [c, sn, 0, 0, -sn, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const lift = 0.42 + (0.27 - 0.42) * e;
    const lay = (k: number) => clamp((s - k + 0.45) / 0.35);
    const M = mul(mul(model(at, yaw), model([0, lift, 0], 0)), mul(tip, model([0, -0.42, 0], 0)));
    drawMesh(clip[0], M, HOT, 1);
    drawMesh(clip[1], M, INK, lay(2));
    drawMesh(clip[2], M, HOT, lay(3));
    drawMesh(clip[3], M, HOT, lay(4));
    drawMesh(clip[4], M, HOT, lay(5));
  };

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
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
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
