// ============================================================
//  AndesDB — Autenticación básica (localStorage / sessionStorage)
//  Andes Suites © 2026 — Base para el sistema de reservas.
//  De momento solo maneja usuarios y sesión; la lógica de
//  reservas se agregará cuando se desarrollen los paneles.
// ============================================================
(function () {
  const USERS_KEY   = 'andes_users';
  const SESSION_KEY = 'andes_session';

  const USERS_DEFAULT = [
    { usuario: 'admin',        password: '1234', rol: 'admin',        nombre: 'Administrador' },
    { usuario: 'recepcion',    password: '1234', rol: 'recepcionista', nombre: 'Recepción' },
    { usuario: 'huesped',      password: '1234', rol: 'cliente',      nombre: 'Huésped Demo' },
  ];
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(USERS_DEFAULT));
  }

  window.AndesDB = {
    getUsers ()  { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); },

    login (usuario, password, rol) {
      const u = this.getUsers().find(u =>
        u.usuario.toLowerCase() === (usuario || '').trim().toLowerCase() &&
        u.password === password &&
        u.rol === rol
      );
      return u || null;
    },

    setSession (u)  { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); },
    getSession ()   { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); },
    clearSession () { sessionStorage.removeItem(SESSION_KEY); },
  };
})();
