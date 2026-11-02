// Firstperson Labs — site interactions (no dependencies)
(function () {
  "use strict";

  // Mobile nav
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Scroll reveal
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Tabs
  document.querySelectorAll("[data-tabs]").forEach((group) => {
    const tabs = group.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          const selected = t === tab;
          t.setAttribute("aria-selected", String(selected));
          const panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
      })
    );
  });

  // Forms — static site: no backend. Swap `action` for Formspree / your API.
  document.querySelectorAll("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (form.getAttribute("action")) return; // real endpoint configured
      e.preventDefault();
      form.classList.add("is-sent");
      form.querySelectorAll("input, select, textarea, button").forEach((el) => (el.disabled = true));
    });
  });

  // Hero capture viewport simulation
  const vp = document.querySelector("[data-viewport]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (vp) {
    const gaze = vp.querySelector(".gaze");
    const ts = vp.querySelector("[data-ts]");
    const frame = vp.querySelector("[data-frame]");
    const imu = vp.querySelector(".imu");
    const pose = vp.querySelector("[data-pose]");
    const bars = [];
    if (imu) for (let i = 0; i < 28; i++) { const b = document.createElement("i"); b.style.height = "4px"; imu.appendChild(b); bars.push(b); }

    const targets = [[58, 56], [36, 62], [70, 40], [52, 70], [44, 48]];
    let t = 0, f = 0;
    const start = performance.now();

    const pad = (n, l = 2) => String(n).padStart(l, "0");
    function tick() {
      const ms = performance.now() - start;
      const s = Math.floor(ms / 1000);
      if (ts) ts.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}.${pad(Math.floor((ms % 1000) / 10))}`;
      f += 1;
      if (frame) frame.textContent = pad(f, 6);
      if (!reduce) requestAnimationFrame(tick);
    }
    tick();

    if (!reduce) {
      setInterval(() => {
        t = (t + 1) % targets.length;
        const [x, y] = targets[t];
        if (gaze) { gaze.style.left = x + "%"; gaze.style.top = y + "%"; }
      }, 1600);
      setInterval(() => {
        const ph = performance.now() / 300;
        bars.forEach((b, i) => (b.style.height = 3 + Math.abs(Math.sin(ph + i * 0.5)) * 16 + Math.random() * 3 + "px"));
        if (pose) {
          const yaw = (Math.sin(ph / 3) * 12).toFixed(1), pitch = (Math.cos(ph / 4) * 6 - 18).toFixed(1);
          pose.textContent = `yaw ${yaw}°  pitch ${pitch}°`;
        }
      }, 120);
    }
  }
})();
