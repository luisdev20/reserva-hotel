// ============================================================
//  Andes Suites — comportamiento general del sitio
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const abierto = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      toggle.innerHTML = abierto ? '&#10005;' : '&#9776;';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.innerHTML = '&#9776;';
    }));
  }

  // Resalta el enlace de navegación de la página actual
  const aqui = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') && a.getAttribute('href').endsWith(aqui)) a.classList.add('active');
  });
});
