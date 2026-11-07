/**
 * A capture site as a point cloud (raw WebGL 1, no engine), loaded as its own chunk only
 * when the section approaches the viewport. A recorder walks around a workbench; their head
 * trajectory trails behind them and every point inside their camera's field of view lights
 * up. `progress` (0 to 1, from scrolling) flies the viewer's camera from an overview into
 * the recorder's own head: third person becomes first person.
 *
 * Schematic only: the scene is generated procedurally, it is not captured data.
 */

type V3 = [number, number, number];
type Opts = { progress: () => number; pointer: () => [number, number]; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const mix = (a: V3, b: V3, t: number): V3 => add(a, scale(sub(b, a), t));
const smooth = (t: number) => t * t * (3 - 2 * t);

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

/** The workshop: floor, walls, a bench with a potter's wheel and pot, tools, a shelf. */
function buildScene() {
  let seed = 7;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = (a: number, b: number) => a + (b - a) * rnd();
  const out: number[] = [];
  const put = (x: number, y: number, z: number, b: number) => out.push(x, y, z, b);
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, n: number, b: number) => {
    for (let i = 0; i < n; i++) {
      const p: V3 = [r(-1, 1), r(-1, 1), r(-1, 1)];
      const axis = Math.floor(rnd() * 3);
      p[axis] = rnd() < 0.5 ? -1 : 1;
      put(cx + p[0] * sx, cy + p[1] * sy, cz + p[2] * sz, b);
    }
  };
  const lathe = (cx: number, y0: number, cz: number, h: number, radius: (t: number) => number, n: number, b: number) => {
    for (let i = 0; i < n; i++) {
      const t = rnd();
      const a = r(0, Math.PI * 2);
      const rr = radius(t);
      put(cx + Math.cos(a) * rr, y0 + t * h, cz + Math.sin(a) * rr, b);
    }
  };

  for (let x = -4; x <= 4; x += 0.17) for (let z = -3; z <= 3; z += 0.17) put(x + r(-0.03, 0.03), 0, z + r(-0.03, 0.03), 0.12);
  for (let i = 0; i < 1300; i++) put(r(-4, 4), r(0, 2.8), -3, 0.12);
  for (let i = 0; i < 800; i++) put(-4, r(0, 2.8), r(-3, 3), 0.1);
  box(0, 0.86, 0, 1.3, 0.04, 0.62, 3200, 0.55); // bench top
  for (const [lx, lz] of [[-1.2, -0.52], [1.2, -0.52], [-1.2, 0.52], [1.2, 0.52]]) box(lx, 0.42, lz, 0.04, 0.42, 0.04, 140, 0.4);
  box(0.5, 0.94, 0.25, 0.2, 0.04, 0.12, 300, 0.7); // tray
  lathe(0.85, 0.9, -0.3, 0.32, () => 0.1, 450, 0.75); // water jar
  box(0.3, 0.92, -0.35, 0.12, 0.02, 0.03, 120, 0.7); // tool
  box(-0.5, 1.6, -2.86, 1.6, 0.02, 0.14, 700, 0.35); // shelf
  for (const sx of [-1.6, -0.9, -0.2, 0.6]) lathe(sx, 1.62, -2.86, r(0.18, 0.32), () => r(0.07, 0.1), 220, 0.4);
  box(2.6, 0.5, -2.2, 0.5, 0.5, 0.5, 900, 0.3); // crates
  box(2.6, 1.3, -2.2, 0.35, 0.3, 0.35, 500, 0.3);
  return new Float32Array(out);
}

const WHEEL_X = -0.35;
const potRadius = (t: number) => 0.05 + 0.1 * Math.pow(Math.sin(Math.PI * Math.min(1, t / 0.8)), 1.4) + (t > 0.85 ? (t - 0.85) * 0.35 : 0);

function sampler(seed0: number) {
  let seed = seed0;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  return { rnd, out, put: (x: number, y: number, z: number, b: number) => out.push(x, y, z, b) };
}

/** Wheel head, pot and the spiral grooves thrown into it, around the wheel's axis (x = z = 0). */
function buildPot() {
  const { rnd, out, put } = sampler(17);
  for (let i = 0; i < 900; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = rnd() * 0.34;
    put(Math.cos(a) * rr, 0.9 + rnd() * 0.04, Math.sin(a) * rr, 0.7);
  }
  for (let i = 0; i < 1400; i++) {
    const t = rnd();
    const a = rnd() * Math.PI * 2;
    put(Math.cos(a) * potRadius(t), 0.94 + t * 0.36, Math.sin(a) * potRadius(t), 0.9);
  }
  for (let i = 0; i < 700; i++) {
    const t = i / 700;
    const a = t * Math.PI * 2 * 16;
    const rr = potRadius(t) + 0.004;
    put(Math.cos(a) * rr, 0.94 + t * 0.36, Math.sin(a) * rr, 1);
  }
  return new Float32Array(out);
}

