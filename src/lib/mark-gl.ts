/**
 * Closing mark (raw WebGL 1, lazy chunk). The SankhyaData mark (four ribbons woven into an S,
 * src/lib/mark.ts) is rebuilt from points with depth, green where the mark is green. When the section comes into view the points converge from a scattered cloud,
 * swirling in; then the mark breathes gently and turns toward the pointer. The animation is
 * done on the GPU: each point carries its target, its start and a delay.
 */

import { markPaths } from "./mark";

type V3 = [number, number, number];
/** local: the pointer over the canvas (-1..1), whether it is inside, and a press count. */
type Local = { x: number; y: number; inside: boolean; press: number };
type Opts = { pointer: () => [number, number]; local: Local; still: boolean };

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
function rot(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  // Ry * Rx, column-major.
  return [cy, 0, -sy, 0, sy * sp, cp, cy * sp, 0, sy * cp, -sp, cy * cp, 0, 0, 0, 0, 1];
}

/** Points for the mark, in the SVG's 24-unit grid mapped to ±1.2 around the origin. */
function build() {
  let seed = 23;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const S = 0.1; // scene units per SVG unit
  const target: number[] = [];
  const start: number[] = [];
  const add = (x: number, y: number, z: number, hot: number) => {
    target.push((x - 12) * S, (12 - y) * S, z, hot);
    // Start somewhere in a wide shell, so the mark condenses out of a cloud.
    const d: V3 = norm([rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1]);
    const r = 2.2 + rnd() * 2.2;
    start.push(d[0] * r, d[1] * r, d[2] * r, rnd());
  };
  // Fill each ribbon piece with points: sample the 24-unit square and keep the points that
  // fall inside a piece (Path2D hit-testing on a throwaway 2D context). The ribbons sit at
  // slightly different depths, so the weave keeps a little relief as the mark turns.
  const hit = document.createElement("canvas").getContext("2d")!;
  const pieces = markPaths.map((p, i) => ({ path: new Path2D(p.d), hot: p.tone === "green" ? 1 : 0, z: ((i % 4) - 1.5) * 0.035 }));
  let kept = 0;
  for (let tries = 0; kept < 5200 && tries < 60000; tries++) {
    const x = 0.5 + rnd() * 23;
    const y = 0.5 + rnd() * 23;
    const piece = pieces.find((q) => hit.isPointInPath(q.path, x, y));
    if (!piece) continue;
    add(x, y, piece.z + (rnd() - 0.5) * 0.06, piece.hot);
    kept++;
  }
  return { target: new Float32Array(target), start: new Float32Array(start) };
}

const VS = `
attribute vec4 a; attribute vec4 b;
uniform mat4 mvp; uniform float px, time, built, force, shock, shockR; uniform vec3 cur, shockC;
varying vec4 c;
void main() {
  float k = clamp((built - b.w * 0.6) / 1.1, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 3.0);
  // Swirl in: the start point turns about the vertical as it travels.
  float ang = (1.0 - e) * 2.4;
  vec3 s = vec3(cos(ang) * b.x + sin(ang) * b.z, b.y, -sin(ang) * b.x + cos(ang) * b.z);
  vec3 p = mix(s, a.xyz, e);
  p.z += 0.025 * sin(time * 1.3 + b.w * 40.0) * e;
  // The pointer parts the points like a field; they settle back when it leaves.
  vec3 d = p - cur;
  float f = force * exp(-(dot(d.xy, d.xy) + d.z * d.z * 0.3) / 0.11) * e;
  p += normalize(d + vec3(0.0, 0.0, 0.002)) * f * 0.42;
  // A press sends a ring outward: points it crosses jump in depth, then fall back.
  vec2 o = p.xy - shockC.xy;
  float ring = exp(-pow(length(o) - shockR, 2.0) / 0.025) * shock * e;
  p.z += ring * 0.7 * (fract(b.w * 7.0) - 0.35);
  p.xy += normalize(o + vec2(0.0001)) * ring * 0.12;
  vec4 q = mvp * vec4(p, 1.0);
  gl_Position = q;
  gl_PointSize = px * mix(1.6, 1.0, e);
  vec3 ink = vec3(0.07, 0.08, 0.09);
  vec3 hot = vec3(0.66, 0.88, 0.16);
  c = vec4(mix(ink, hot, a.w), mix(0.25, a.w > 0.5 ? 1.0 : 0.85, e));
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
  const u = { mvp: U("mvp"), px: U("px"), time: U("time"), built: U("built"), force: U("force"), shock: U("shock"), shockR: U("shockR"), cur: U("cur"), shockC: U("shockC") };
  const { target, start: from } = build();
  const attr = (name: string, data: Float32Array) => {
    const loc = gl.getAttribLocation(prog, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
  };
  attr("a", target);
  attr("b", from);
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

  let built = opts.still ? 10 : 0;
  let time = 0;
  let yaw = 0;
  let pitch = 0;
  let force = 0;
  let shock = 0;
  let shockR = 0;
  let shockC: V3 = [0, 0, 0];
  let presses = opts.local.press;

  function draw() {
    const [px, py] = opts.pointer();
    const idle = opts.still ? 0 : Math.sin(time * 0.35) * 0.18;
    yaw += (px * 0.55 + idle - yaw) * 0.06;
    pitch += (py * 0.35 - pitch) * 0.06;
    const aspect = canvas.width / canvas.height;
    const dist = aspect < 1 ? 5.6 : 5.0;
    const R = rot(yaw, pitch);
    const vp = mul(perspective((32 * Math.PI) / 180, aspect, 0.1, 30), lookAt([0, 0, dist], [0, 0, 0]));
    gl.uniformMatrix4fv(u.mvp, false, mul(vp, R));
    // The pointer, cast onto the mark's plane and taken into the mark's own (rotating) space.
    const L = opts.local;
    const th = Math.tan((16 * Math.PI) / 180) * dist;
    const W: V3 = [L.x * th * aspect, -L.y * th, 0];
    const cur: V3 = [0, 1, 2].map((i) => R[i * 4] * W[0] + R[i * 4 + 1] * W[1] + R[i * 4 + 2] * W[2]) as V3;
    force += ((L.inside && !opts.still ? 1 : 0) - force) * 0.12;
    if (L.press !== presses) {
      presses = L.press;
      if (!opts.still) {
        shock = 1;
        shockR = 0;
        shockC = cur;
      }
    }
    shockR += 0.035;
    shock *= 0.965;
    gl.uniform3fv(u.cur, cur);
    gl.uniform1f(u.force, force);
    gl.uniform3fv(u.shockC, shockC);
    gl.uniform1f(u.shock, shock);
    gl.uniform1f(u.shockR, shockR);
    gl.uniform1f(u.px, dpr * 1.8);
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.built, built);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, target.length / 4);
  }

  let raf = 0;
  let last = performance.now();
  let visible = false;
  const loop = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    built += dt;
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const run = () => {
    if (opts.still || raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(
    (es) => {
      // Converge at 60% when scrolled into from above; also when the visitor lands below it
      // (End key, fast scroll, reload at the foot), where 60% may never be on screen.
      const e = es[es.length - 1];
      visible = e.intersectionRatio >= 0.6 || (e.isIntersecting && e.boundingClientRect.top < 0);
      run();
    },
    { threshold: [0, 0.6] },
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", run);
  draw();
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", run);
  };
}
