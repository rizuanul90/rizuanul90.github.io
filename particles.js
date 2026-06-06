(function () {
  /* ── CANVAS SETUP ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:0',
    'opacity:1',
    'transition:opacity 0.6s ease'
  ].join(';');
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');

  /* ── COLORS — react to light/dark mode ── */
  function isLight() { return document.body.classList.contains('light'); }

  function accentColor(alpha) {
    return isLight()
      ? `rgba(0,150,200,${alpha})`
      : `rgba(0,212,255,${alpha})`;
  }

  function accent2Color(alpha) {
    return isLight()
      ? `rgba(0,180,120,${alpha})`
      : `rgba(0,255,157,${alpha})`;
  }

  /* ── PARTICLE CONFIG ── */
  const CONFIG = {
    count: 72,
    maxDist: 130,
    speed: 0.38,
    minRadius: 0.6,
    maxRadius: 2.0,
    lineWidth: 0.5,
  };

  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = CONFIG.speed * (0.4 + Math.random() * 0.6);
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      useAccent2: Math.random() > 0.65,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, mkParticle);
  }

  /* ── MAIN LOOP ── */
  let raf;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* move */
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    /* connections */
    const light = isLight();
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = light
            ? 0.12 * (1 - dist / CONFIG.maxDist)
            : 0.20 * (1 - dist / CONFIG.maxDist);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = CONFIG.lineWidth;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    /* dots */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.useAccent2
        ? accent2Color(light ? 0.55 : 0.75)
        : accentColor(light  ? 0.55 : 0.75);
      ctx.fill();
    });

    raf = requestAnimationFrame(draw);
  }

  /* ── INIT & EVENTS ── */
  init();
  draw();

  window.addEventListener('resize', () => {
    resize();
    /* reposition any particle now off-screen */
    particles.forEach(p => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  });

  /* Pause when tab is hidden — saves CPU */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });

  /* Expose toggle so theme button can call it if needed */
  window.particlesInstance = { canvas };
})();
