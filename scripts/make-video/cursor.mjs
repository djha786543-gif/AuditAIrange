// Injected into the page so Playwright's synthetic mouse moves are
// visible in the recorded video (Chrome's normal cursor isn't captured
// by Playwright's video pipeline).

export const CURSOR_INIT_SCRIPT = `
(() => {
  if (window.__auditCursor) return;
  const cur = document.createElement('div');
  cur.id = '__audit-cursor';
  cur.style.cssText = [
    'position:fixed',
    'top:0','left:0',
    'width:18px','height:18px',
    'border-radius:50%',
    'background:radial-gradient(circle,#fff 0%,#fff 35%,rgba(79,70,229,0.95) 70%,rgba(236,72,153,0.6) 100%)',
    'box-shadow:0 0 0 2px rgba(255,255,255,0.9), 0 6px 18px rgba(79,70,229,0.45)',
    'pointer-events:none',
    'z-index:2147483647',
    'transform:translate(-50%,-50%)',
    'transition:transform 0.04s linear',
    'opacity:0.95',
  ].join(';');
  document.documentElement.appendChild(cur);
  let lastX = window.innerWidth / 2, lastY = window.innerHeight / 2;
  cur.style.left = lastX + 'px';
  cur.style.top = lastY + 'px';
  const update = (e) => {
    lastX = e.clientX; lastY = e.clientY;
    cur.style.left = lastX + 'px';
    cur.style.top = lastY + 'px';
  };
  document.addEventListener('mousemove', update, true);
  document.addEventListener('pointermove', update, true);
  document.addEventListener('click', (e) => {
    const r = document.createElement('div');
    r.style.cssText = [
      'position:fixed',
      'left:' + e.clientX + 'px',
      'top:' + e.clientY + 'px',
      'width:14px','height:14px',
      'border-radius:50%',
      'border:2px solid rgba(236,72,153,0.85)',
      'pointer-events:none',
      'z-index:2147483646',
      'transform:translate(-50%,-50%) scale(1)',
      'transition:transform 0.5s ease-out, opacity 0.5s ease-out',
      'opacity:1',
    ].join(';');
    document.documentElement.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transform = 'translate(-50%,-50%) scale(4)';
      r.style.opacity = '0';
    });
    setTimeout(() => r.remove(), 600);
  }, true);
  window.__auditCursor = true;
})();
`;
