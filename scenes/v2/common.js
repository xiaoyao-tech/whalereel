/* 鲸片 WhaleReel · shared scene helpers (classic script, no modules) */

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function ease(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }
function easeInOut(x) {
  x = clamp(x, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
function ramp(t, start, dur) { return ease((t - start) / dur); }
function lerp(a, b, p) { return a + (b - a) * p; }

function mountEndCard(styleName) {
  const stage = document.querySelector(".stage");
  const el = document.createElement("div");
  el.className = "endcard";
  el.innerHTML = `
    <div class="inner">
      <svg class="whale" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d="M16 64C26 41 57 32 82 44c10 5 16 14 18 22-8 6-18 8-28 6l-12 12 4-14C48 70 31 68 16 64Z"
              stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="82" cy="52" r="2.6" fill="currentColor"/>
        <path d="M38 41c-4-8 0-14 6-16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <path d="M44 36c-2-5 0-8 3-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <div class="brand">鲸片</div>
      <div class="en">WHALEREEL</div>
      <div class="style">${styleName}</div>
    </div>`;
  stage.appendChild(el);
  return function update(t) {
    const p = ramp(t, 9.0, 0.55);
    el.style.opacity = String(p);
    el.style.transform = `translateY(${(1 - p) * 10}px)`;
  };
}

function boot(seek, duration) {
  window.__duration = duration || 8;
  window.__seek = seek;
  if (!window.__preview) window.__preview = 8.4;
  const params = new URLSearchParams(location.search);
  const fixedT = params.has("t") ? Number(params.get("t")) : null;

  const run = () => {
    seek(fixedT == null ? 0 : fixedT);
    window.__ready = true;
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
    setTimeout(run, 700);
  } else {
    setTimeout(run, 50);
  }

  if (location.hash === "#preview" && fixedT == null) {
    const start = performance.now();
    const tick = (now) => {
      seek(((now - start) / 1000) % window.__duration);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
