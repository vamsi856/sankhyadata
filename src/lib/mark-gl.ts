/**
 * Closing mark (raw WebGL 1, lazy chunk). The SankhyaData mark (four viewfinder brackets
 * round a chartreuse dot, from public/brand/sankhyadata-mark.svg) is rebuilt from points
 * with depth. When the section comes into view the points converge from a scattered cloud,
 * swirling in; then the mark breathes gently and turns toward the pointer. The animation is
 * done on the GPU: each point carries its target, its start and a delay.
 */

type V3 = [number, number, number];
type Opts = { pointer: () => [number, number]; still: boolean };

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
  // Brackets: polylines from the SVG path, stroke width 1.6, given depth.
  const legs: [number, number, number, number][] = [
    [3, 8, 3, 3], [3, 3, 8, 3],
    [16, 3, 21, 3], [21, 3, 21, 8],
    [21, 16, 21, 21], [21, 21, 16, 21],
    [8, 21, 3, 21], [3, 21, 3, 16],
  ];
  for (const [x0, y0, x1, y1] of legs) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.round(len * 95);
    const nx = -(y1 - y0) / len;
    const ny = (x1 - x0) / len;
    for (let i = 0; i < n; i++) {
      const u = rnd() * 1.1 - 0.05;
      const w = (rnd() - 0.5) * 1.6;
      add(x0 + (x1 - x0) * u + nx * w, y0 + (y1 - y0) * u + ny * w, (rnd() - 0.5) * 0.16, 0);
    }
  }
  // The dot: a lens of chartreuse points, ringed in ink as in the SVG.
  for (let i = 0; i < 1400; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 2.7;
    const bulge = Math.sqrt(Math.max(0, 1 - (r / 3.2) ** 2)) * 0.18;
    add(12 + Math.cos(a) * r, 12 + Math.sin(a) * r, (rnd() * 2 - 1) * bulge, 1);
  }
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2;
    const r = 3.0 + rnd() * 0.45;
    add(12 + Math.cos(a) * r, 12 + Math.sin(a) * r, (rnd() - 0.5) * 0.1, 0);
  }
  return { target: new Float32Array(target), start: new Float32Array(start) };
}

const VS = `
attribute vec4 a; attribute vec4 b;
uniform mat4 mvp; uniform float px, time, built;
varying vec4 c;
void main() {
  float k = clamp((built - b.w * 0.6) / 1.1, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 3.0);
  // Swirl in: the start point turns about the vertical as it travels.
  float ang = (1.0 - e) * 2.4;
  vec3 s = vec3(cos(ang) * b.x + sin(ang) * b.z, b.y, -sin(ang) * b.x + cos(ang) * b.z);
  vec3 p = mix(s, a.xyz, e);
  p.z += 0.025 * sin(time * 1.3 + b.w * 40.0) * e;
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
  const u = { mvp: U("mvp"), px: U("px"), time: U("time"), built: U("built") };
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

  function draw() {
    const [px, py] = opts.pointer();
    const idle = opts.still ? 0 : Math.sin(time * 0.35) * 0.18;
    yaw += (px * 0.55 + idle - yaw) * 0.06;
    pitch += (py * 0.35 - pitch) * 0.06;
    const aspect = canvas.width / canvas.height;
    const vp = mul(perspective((32 * Math.PI) / 180, aspect, 0.1, 30), lookAt([0, 0, aspect < 1 ? 5.6 : 5.0], [0, 0, 0]));
    gl.uniformMatrix4fv(u.mvp, false, mul(vp, rot(yaw, pitch)));
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
    ([e]) => {
      visible = e.isIntersecting;
      run();
    },
    { threshold: 0.3 },
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
