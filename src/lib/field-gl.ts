/**
 * Field support (raw WebGL 1, lazy chunk): capture sites ring an IT hub on a tilted ground.
 * Recorders move about inside each site. Now and then a site raises a request; an arc
 * leaves the hub for that site at once, and the site settles with a resolved pulse.
 * Schematic only: the sites, their number and the timings are illustrative, not data.
 * Everything is a pure function of time, so a reduced-motion visitor gets one still frame.
 */

type V3 = [number, number, number];
/** mode: 0 device provisioning, 1 site readiness, 2 client portal, 3 field support. */
type Opts = { pointer: () => number; mode: () => number; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
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

const SITES = 7;
const HUB_TOP: V3 = [0, 0.85, 0];
const EVERY = 2.1; // seconds between requests
const LIFE = 1.9; // seconds a request stays on screen
const S = 0.27; // site half-size

const sites: V3[] = Array.from({ length: SITES }, (_, i) => {
  const a = (i / SITES) * Math.PI * 2 + 0.35 * Math.sin(i * 2.3);
  const r = 2.25 + 0.35 * Math.sin(i * 1.7);
  return [Math.cos(a) * r, 0, Math.sin(a) * r];
});

function staticPoints() {
  const out: number[] = [];
  const put = (p: V3, a: number) => out.push(p[0], p[1], p[2], a);
  for (let x = -3.4; x <= 3.4; x += 0.2)
    for (let z = -3.4; z <= 3.4; z += 0.2) if (x * x + z * z < 11.5) put([x, 0, z], 0.3);
  // Hub: a slender tower with three rings.
  for (let k = 0; k < 260; k++) {
    const a = (k / 260) * Math.PI * 2 * 9;
    const y = (k / 260) * HUB_TOP[1];
    put([Math.cos(a) * 0.09, y, Math.sin(a) * 0.09], 0.8);
  }
  for (const [y, r] of [[0.02, 0.32], [0.45, 0.2], [HUB_TOP[1], 0.14]])
    for (let k = 0; k < 60; k++) {
      const a = (k / 60) * Math.PI * 2;
      put([Math.cos(a) * r, y, Math.sin(a) * r], 0.9);
    }
  for (const c of sites) {
    square(c, 0.9, put);
    square(c, 0.5, put, 0.06);
  }
  return new Float32Array(out);
}
function square(c: V3, a: number, put: (p: V3, a: number) => void, y = 0.005) {
  for (let k = 0; k <= 14; k++) {
    const u = -S + (2 * S * k) / 14;
    put([c[0] + u, y, c[2] - S], a);
    put([c[0] + u, y, c[2] + S], a);
    put([c[0] - S, y, c[2] + u], a);
    put([c[0] + S, y, c[2] + u], a);
  }
}

const VS = `
attribute vec4 a;
uniform mat4 mvp; uniform float px; uniform vec4 lc;
varying vec4 c;
void main() {
  vec4 q = mvp * vec4(a.xyz, 1.0);
  gl_Position = q;
  gl_PointSize = px * clamp(6.0 / q.w, 0.7, 1.9);
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
  const still = staticPoints();
  const stillBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, stillBuf);
  gl.bufferData(gl.ARRAY_BUFFER, still, gl.STATIC_DRAW);
  const MAX = 6000;
  const dyn = new Float32Array(MAX * 4);
  const dynBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
  gl.bufferData(gl.ARRAY_BUFFER, dyn.byteLength, gl.DYNAMIC_DRAW);
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

  let t = opts.still ? 3 * EVERY + 0.55 : 0.8;
  let sx = 0;
  const weight = [0, 0, 0, 0];
  weight[opts.mode()] = 1;
  const cubeOffsets: V3[] = [];
  for (let i = 0; i < 40; i++) {
    const q: V3 = [((i * 37) % 17) / 8.5 - 1, ((i * 53) % 13) / 6.5 - 1, ((i * 71) % 11) / 5.5 - 1];
    q[i % 3] = i % 2 ? 1 : -1;
    cubeOffsets.push(scale(q, 0.06));
  }

  function draw() {
    sx += (opts.pointer() - sx) * 0.05;
    const aspect = canvas.width / canvas.height;
    const narrow = aspect < 1.1;
    const va = 0.6 + (opts.still ? 0 : t * 0.06) + sx * 0.4;
    const R = narrow ? 6.9 : 6.1;
    const eye: V3 = [Math.sin(va) * R, narrow ? 4.8 : 3.5, Math.cos(va) * R];
    const vp = mul(perspective((34 * Math.PI) / 180, aspect, 0.1, 50), lookAt(eye, [0, 0.15, 0]));
    gl.uniformMatrix4fv(uMvp, false, vp);
    gl.uniform1f(uPx, dpr * 2.1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Dynamic points: recorders (ink) first, then requests (hot).
    let n = 0;
    const put = (p: V3, a: number) => {
      if (n >= MAX) return;
      dyn.set([p[0], p[1], p[2], a], n * 4);
      n++;
    };
    sites.forEach((c, i) => {
      for (let k = 0; k < 2; k++) {
        const ph = t * (0.35 + 0.1 * k) + i * 1.3 + k * 2.1;
        const p: V3 = [c[0] + Math.sin(ph) * S * 0.6, 0.05, c[2] + Math.sin(ph * 1.7 + k) * S * 0.6];
        for (let h = 0; h < 6; h++) put([p[0], 0.03 + h * 0.035, p[2]], 1);
      }
    });
    const inkCount = n;
    const mode = opts.mode();
    for (let m = 0; m < 4; m++) weight[m] += ((m === mode ? 1 : 0) - weight[m]) * (opts.still ? 1 : 0.08);
    let wt = 1;
    const hot = (q: V3, a: number) => put(q, a * wt);

    // 0. Device provisioning: devices glide out from the hub along the ground to each site.
    wt = weight[0];
    if (wt > 0.01)
      sites.forEach((site, i) => {
        const ph = (t * 0.35 + i / SITES) % 1;
        const e = ph * ph * (3 - 2 * ph);
        const at: V3 = [site[0] * e, 0.08, site[2] * e];
        for (const o of cubeOffsets) hot([at[0] + o[0], at[1] + o[1], at[2] + o[2]], ph < 0.9 ? 1 : (1 - ph) * 10);
        for (let j = 0; j < 30; j++) {
          const u = (j / 30) * e;
          hot([site[0] * u, 0.01, site[2] * u], 0.35);
        }
        if (ph > 0.85) square(site, (1 - ph) * 6, hot, 0.02);
      });

    // 1. Site readiness: a scanning plane descends over each site in turn.
    wt = weight[1];
    if (wt > 0.01) {
      const k = Math.floor(t / 1.1);
      const ph = (t / 1.1) % 1;
      const cur = k % SITES;
      const site = sites[cur];
      const y = 0.75 * (1 - ph);
      square(site, 1, hot, y);
      for (let j = 0; j < 4; j++) {
        const cx = site[0] + (j % 2 ? S : -S);
        const cz = site[2] + (j < 2 ? S : -S);
        for (let h = 0; h < 12; h++) hot([cx, (h / 12) * y, cz], 0.5);
      }
      if (ph > 0.75) square(site, (ph - 0.75) * 4, hot, 0.02);
      sites.forEach((c, i) => {
        if (i < cur) square(c, 0.45, hot, 0.02);
      });
    }

    // 2. Client portal: batches rise from the hub into an authenticated portal above it.
    wt = weight[2];
    if (wt > 0.01) {
      const PY = 1.95;
      for (let j = 0; j <= 30; j++) {
        const u = -0.55 + (1.1 * j) / 30;
        hot([u, PY, -0.35], 0.8);
        hot([u, PY, 0.35], 0.8);
      }
      for (let j = 0; j <= 18; j++) {
        const v = -0.35 + (0.7 * j) / 18;
        hot([-0.55, PY, v], 0.8);
        hot([0.55, PY, v], 0.8);
      }
      for (let j = 0; j < 3; j++) {
        const ph = (t * 0.45 + j / 3) % 1;
        const y = HUB_TOP[1] + (PY - HUB_TOP[1]) * ph;
        for (let a = 0; a <= 10; a++) {
          const u = -0.16 + (0.32 * a) / 10;
          hot([u, y, -0.1], 1 - ph * 0.5);
          hot([u, y, 0.1], 1 - ph * 0.5);
        }
      }
    }

    // 3. Field support: requests answered at once.
    wt = weight[3];
    for (let k = Math.max(0, Math.floor((t - LIFE) / EVERY)); wt > 0.01 && k <= Math.floor(t / EVERY); k++) {
      const ph = t - k * EVERY;
      if (ph < 0 || ph > LIFE) continue;
      const site = sites[(k * 3) % SITES];
      // 1. The site raises a request: a ring widens and a beam rises.
      if (ph < 0.6) {
        const r = 0.1 + ph * 0.8;
        const a = 1 - ph / 0.6;
        for (let j = 0; j < 40; j++) {
          const ang = (j / 40) * Math.PI * 2;
          hot([site[0] + Math.cos(ang) * r, 0.01, site[2] + Math.sin(ang) * r], a);
        }
        for (let j = 0; j < 20; j++) hot([site[0], j * 0.04, site[2]], a * 0.9);
      }
      // 2. The hub answers at once: an arc drawn out to the site, with a packet at its head.
      const p = clamp((ph - 0.25) / 0.45);
      const fade = ph < 0.9 ? 1 : clamp(1 - (ph - 0.9) / 0.7);
      if (p > 0) {
        const steps = 120;
        for (let j = 0; j <= steps * p; j++) {
          const u = j / steps;
          const x = HUB_TOP[0] + (site[0] - HUB_TOP[0]) * u;
          const z = HUB_TOP[2] + (site[2] - HUB_TOP[2]) * u;
          const y = HUB_TOP[1] * (1 - u) + 0.08 * u + Math.sin(Math.PI * u) * 0.9;
          for (const o of [-0.012, 0, 0.012]) hot([x, y + o, z], fade * (0.5 + 0.5 * u));
        }
        if (p < 1) {
          const u = p;
          const head: V3 = [site[0] * u, HUB_TOP[1] * (1 - u) + 0.08 * u + Math.sin(Math.PI * u) * 0.9, site[2] * u];
          for (let j = 0; j < 30; j++) {
            const ang = (j / 30) * Math.PI * 2;
            hot([head[0] + Math.cos(ang) * 0.05, head[1] + Math.sin(ang) * 0.05, head[2]], 1);
          }
        }
        // Hub ring pulses as the answer leaves.
        const hr = 0.14 + p * 0.5;
        for (let j = 0; j < 48; j++) {
          const ang = (j / 48) * Math.PI * 2;
          hot([Math.cos(ang) * hr, HUB_TOP[1], Math.sin(ang) * hr], (1 - p) * 0.9);
        }
      }
      // 3. Resolved: the site outline lights and settles.
      if (ph > 0.7) square(site, clamp(1 - (ph - 0.7) / 1.2), hot, 0.02);
    }
    const draws: [number, number, V3, number][] = [
      [0, inkCount, INK, 0.9],
      [inkCount, n - inkCount, HOT, 1],
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, stillBuf);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.uniform4f(uLc, INK[0], INK[1], INK[2], 1);
    gl.drawArrays(gl.POINTS, 0, still.length / 4);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn.subarray(0, n * 4));
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    for (const [first, count, col, a] of draws) {
      if (!count) continue;
      gl.uniform4f(uLc, col[0] * a, col[1] * a, col[2] * a, a);
      gl.drawArrays(gl.POINTS, first, count);
    }
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
