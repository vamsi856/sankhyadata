/**
 * The approval line (raw WebGL 1, lazy chunk). Recorded hours ride a conveyor as blocks of
 * points. At the Review gate the AI score sends some up into a QC adjudication loop: some
 * return approved, others fade out uncounted. One approval in ten also takes the audit
 * loop and returns. Approved blocks turn chartreuse, pass the Approved gate and stack into
 * a batch, which ships once full. Schematic: frequencies are illustrative, not data.
 *
 * Labels (HTML) are pinned to 3D anchors: the engine projects each anchor every frame.
 */

type V3 = [number, number, number];
type Opts = { labels: HTMLElement[]; pointer: () => number; still: boolean };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);

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
const at = (p: V3, s = 1) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, p[0], p[1], p[2], 1];

// Layout along the line (x), and the QC loop arching above it.
const START = -3.3;
const REVIEW = -1.0;
const RETURN = 0.55;
const APPROVE = 1.25;
const STACK = 2.75;
const SPEED = 0.62;
const B = 0.11; // block half-size
const BATCH = 5;

function rng(seed0: number) {
  let seed = seed0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function meshes() {
  const r = rng(3);
  const block: number[] = [];
  for (let i = 0; i < 260; i++) {
    const p = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
    p[Math.floor(r() * 3)] = r() < 0.5 ? -1 : 1;
    block.push(p[0] * B, p[1] * B, p[2] * B, 0.6 + 0.4 * r());
  }
  const world: number[] = [];
  const put = (x: number, y: number, z: number, b: number) => world.push(x, y, z, b);
  for (let x = START - 0.3; x <= STACK + 0.5; x += 0.025) {
    put(x, 0, -0.26, 0.6);
    put(x, 0, 0.26, 0.6);
    if (Math.round(x * 40) % 8 === 0) for (let z = -0.26; z <= 0.26; z += 0.04) put(x, 0, z, 0.3);
  }
  // The QC loop's path, dotted.
  for (let u = 0; u <= 1; u += 0.006) {
    const [x, y] = loopPath(u);
    put(x, y, 0, 0.35);
  }
  for (let i = 0; i < 900; i++) put(START - 0.6 + r() * 7.4, 0, -1.6 + r() * 3.2, 0.12);
  const ring: number[] = [];
  for (let k = 0; k < 150; k++) {
    const a = (k / 150) * Math.PI;
    ring.push(0, Math.sin(a) * 0.48, Math.cos(a) * 0.48, 1);
  }
  return { block: new Float32Array(block), world: new Float32Array(world), ring: new Float32Array(ring) };
}

/** QC loop: up from the Review gate, across the top (adjudication), down to the line. */
function loopPath(u: number): [number, number] {
  const x = REVIEW + (RETURN - REVIEW) * ease(u);
  const y = B + Math.sin(Math.PI * u) * 0.95;
  return [x, y];
}

type Block = {
  x: number;
  y: number;
  z: number;
  s: number; // scale
  a: number; // alpha
  hot: number; // 0 grey, 1 chartreuse
  st: "run" | "loop" | "fade" | "stack" | "ship";
  u: number;
  reject: boolean;
  slot: number;
};

const VS = `
attribute vec4 a;
uniform mat4 mvp; uniform float px; uniform vec4 lc;
varying vec4 c;
void main() {
  vec4 q = mvp * vec4(a.xyz, 1.0);
  gl_Position = q;
  gl_PointSize = px * clamp(5.5 / q.w, 0.7, 1.9);
  c = vec4(lc.rgb, lc.a * a.w);
}`;
const FS = `
precision mediump float; varying vec4 c;
void main() {
  vec2 d = gl_PointCoord - 0.5; if (dot(d, d) > 0.25) discard;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

const GREY: V3 = [0.78, 0.8, 0.8];
const HOT: V3 = [0.84, 1.0, 0.3];

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
  const upload = (d: Float32Array) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
    return { buf, n: d.length / 4 };
  };
  const M = meshes();
  const blockMesh = upload(M.block);
  const worldMesh = upload(M.world);
  const ringMesh = upload(M.ring);
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

  // --- Simulation -----------------------------------------------------------------
  const r = rng(42);
  const blocks: Block[] = [];
  let spawnIn = 0;
  let approvals = 0;
  let stackCount = 0;
  let shipIn = -1;
  let time = 0;
  const step = (dt: number) => {
    time += dt;
    spawnIn -= dt;
    if (spawnIn <= 0) {
      spawnIn = 0.95;
      blocks.push({ x: START, y: B, z: 0, s: 1, a: 0, hot: 0, st: "run", u: 0, reject: false, slot: 0 });
    }
    for (const b of blocks) {
      if (b.st === "run") {
        const before = b.x;
        b.x += SPEED * dt;
        b.a = Math.min(1, b.a + dt * 2);
        if (before < REVIEW && b.x >= REVIEW) {
          // The AI score sends some hours to QC; one approval in ten is audited too.
          const low = r() < 0.24;
          const audit = !low && ++approvals % 10 === 0;
          if (low || audit) {
            b.st = "loop";
            b.u = 0;
            b.reject = low && r() < 0.45;
          }
        }
        if (before < APPROVE && b.x >= APPROVE) b.hot = 1;
        if (b.x >= STACK - 0.02) {
          b.st = "stack";
          b.slot = stackCount++;
          if (stackCount === BATCH) shipIn = 0.8;
        }
      } else if (b.st === "loop") {
        b.u += dt / 2.6;
        // Pause a moment at the top: adjudication.
        const u = b.u < 0.4 ? b.u * 1.25 : b.u < 0.6 ? 0.5 : 0.5 + (b.u - 0.6) * 1.25;
        const [x, y] = loopPath(Math.min(1, u));
        b.x = x;
        b.y = y;
        if (b.reject && b.u >= 0.55) b.st = "fade";
        if (b.u >= 1) {
          b.st = "run";
          b.y = B;
        }
      } else if (b.st === "fade") {
        b.y += dt * 0.35;
        b.z -= dt * 0.25;
        b.a -= dt * 1.1;
        b.s = Math.max(0.4, b.s - dt * 0.5);
      } else if (b.st === "stack") {
        const ty = B + b.slot * (B * 2 + 0.015);
        b.x += (STACK - b.x) * Math.min(1, dt * 10);
        b.y += (ty - b.y) * Math.min(1, dt * 10);
      } else if (b.st === "ship") {
        b.z -= dt * 1.4;
        b.a -= dt * 0.9;
      }
    }
    if (shipIn > 0) {
      shipIn -= dt;
      if (shipIn <= 0) {
        for (const b of blocks) if (b.st === "stack") b.st = "ship";
        stackCount = 0;
      }
    }
    for (let i = blocks.length - 1; i >= 0; i--) if (blocks[i].a < 0 && blocks[i].st !== "run") blocks.splice(i, 1);
  };
  if (opts.still) for (let i = 0; i < 900; i++) step(1 / 60);
  else for (let i = 0; i < 360; i++) step(1 / 60); // start with the line already moving

  // --- Rendering ------------------------------------------------------------------
  let sx = 0;
  const anchors: V3[] = [
    [START + 0.45, 0.62, 0],
    [REVIEW, 0.7, 0],
    [APPROVE, 0.7, 0],
    [STACK, 0.95, 0],
  ];
  function draw() {
    const aspect = canvas.width / canvas.height;
    const narrow = aspect < 1.4;
    sx += (opts.pointer() - sx) * 0.05;
    const swing = -0.32 + (opts.still ? 0 : 0.08 * Math.sin(time * 0.15)) + sx * 0.25;
    const R = 5.6;
    // Portrait: stand behind the start of the line so it runs away into depth.
    const eye: V3 = narrow ? [-5.6 + swing * 0.8, 2.9, 2.6] : [Math.sin(swing) * R, 2.3, Math.cos(swing) * R];
    const target: V3 = narrow ? [0.9, 0.15, -0.2] : [0.1, 0.4, 0];
    const vp = mul(perspective(((narrow ? 44 : 36) * Math.PI) / 180, aspect, 0.1, 50), lookAt(eye, target));
    gl.uniform1f(uPx, dpr * 1.7);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const drawMesh = (m: { buf: WebGLBuffer | null; n: number }, model: number[], col: V3, a: number) => {
      if (a < 0.01) return;
      gl.uniformMatrix4fv(uMvp, false, mul(vp, model));
      gl.uniform4f(uLc, col[0] * a, col[1] * a, col[2] * a, a);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, m.n);
    };
    drawMesh(worldMesh, at([0, 0, 0]), GREY, 0.7);
    // Gates glow as a block passes through them.
    for (const [gx, col] of [[REVIEW, GREY], [APPROVE, HOT]] as [number, V3][]) {
      let near = 0;
      for (const b of blocks) if (b.y < 0.3) near = Math.max(near, 1 - Math.abs(b.x - gx) / 0.35);
      drawMesh(ringMesh, at([gx, 0, 0]), col, 0.45 + 0.55 * clamp(near));
    }
    for (const b of blocks) {
      const col: V3 = [GREY[0] + (HOT[0] - GREY[0]) * b.hot, GREY[1] + (HOT[1] - GREY[1]) * b.hot, GREY[2] + (HOT[2] - GREY[2]) * b.hot];
      drawMesh(blockMesh, at([b.x, b.y, b.z], b.s), col, clamp(b.a) * (b.st === "loop" || b.st === "fade" ? 0.75 : 1));
    }
    // Pin the HTML labels to their anchors.
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    opts.labels.forEach((el, i) => {
      const p = anchors[i];
      const x = vp[0] * p[0] + vp[4] * p[1] + vp[8] * p[2] + vp[12];
      const y = vp[1] * p[0] + vp[5] * p[1] + vp[9] * p[2] + vp[13];
      const wq = vp[3] * p[0] + vp[7] * p[1] + vp[11] * p[2] + vp[15];
      el.style.transform = `translate(${((x / wq + 1) / 2) * w}px, ${((1 - y / wq) / 2) * h}px) translate(-50%, -100%)`;
    });
  }

  let raf = 0;
  let last = performance.now();
  let visible = true;
  const loop = (now: number) => {
    raf = 0;
    step(Math.min(0.05, (now - last) / 1000));
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
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", run);
  };
}