/** Two hands cupping the pot from the recorder's side (+z), fingers wrapping round it. */
function buildHands() {
  const { rnd, out, put } = sampler(29);
  for (const side of [-1, 1]) {
    const px = side * 0.175;
    // Palm, flattened against the pot's flank.
    for (let i = 0; i < 260; i++) {
      const u = rnd() * 2 - 1;
      const v = rnd() * 2 - 1;
      const w = rnd() * 2 - 1;
      if (u * u + v * v + w * w > 1) continue;
      put(px + u * 0.016, 1.07 + v * 0.045, 0.05 + w * 0.05, 0.85);
    }
    // Four fingers reaching round the far side, and a thumb over the top.
    for (let f = 0; f < 4; f++) {
      const fy = 1.03 + f * 0.024;
      for (let i = 0; i < 60; i++) {
        const t = rnd();
        const a = 0.35 + t * 1.05; // angle swept round the pot, from the recorder's side
        const rr = 0.165 - t * 0.02 + (rnd() - 0.5) * 0.012;
        put(side * Math.sin(a) * rr, fy + (rnd() - 0.5) * 0.012, Math.cos(a) * rr, 0.85);
      }
    }
    for (let i = 0; i < 60; i++) {
      const t = rnd();
      put(px - side * t * 0.06, 1.13 + t * 0.03 + (rnd() - 0.5) * 0.01, 0.07 - t * 0.02, 0.85);
    }
  }
  return new Float32Array(out);
}

/**
 * The recorder's head at time t, and where it looks: walking round the bench, eyes on the
 * work; `seat` (0 to 1) brings them to the wheel, seated, looking down into the pot.
 */
function recorder(t: number, seat = 0) {
  const a = 0.17 * t + 0.6;
  const rad = 1.75 + 0.2 * Math.sin(0.45 * t);
  const walkHead: V3 = [rad * Math.sin(a), 1.58 + 0.025 * Math.sin(2.2 * t), rad * Math.cos(a) * 0.85];
  const walkLook: V3 = [-0.25 + 0.3 * Math.sin(0.37 * t), 0.98, 0.2 * Math.sin(0.29 * t)];
  const k = seat * seat * (3 - 2 * seat);
  const head = mix(walkHead, [WHEEL_X, 1.56 + 0.008 * Math.sin(1.1 * t), 0.74], k);
  const look = mix(walkLook, [WHEEL_X, 1.02, -0.02], k);
  const fwd = norm(sub(look, head));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  return { head, fwd, right, up };
}

