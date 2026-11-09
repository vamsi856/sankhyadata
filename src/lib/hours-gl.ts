/**
 * Hours volume (raw WebGL 1, lazy chunk), built only from the owner's two figures. Each
 * point stands for ten hours: 5,000 ink points (50,000 hours, the stated lower bound) rain
 * down and stack into a block; then 200 chartreuse points (2,000 approved hours, one
 * week's capacity) settle as a slab above it. HTML labels are pinned to both. Everything
 * is computed on the GPU from one clock, so reduced motion simply shows the end state.
 */

type V3 = [number, number, number];
/** hover.on: the visitor is pointing at the volume, which opens it into its units. */
type Opts = { labels: HTMLElement[]; pointer: () => number; hover: { on: boolean }; still: boolean };

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

// Block: 25 × 20 × 10 = 5,000 points. Slab: 20 × 10 × 1 = 200 points.
const SP = 0.1;
const BX = 25;
const BZ = 20;
const BY = 10;
const SLAB_Y = BY * SP + 0.55;
const BLOCK_TIME = 4.2;
const SLAB_AT = 4.8;

function build() {
  const out: number[] = [];
  const ox = ((BX - 1) * SP) / 2;
  const oz = ((BZ - 1) * SP) / 2;
  // Fill the block layer by layer, from the ground up, like hours accumulating.
  for (let y = 0; y < BY; y++)
    for (let z = 0; z < BZ; z++)
      for (let x = 0; x < BX; x++) {
        const order = (y * BX * BZ + z * BX + x) / (BX * BY * BZ);
        out.push(x * SP - ox, y * SP, z * SP - oz, Math.min(0.999, order + ((x * 7 + z * 13) % 10) * 0.004));
      }
  // (The weekly-capacity slab was removed at the owner's request; that figure is in the text.)
  return new Float32Array(out);
}

const VS = `
attribute vec4 a;
uniform mat4 mvp; uniform float px, built, time, spread, ink; uniform vec3 hi;
varying vec4 c;
void main() {
  float slab = step(1.5, a.w);
  float d = a.w - 2.0 * slab;
  float k = slab > 0.5
    ? clamp((built - ${SLAB_AT.toFixed(1)} - d * 0.6) / 0.7, 0.0, 1.0)
    : clamp((built - d * ${BLOCK_TIME.toFixed(1)}) / 0.45, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 3.0);
  vec3 p = a.xyz;
  // Exploded view: the block opens out about its centre into its ten-hour units.
  float one = (1.0 - slab) * (1.0 - step(0.001, distance(a.xyz, hi)));
  vec3 mid = vec3(0.0, ${((BY - 1) * SP / 2).toFixed(4)}, 0.0);
  if (slab < 0.5) p = mid + (p - mid) * (1.0 + spread * 0.55);
  p.y += (1.0 - e) * (slab > 0.5 ? 1.2 : 2.2) + slab * (0.05 * sin(time * 1.4) + spread * 0.3);
  vec4 q = mvp * vec4(p, 1.0);
  gl_Position = q;
  gl_PointSize = px * (1.0 + 0.5 * slab + one * spread * 5.0) * clamp(6.0 / q.w, 0.6, 1.6);
  vec3 col = mix(vec3(0.17, 0.19, 0.21), vec3(0.38, 0.58, 0.0), max(slab, one * spread));
  c = vec4(col, e * mix(ink, 1.0, max(slab, one * spread)));
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
  const u = { mvp: U("mvp"), px: U("px"), built: U("built"), time: U("time"), spread: U("spread"), hi: U("hi") , ink: U("ink") };
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

  let built = opts.still ? 10 : 0;
  let time = 0;
  let sx = 0;
  let spread = 0;
  // The unit singled out in the exploded view: the block's top, front, right-hand corner.
  const HI: V3 = [((BX - 1) * SP) / 2, (BY - 1) * SP, ((BZ - 1) * SP) / 2];
  const MID_Y = ((BY - 1) * SP) / 2;
  // Block label under the block's near edge; slab label above the slab's centre; the unit
  // label beside the singled-out point.
  const anchors: V3[] = [
    [0, 0, ((BZ - 1) * SP) / 2],
    [0, SLAB_Y + 0.08, 0],
    [0, 0, 0],
  ];

  function draw() {
    sx += (opts.pointer() - sx) * 0.05;
    const aspect = canvas.width / canvas.height;
    const va = 0.62 + sx * 0.4 + (opts.still ? 0 : 0.08 * Math.sin(time * 0.25));
    const R = (aspect < 1.1 ? 6.4 : 5.6) + spread * 1.6;
    const eye: V3 = [Math.sin(va) * R, 3.0, Math.cos(va) * R];
    const vp = mul(perspective((30 * Math.PI) / 180, aspect, 0.1, 40), lookAt(eye, [0, 0.75, 0]));
    gl.uniformMatrix4fv(u.mvp, false, vp);
    // Phones and tablets: larger, darker points so the volume reads as a solid block.
    const small = window.innerWidth < 1024;
    gl.uniform1f(u.px, dpr * (small ? 2.3 : 1.7));
    gl.uniform1f(u.ink, small ? 0.8 : 0.55);
    gl.uniform1f(u.built, built);
    gl.uniform1f(u.time, opts.still ? 0 : time);
    spread += ((opts.hover.on && built > BLOCK_TIME ? 1 : 0) - spread) * (opts.still ? 1 : 0.08);
    gl.uniform1f(u.spread, spread);
    gl.uniform3fv(u.hi, HI);
    const f = 1 + spread * 0.55;
    anchors[0] = [0, MID_Y - MID_Y * f, (((BZ - 1) * SP) / 2) * f];
    anchors[1] = [0, SLAB_Y + 0.08 + spread * 0.3, 0];
    anchors[2] = [HI[0] * f, MID_Y + (HI[1] - MID_Y) * f, HI[2] * f];
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, data.length / 4);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    opts.labels.forEach((el, i) => {
      const p = anchors[i];
      const x = vp[0] * p[0] + vp[4] * p[1] + vp[8] * p[2] + vp[12];
      const y = vp[1] * p[0] + vp[5] * p[1] + vp[9] * p[2] + vp[13];
      const q = vp[3] * p[0] + vp[7] * p[1] + vp[11] * p[2] + vp[15];
      const shown = i === 0 ? Math.min(1, built / BLOCK_TIME) : i === 1 ? Math.min(1, Math.max(0, built - SLAB_AT - 0.4)) : spread;
      // Centre on the anchor, kept inside the frame.
      const lw = el.offsetWidth;
      const sxp = ((x / q + 1) / 2) * w;
      const left = Math.min(w - lw, Math.max(0, i === 2 ? sxp + 20 : sxp - lw / 2));
      const top = ((1 - y / q) / 2) * h + (i === 0 ? 10 : i === 2 ? -el.offsetHeight / 2 : -el.offsetHeight - 8);
      el.style.transform = `translate(${left}px, ${top}px)`;
      el.style.opacity = String(shown);
    });
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
    { threshold: 0.75 },
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", run);
  draw();
  // Reduced motion has no loop, so redraw now and then for the exploded view.
  const wake = setInterval(() => opts.still && draw(), 300);
  return () => {
    clearInterval(wake);
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", run);
  };
}
