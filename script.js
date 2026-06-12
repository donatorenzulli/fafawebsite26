/* =========================================
   FAFA FEST 2026 — landing scripts
   - Floater drag (pointer events, mouse+touch)
   - Wiggle parameters from data-attributes
   - Overlay open/close
   ========================================= */

(() => {
  const stage = document.getElementById('stage');

  // -----------------------------
  // 1) Init wiggle parameters
  // -----------------------------
  // Ogni .floater / .btn-pill / .bubble può avere data-dur e data-rot
  // che vengono mappate a CSS custom properties.
  const wiggleTargets = document.querySelectorAll('[data-dur], [data-rot]');
  wiggleTargets.forEach((el) => {
    const dur = el.dataset.dur;
    const rot = el.dataset.rot;
    if (dur) el.style.setProperty('--wiggle-dur', `${dur}s`);
    if (rot) el.style.setProperty('--wiggle-rot', `${rot}deg`);
  });

  // -----------------------------
  // 2) Posizione iniziale di oggetti e bubble
  // -----------------------------
  const positioned = document.querySelectorAll('.floater, .bubble');
  positioned.forEach((el) => {
    if (typeof el.dataset.x !== 'undefined' && typeof el.dataset.y !== 'undefined') {
      const x = parseFloat(el.dataset.x);
      const y = parseFloat(el.dataset.y);
      el.style.left = `${x}%`;
      el.style.top  = `${y}%`;
    }
  });

  const draggables = document.querySelectorAll('.floater');
  draggables.forEach((el) => el.classList.add('draggable'));

  // -----------------------------
  // 3) Drag logic
  // -----------------------------
  let active = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startElX = 0;
  let startElY = 0;
  let movedDistance = 0;
  const DRAG_THRESHOLD = 6; // px prima di considerare drag (per distinguere click)

  const onPointerDown = (e) => {
    const target = e.currentTarget;
    active = target;
    movedDistance = 0;

    const rect = target.getBoundingClientRect();
    const parentRect = stage.getBoundingClientRect();

    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startElX = rect.left - parentRect.left;
    startElY = rect.top  - parentRect.top;

    target.setPointerCapture(e.pointerId);
    target.classList.add('dragging');
  };

  const onPointerMove = (e) => {
    if (!active || active !== e.currentTarget) return;

    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;
    movedDistance = Math.max(movedDistance, Math.hypot(dx, dy));

    const parentRect = stage.getBoundingClientRect();
    const newX = startElX + dx;
    const newY = startElY + dy;

    // posiziono in px relativi allo stage, poi converto in %
    active.style.left = `${(newX / parentRect.width)  * 100}%`;
    active.style.top  = `${(newY / parentRect.height) * 100}%`;
  };

  const onPointerUp = (e) => {
    if (!active) return;
    active.classList.remove('dragging');
    try { active.releasePointerCapture(e.pointerId); } catch (_) {}

    // Se non c'è stato drag significativo, lascio passare il click (a/button).
    // Se invece è stato drag, blocco il click successivo solo per questo target.
    if (movedDistance > DRAG_THRESHOLD) {
      const blocker = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
      active.addEventListener('click', blocker, { capture: true, once: true });
    }
    active = null;
  };

  draggables.forEach((el) => {
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
  });

  // -----------------------------
  // 4) Overlay open/close
  // -----------------------------
  const overlayMap = {
    'open-lineup': document.getElementById('overlay-lineup'),
    'open-perche': document.getElementById('overlay-perche'),
  };

  const openOverlay = (overlay) => {
    overlay.hidden = false;
    document.body.classList.add('overlay-open');
  };

  const closeOverlay = (overlay) => {
    overlay.hidden = true;
    if (!Object.values(overlayMap).some((o) => !o.hidden)) {
      document.body.classList.remove('overlay-open');
    }
  };

  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const overlay = overlayMap[btn.dataset.action];
      if (overlay) openOverlay(overlay);
    });
  });

  Object.values(overlayMap).forEach((overlay) => {
    overlay.querySelector('.overlay-backdrop').addEventListener('click', () => closeOverlay(overlay));
    overlay.querySelector('.overlay-close').addEventListener('click', () => closeOverlay(overlay));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Object.values(overlayMap).forEach((overlay) => {
        if (!overlay.hidden) closeOverlay(overlay);
      });
    }
  });

  // -----------------------------
  // 5) External links (placeholder)
  // -----------------------------
  // Sostituire questi URL quando forniti dall'utente.
  const LINKS = {
    biglietti: 'https://link.dice.fm/lc813c311f7b',      // TODO: URL ticketing
    arrivare:  'https://maps.app.goo.gl/5PbU46M9bnMrmFZUA',      // TODO: URL Google Maps o pagina interna
    instagram: 'https://www.instagram.com/fafa_festival/',
  };
  const setHref = (id, url) => { const el = document.getElementById(id); if (el && url) el.href = url; };
  setHref('btn-biglietti', LINKS.biglietti);
  setHref('btn-arrivare',  LINKS.arrivare);
  setHref('btn-instagram', LINKS.instagram);
})();