const VS = `
attribute vec4 a;
uniform mat4 mvp, mdl; uniform vec3 hd, fw, rt, up; uniform vec2 tf; uniform float px, mode, ga; uniform vec4 lc;
varying vec4 c; varying float m;
void main() {
  m = mode;
  vec3 wp = (mdl * vec4(a.xyz, 1.0)).xyz;
  vec4 q = mvp * vec4(wp, 1.0);
  gl_Position = q;
  if (mode > 2.5) { c = vec4(lc.rgb, lc.a * a.w * ga); gl_PointSize = px * 1.6 * clamp(4.0 / q.w, 0.55, 1.7); return; }
  if (mode > 0.5) { c = vec4(lc.rgb, lc.a * a.w); gl_PointSize = px * 7.0; return; }
  vec3 v = wp - hd; float d = dot(v, fw); float on = 0.0;
  if (d > 0.05) {
    float k = max(abs(dot(v, rt)) / (d * tf.x), abs(dot(v, up)) / (d * tf.y));
    on = (1.0 - smoothstep(0.86, 1.0, k)) * (1.0 - smoothstep(2.4, 3.1, d));
  }
  gl_PointSize = px * (1.3 + 1.0 * on) * clamp(4.0 / q.w, 0.55, 1.7);
  c = vec4(mix(vec3(0.86, 0.88, 0.86), vec3(0.84, 1.0, 0.3), on), mix(0.2 + 0.55 * a.w, 1.0, on) * ga);
}`;
const FS = `
precision mediump float; varying vec4 c; varying float m;
void main() {
  if (m < 0.5 || m > 1.5) { vec2 d = gl_PointCoord - 0.5; if (dot(d, d) > 0.25) discard; }
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

export function start(canvas: HTMLCanvasElement, opts: Opts): (() => void) | null {
  const ctx = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!ctx) return null;
  const gl: WebGLRenderingContext = ctx;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { mvp: U("mvp"), mdl: U("mdl"), ga: U("ga"), hd: U("hd"), fw: U("fw"), rt: U("rt"), up: U("up"), tf: U("tf"), px: U("px"), mode: U("mode"), lc: U("lc") };
  const loc = gl.getAttribLocation(prog, "a");

  const scene = buildScene();
  const sceneBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sceneBuf);
  gl.bufferData(gl.ARRAY_BUFFER, scene, gl.STATIC_DRAW);
  const upload = (d: Float32Array) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
    return { b, n: d.length / 4 };
  };
  const pot = upload(buildPot());
  const hands = upload(buildHands());
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const TRAIL = 180;
  const dyn = new Float32Array((TRAIL + 16 + 1) * 4);
  const dynBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
  gl.bufferData(gl.ARRAY_BUFFER, dyn.byteLength, gl.DYNAMIC_DRAW);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const HF = Math.tan((70 * Math.PI) / 360);
  const VF = Math.tan((52 * Math.PI) / 360);

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  const ro = new ResizeObserver(() => {
    resize();
    if (opts.still) draw();
  });
  ro.observe(canvas);
  resize();

  let t = 9;
  let last = performance.now();
  let sx = 0;
  let sy = 0;

  function draw() {
    const p = smooth(Math.min(1, Math.max(0, opts.progress())));
    const [px, py] = opts.pointer();
    sx += (px - sx) * 0.06;
    sy += (py - sy) * 0.06;
    // Over the last stretch of the scroll the recorder sits down at the wheel.
    const seat = Math.min(1, Math.max(0, (p - 0.3) / 0.6));
    const rec = recorder(t, seat);
    // Viewer: an orbit over the site, easing into the recorder's eye as the visitor scrolls.
    const aspect = canvas.width / canvas.height;
    const portrait = aspect < 1;
    const va = 0.9 + 0.035 * t + sx * 0.6;
    const dist = portrait ? 8.2 : 6.4;
    const orbitEye: V3 = [dist * Math.sin(va), 3.3 + sy * 1.2, dist * Math.cos(va)];
    const eye = mix(orbitEye, add(rec.head, scale(rec.fwd, portrait ? -0.55 : -0.12)), p);
    // On a portrait screen the text sits on top, so aim higher and the site sinks below it.
    const aim = add(add(rec.head, rec.fwd), portrait ? scale(rec.up, 0.32) : scale(rec.right, -0.42));
    const target = mix([0, portrait ? 2.6 : 0.75, 0], aim, p);
    const fov = ((42 + 20 * p) * Math.PI) / 180;
    const mvp = mul(perspective(fov, aspect, 0.03, 40), lookAt(eye, target));

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(u.mvp, false, mvp);
    gl.uniform3fv(u.hd, rec.head);
    gl.uniform3fv(u.fw, rec.fwd);
    gl.uniform3fv(u.rt, rec.right);
    gl.uniform3fv(u.up, rec.up);
    gl.uniform2f(u.tf, HF, VF);
    gl.uniform1f(u.px, dpr * (aspect < 1 ? 1.15 : 1.4));

    gl.uniform1f(u.mode, 0);
    gl.uniform1f(u.ga, 1);
    gl.uniformMatrix4fv(u.mdl, false, I);
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneBuf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, scene.length / 4);
    // The pot turns on the wheel; the hands arrive as the recorder sits down.
    const spin = t * 2.2;
    const cs = Math.cos(spin);
    const sn = Math.sin(spin);
    gl.uniformMatrix4fv(u.mdl, false, [cs, 0, -sn, 0, 0, 1, 0, 0, sn, 0, cs, 0, WHEEL_X, 0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, pot.b);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, pot.n);
    const handsIn = Math.min(1, Math.max(0, (seat - 0.55) / 0.4));
    if (handsIn > 0.01) {
      gl.uniform1f(u.ga, handsIn);
      gl.uniform1f(u.mode, 3);
      gl.uniform4f(u.lc, 0.97, 0.96, 0.92, 1);
      gl.uniformMatrix4fv(u.mdl, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, WHEEL_X, 0.025 * Math.sin(t * 0.9), 0, 1]);
      gl.bindBuffer(gl.ARRAY_BUFFER, hands.b);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, hands.n);
      gl.uniform1f(u.ga, 1);
      gl.uniform1f(u.mode, 0);
    }
    gl.uniformMatrix4fv(u.mdl, false, I);

    // Trail, frustum and head marker fade out as the viewer becomes the recorder.
    const fade = 1 - p;
    if (fade > 0.01) {
      let o = 0;
      for (let k = 0; k < TRAIL; k++) {
        const h = recorder(t - k * 0.06, seat).head;
        dyn.set([h[0], h[1], h[2], (1 - k / TRAIL) * 0.9], o);
        o += 4;
      }
      const D = 0.75;
      const c = add(rec.head, scale(rec.fwd, D));
      const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) =>
        add(c, add(scale(rec.right, i * HF * D), scale(rec.up, j * VF * D))),
      );
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        dyn.set([...rec.head, 0.85, ...a, 0.85, ...a, 0.85, ...b, 0.85], o);
        o += 16;
      }
      dyn.set([...rec.head, 1], o);
      gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(u.mode, 1);
      gl.uniform4f(u.lc, 0.84 * fade, 1 * fade, 0.3 * fade, fade);
      gl.drawArrays(gl.LINE_STRIP, 0, TRAIL);
      gl.drawArrays(gl.LINES, TRAIL, 16);
      gl.uniform1f(u.mode, 2);
      gl.drawArrays(gl.POINTS, TRAIL + 16, 1);
    }
  }

  let raf = 0;
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
  const onVis = () => run();
  document.addEventListener("visibilitychange", onVis);
  const onScroll = () => opts.still && draw();
  window.addEventListener("scroll", onScroll, { passive: true });
  draw();
  run();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("scroll", onScroll);
  };
}
