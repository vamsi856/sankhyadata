/**
 * Rig viewer (raw WebGL 1, lazy chunk): a recorder's head and shoulders drawn as a point
 * cloud, wearing whichever capture rig is selected, with that rig's camera cone projecting
 * onto a workbench; points inside the cone light up. Changing rig cross-fades the
 * accessories and swings the cone to the new vantage. Schematic, generated procedurally.
 *
 * Rig order follows `rigs.items` in content.ts: 0 head-mounted iPhone, 1 cap camera with
 * power bank, 2 cap camera with phone in pocket, 3 human rig (vantage per task).
 */

type V3 = [number, number, number];
type Opts = { index: () => number; pointer: () => [number, number]; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const mix = (a: V3, b: V3, t: number): V3 => add(a, scale(sub(b, a), t));

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

function sampler(seed0: number) {
  let seed = seed0;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = (a: number, b: number) => a + (b - a) * rnd();
  const out: number[] = [];
  const put = (p: V3, b: number) => out.push(p[0], p[1], p[2], b);
  const dir = (): V3 => {
    const z = r(-1, 1);
    const a = r(0, Math.PI * 2);
    const s = Math.sqrt(1 - z * z);
    return [s * Math.cos(a), z, s * Math.sin(a)];
  };
  const ellipsoid = (c: V3, rad: V3, n: number, b: number, keep: (d: V3) => boolean = () => true) => {
    for (let i = 0; i < n; ) {
      const d = dir();
      if (!keep(d)) continue;
      put([c[0] + d[0] * rad[0], c[1] + d[1] * rad[1], c[2] + d[2] * rad[2]], b);
      i++;
    }
  };
  const box = (c: V3, s: V3, n: number, b: number) => {
    for (let i = 0; i < n; i++) {
      const p: V3 = [r(-1, 1), r(-1, 1), r(-1, 1)];
      p[Math.floor(rnd() * 3)] = rnd() < 0.5 ? -1 : 1;
      put([c[0] + p[0] * s[0], c[1] + p[1] * s[1], c[2] + p[2] * s[2]], b);
    }
  };
  const tube = (y0: number, y1: number, rx: (t: number) => number, rz: (t: number) => number, cx: number, n: number, b: number) => {
    for (let i = 0; i < n; i++) {
      const t = rnd();
      const a = r(0, Math.PI * 2);
      put([cx + Math.cos(a) * rx(t), y0 + (y1 - y0) * t, Math.sin(a) * rz(t)], b);
    }
  };
  const line = (a: V3, b2: V3, n: number, b: number) => {
    for (let i = 0; i < n; i++) put(mix(a, b2, i / (n - 1)), b);
  };
  const limb = (a: V3, b2: V3, rad: number, n: number, b: number) => {
    const d = norm(sub(b2, a));
    const e1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const e2 = cross(d, e1);
    for (let i = 0; i < n; i++) {
      const t = rnd();
      const ang = r(0, Math.PI * 2);
      put(add(mix(a, b2, t), add(scale(e1, Math.cos(ang) * rad), scale(e2, Math.sin(ang) * rad))), b);
    }
  };
  return { r, out, put, ellipsoid, box, tube, line, limb };
}

const HEAD: V3 = [0, 1.6, 0];
const HR: V3 = [0.085, 0.115, 0.1];

function buildBody() {
  const s = sampler(11);
  s.ellipsoid(HEAD, HR, 1700, 0.75);
  s.ellipsoid([0, 1.58, 0.1], [0.018, 0.03, 0.02], 60, 0.75); // nose
  s.tube(1.38, 1.5, () => 0.048, () => 0.045, 0, 220, 0.5); // neck
  s.tube(0.92, 1.38, (t) => 0.15 + 0.07 * Math.min(1, t * 2.2), (t) => 0.09 + 0.02 * t, 0, 2600, 0.35); // torso
  s.ellipsoid([0, 1.37, 0], [0.22, 0.04, 0.1], 500, 0.35); // shoulder line
  return new Float32Array(s.out);
}

/** What the rig camera sees: arms reaching to the bench, hands at work, the bench itself. */
function buildWork() {
  const s = sampler(13);
  for (const side of [-1, 1]) {
    const shoulder: V3 = [side * 0.22, 1.35, 0.02];
    const elbow: V3 = [side * 0.27, 1.1, 0.22];
    const wrist: V3 = [side * 0.16, 0.99, 0.5];
    s.limb(shoulder, elbow, 0.042, 420, 0.4);
    s.limb(elbow, wrist, 0.034, 380, 0.45);
    s.ellipsoid([side * 0.14, 0.975, 0.58], [0.042, 0.018, 0.06], 260, 0.7); // hand
    for (let f = 0; f < 4; f++) s.limb([side * (0.115 + f * 0.017), 0.97, 0.62], [side * (0.11 + f * 0.02), 0.945, 0.7], 0.007, 40, 0.7);
  }
  const limbs = s.out.length;
  // Workbench ahead of the recorder, and a few objects on it.
  for (let i = 0; i < 2600; i++) s.put([s.r(-0.55, 0.55), 0.92, s.r(0.35, 1.15)], 0.4);
  s.box([0.12, 0.97, 0.7], [0.08, 0.05, 0.06], 260, 0.6);
  s.box([-0.22, 0.94, 0.85], [0.12, 0.02, 0.07], 200, 0.6);
  return { data: new Float32Array(s.out), limbs: limbs / 4 };
}

/** Accessory points for each rig, and the camera each one carries. */
function buildRigs() {
  const parts: Float32Array[] = [];
  const cap = (s: ReturnType<typeof sampler>) => {
    s.ellipsoid([HEAD[0], HEAD[1] + 0.012, HEAD[2]], [HR[0] * 1.1, HR[1] * 1.02, HR[2] * 1.08], 900, 1, (d) => d[1] > 0.32);
    for (let i = 0; i < 380; i++) {
      const a = s.r(-1.25, 1.25);
      const rr = s.r(0.0, 1);
      s.put([Math.sin(a) * (0.095 + 0.0 * rr), 1.652, 0.07 + Math.cos(a) * 0.04 + rr * 0.1], 1); // brim
    }
    s.box([0, 1.666, 0.185], [0.018, 0.014, 0.012], 120, 1); // camera on the brim
  };
  // 0: head-mounted iPhone: a strap round the head and the phone across the forehead.
  {
    const s = sampler(21);
    for (let i = 0; i < 420; i++) {
      const a = s.r(0, Math.PI * 2);
      s.put([Math.cos(a) * HR[0] * 1.07, 1.64 + s.r(-0.008, 0.008), Math.sin(a) * HR[2] * 1.07], 1);
    }
    s.box([0, 1.635, 0.118], [0.072, 0.036, 0.005], 380, 1);
    parts.push(new Float32Array(s.out));
  }
  // 1: cap camera powered by a power bank (the power bank is not drawn).
  {
    const s = sampler(31);
    cap(s);
    parts.push(new Float32Array(s.out));
  }
  // 2: cap camera, connected by USB-C to a phone in the pocket.
  {
    const s = sampler(41);
    cap(s);
    s.line([0.02, 1.664, 0.17], [0.1, 1.62, 0.08], 30, 1);
    s.line([0.1, 1.62, 0.08], [0.11, 1.45, 0.02], 40, 1);
    s.line([0.11, 1.45, 0.02], [0.17, 1.1, 0.1], 90, 1);
    s.line([0.17, 1.1, 0.1], [0.17, 1.0, 0.11], 30, 1);
    s.box([0.17, 0.97, 0.11], [0.035, 0.07, 0.006], 220, 1);
    parts.push(new Float32Array(s.out));
  }
  // 3: human rig: no fixed accessory; its vantage is set per task.
  parts.push(new Float32Array(0));
  return parts;
}

const CAMS: { o: V3; pitch: number }[] = [
  { o: [0, 1.635, 0.125], pitch: -0.72 },
  { o: [0, 1.666, 0.2], pitch: -0.86 },
  { o: [0, 1.666, 0.2], pitch: -0.86 },
  { o: [0, 1.6, 0.11], pitch: -0.78 },
];

const VS = `
attribute vec4 a;
uniform mat4 mvp; uniform vec3 hd, fw, rt, up; uniform vec2 tf; uniform float px, mode, ps; uniform vec4 lc;
varying vec4 c;
void main() {
  vec4 q = mvp * vec4(a.xyz, 1.0);
  gl_Position = q;
  if (mode > 0.5) { c = vec4(lc.rgb, lc.a * a.w); gl_PointSize = px * ps; return; }
  vec3 v = a.xyz - hd; float d = dot(v, fw); float on = 0.0;
  if (d > 0.02) {
    float k = max(abs(dot(v, rt)) / (d * tf.x), abs(dot(v, up)) / (d * tf.y));
    on = (1.0 - smoothstep(0.85, 1.0, k)) * (1.0 - smoothstep(1.6, 2.1, d));
  }
  gl_PointSize = px * (1.25 + 0.9 * on);
  c = vec4(mix(vec3(0.16, 0.18, 0.2), vec3(0.42, 0.62, 0.0), on), mix(0.25 + 0.55 * a.w, 1.0, on));
}`;
const FS = `
precision mediump float; varying vec4 c;
void main() {
  vec2 d = gl_PointCoord - 0.5; if (dot(d, d) > 0.25) discard;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;
const LS = `
precision mediump float; varying vec4 c;
void main() { gl_FragColor = vec4(c.rgb * c.a, c.a); }`;

export function start(canvas: HTMLCanvasElement, opts: Opts) {
  const ctx = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!ctx) return null;
  const gl: WebGLRenderingContext = ctx;
  const program = (fs: string) => {
    const p = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]] as const) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      gl.attachShader(p, sh);
    }
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };
  const pointProg = program(FS);
  const lineProg = program(LS);
  if (!pointProg || !lineProg) return null;
  const uniforms = (p: WebGLProgram) => {
    const U = (n: string) => gl.getUniformLocation(p, n);
    return { mvp: U("mvp"), hd: U("hd"), fw: U("fw"), rt: U("rt"), up: U("up"), tf: U("tf"), px: U("px"), mode: U("mode"), ps: U("ps"), lc: U("lc"), loc: gl.getAttribLocation(p, "a") };
  };
  const PU = uniforms(pointProg);
  const LU = uniforms(lineProg);

  const upload = (data: Float32Array, usage: number) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    if (data.byteLength) gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    else gl.bufferData(gl.ARRAY_BUFFER, 16, usage);
    return b;
  };
  const body = buildBody();
  const bodyBuf = upload(body, gl.STATIC_DRAW);
  const { data: work, limbs } = buildWork();
  const workBuf = upload(work, gl.STATIC_DRAW);
  const rigs = buildRigs();
  const rigBufs = rigs.map((r) => upload(r, gl.STATIC_DRAW));
  const cone = new Float32Array(16 * 4);
  const coneBuf = upload(cone, gl.DYNAMIC_DRAW);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const HF = Math.tan((64 * Math.PI) / 360);
  const VF = Math.tan((48 * Math.PI) / 360);

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

  const alpha = rigs.map((_, i) => (i === opts.index() ? 1 : 0));
  let camO: V3 = [...CAMS[opts.index()].o];
  let camPitch = CAMS[opts.index()].pitch;
  let camYaw = 0;
  let t = 0;
  let sx = 0;

  const setCommon = (U: ReturnType<typeof uniforms>, mvp: number[], o: V3, f: V3, r: V3, u: V3) => {
    gl.uniformMatrix4fv(U.mvp, false, mvp);
    gl.uniform3fv(U.hd, o);
    gl.uniform3fv(U.fw, f);
    gl.uniform3fv(U.rt, r);
    gl.uniform3fv(U.up, u);
    gl.uniform2f(U.tf, HF, VF);
    gl.uniform1f(U.px, dpr * 1.5);
  };
  const bind = (U: ReturnType<typeof uniforms>, buf: WebGLBuffer | null) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(U.loc);
    gl.vertexAttribPointer(U.loc, 4, gl.FLOAT, false, 0, 0);
  };

  function draw() {
    const idx = opts.index();
    const k = opts.still ? 1 : 0.1;
    for (let i = 0; i < alpha.length; i++) alpha[i] += ((i === idx ? 1 : 0) - alpha[i]) * k;
    const target = CAMS[idx];
    // The human rig's vantage is set per task: its cone looks about the bench.
    const pitchT = idx === 3 && !opts.still ? target.pitch + 0.22 * Math.sin(t * 0.9) : target.pitch;
    const yawT = idx === 3 && !opts.still ? 0.35 * Math.sin(t * 0.55) : 0;
    camO = mix(camO, target.o, k);
    camPitch += (pitchT - camPitch) * k;
    camYaw += (yawT - camYaw) * k;
    const fwd = norm([Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch)]);
    const right = norm(cross(fwd, [0, 1, 0]));
    const up = cross(right, fwd);

    const [px] = opts.pointer();
    sx += (px - sx) * 0.06;
    const aspect = canvas.width / canvas.height;
    const va = 0.85 + 0.2 * Math.sin(t * 0.18) + sx * 0.45;
    const R = aspect < 1 ? 3.6 : 2.7;
    const eye: V3 = [R * Math.sin(va), 2.05, R * Math.cos(va) * 0.9 + 0.45];
    const mvp = mul(perspective((36 * Math.PI) / 180, aspect, 0.05, 20), lookAt(eye, [0, 1.2, 0.55]));

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(pointProg);
    setCommon(PU, mvp, camO, fwd, right, up);
    gl.uniform1f(PU.mode, 0);
    bind(PU, bodyBuf);
    gl.drawArrays(gl.POINTS, 0, body.length / 4);
    bind(PU, workBuf);
    gl.drawArrays(gl.POINTS, 0, work.length / 4);
    gl.uniform1f(PU.mode, 1);
    gl.uniform1f(PU.ps, 1.6);
    for (let i = 0; i < rigs.length; i++) {
      if (alpha[i] < 0.01 || !rigs[i].length) continue;
      gl.uniform4f(PU.lc, 0.36 * alpha[i], 0.55 * alpha[i], 0.0, alpha[i]);
      bind(PU, rigBufs[i]);
      gl.drawArrays(gl.POINTS, 0, rigs[i].length / 4);
    }
    // The camera cone, sized so its far face lands on the bench surface.
    const D = Math.min(1.6, Math.max(0.3, (camO[1] - 0.93) / Math.max(0.05, -fwd[1])));
    const c = add(camO, scale(fwd, D));
    const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) => add(c, add(scale(right, i * HF * D), scale(up, j * VF * D))));
    let o = 0;
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      cone.set([...camO, 0.9, ...a, 0.25, ...a, 0.7, ...b, 0.7], o);
      o += 16;
    }
    gl.useProgram(lineProg);
    setCommon(LU, mvp, camO, fwd, right, up);
    gl.uniform1f(LU.mode, 1);
    gl.uniform4f(LU.lc, 0.36, 0.55, 0.0, 1);
    bind(LU, coneBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, cone);
    gl.drawArrays(gl.LINES, 0, 16);

    // Inset: the same work seen through the rig's own camera. Its box matches .rig-inset
    // in index.css (bottom-right, 12px in, 36% wide, or 42% under 640px; 4:3).
    const iw = Math.round(canvas.width * (window.innerWidth < 640 ? 0.42 : 0.36));
    const ih = Math.round((iw * 3) / 4);
    const pad = Math.round(12 * dpr);
    const ix = canvas.width - iw - pad;
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(ix, pad, iw, ih);
    gl.viewport(ix, pad, iw, ih);
    gl.clearColor(0.11, 0.12, 0.13, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(pointProg);
    const camView = mul(perspective((48 * Math.PI) / 180, iw / ih, 0.03, 10), lookAt(camO, add(camO, fwd)));
    setCommon(PU, camView, camO, fwd, right, up);
    // Bench in chartreuse, the recorder's own arms and hands in white.
    gl.uniform1f(PU.mode, 1);
    gl.uniform1f(PU.ps, 1.3);
    bind(PU, workBuf);
    gl.uniform4f(PU.lc, 0.72, 0.92, 0.25, 1);
    gl.drawArrays(gl.POINTS, limbs, work.length / 4 - limbs);
    gl.uniform4f(PU.lc, 0.96, 0.96, 0.93, 1);
    gl.drawArrays(gl.POINTS, 0, limbs);
    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
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
