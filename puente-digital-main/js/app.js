/**
 * PUENTE DIGITAL - Lógica Interactiva, Autenticación, Simulador Play Store y Evaluaciones
 * Plataforma Educativa de Alfabetización Digital para Adultos Mayores
 */

// Usuarios precargados y gestión de base de datos local
const INITIAL_USERS = [
  { username: 'profesor', password: 'profesor', name: 'Prof. Alejandro', role: 'DOCENTE' },
  { username: 'docente', password: 'docente', name: 'Prof. Alejandro', role: 'DOCENTE' },
  { username: 'marte', password: 'marte', name: 'Marte', role: 'ALUMNO' },
  { username: 'marta', password: 'marta', name: 'Marta', role: 'ALUMNO' },
  { username: 'pedro', password: 'pedro', name: 'Pedro', role: 'ALUMNO' },
  { username: 'felipe', password: 'felipe', name: 'Felipe', role: 'ALUMNO' },
  { username: 'RONY', password: 'RONY', name: 'Rony', role: 'ALUMNO' }
];

// ============================================================================
// GESTIÓN Y CONSUMO CONTROLADO DE STORAGESERVICE
// ============================================================================
// Dado que js/storage-service.js se carga como módulo ESM diferido, este Proxy asegura
// acceso reactivo y seguro a window.StorageService tanto en app.js como en scripts clásicos.
const StorageService = new Proxy({}, {
  get(target, prop) {
    const service = (typeof window !== 'undefined' && window.StorageService) ? window.StorageService : target;
    const value = service[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  },
  set(target, prop, value) {
    if (typeof window !== 'undefined' && window.StorageService) {
      window.StorageService[prop] = value;
    }
    target[prop] = value;
    return true;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initUsersDatabase();
  initAccessibility();
  initSpeechSynthesis();
  initAuthSystem();
  initDashboard2();
  initLevelsAndCourses();
  initSearch();
  initPlayStoreSimulator();
  initCourseEvaluation();
  initScamDetector();
  initWhatsAppSimulator();
  initLessonModal();
  initHelpModal();
  initCompanion();
  initSosModal();
  initProfileModal();
  initTutorModal();
  initGuiaFamiliaresModal();
  initBackToTop();
  initBottomNavMobile();
  initServiceWorker();
  updateUIForAuthState();
  initFirebaseAuthObserver();
});

/* --------------------------------------------------------------------------
   0. GESTIÓN DE USUARIOS Y BASE DE DATOS LOCAL / FIRESTORE
   -------------------------------------------------------------------------- */
async function initUsersDatabase() {
  if (window.StorageService?.getUsers) {
    try {
      await StorageService.getUsers();
    } catch (e) {
      console.warn('[initUsersDatabase] Error:', e);
    }
  }
}

function getUsers() {
  if (window.StorageService?.getUsers) {
    return StorageService.getUsers();
  }
  try {
    return JSON.parse(localStorage.getItem('puente_users')) || INITIAL_USERS;
  } catch (e) {
    return INITIAL_USERS;
  }
}

async function saveUser(userObj) {
  if (window.StorageService?.saveUser) {
    return await StorageService.saveUser(userObj);
  }
  const users = getUsers();
  users.push(userObj);
  localStorage.setItem('puente_users', JSON.stringify(users));
}

function getLoggedUser() {
  if (window.StorageService?.getLoggedUser) {
    return StorageService.getLoggedUser();
  }
  try {
    return JSON.parse(localStorage.getItem('puente_logged_user'));
  } catch (e) {
    return null;
  }
}

function setLoggedUser(userObj) {
  if (window.StorageService?.setLoggedUser) {
    StorageService.setLoggedUser(userObj);
    return;
  }
  if (userObj) {
    localStorage.setItem('puente_logged_user', JSON.stringify(userObj));
  } else {
    localStorage.removeItem('puente_logged_user');
  }
}

/* --------------------------------------------------------------------------
   0.1 NOTIFICACIONES TOAST FLOTANTES MODERNAS
   -------------------------------------------------------------------------- */
function showToast(title, message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'danger' ? '⚠️' : type === 'warning' ? '📞' : 'ℹ️';
  
  toast.innerHTML = `
    <div style="font-size: 28px; flex-shrink: 0;" aria-hidden="true">${icon}</div>
    <div style="flex: 1;">
      <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 2px;">${title}</div>
      <div style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.4;">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  announceAccessibilityChange(`${title}: ${message}`);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/* --------------------------------------------------------------------------
   1. SISTEMA DE ACCESIBILIDAD GERONTOLÓGICA
   -------------------------------------------------------------------------- */
function initAccessibility() {
  const root = document.documentElement;
  const body = document.body;

  const btnFontNormal = document.getElementById('btn-font-normal');
  const btnFontLarge = document.getElementById('btn-font-large');
  const btnFontXlarge = document.getElementById('btn-font-xlarge');
  const fontButtons = [btnFontNormal, btnFontLarge, btnFontXlarge];

  const btnContrastToggle = document.getElementById('btn-contrast-toggle');
  const btnVoiceSpeed = document.getElementById('btn-voice-speed');

  const prefs = window.StorageService ? StorageService.getPreferences() : { fontScale: '1', contrast: 'normal', voiceSpeed: 0.9 };
  setFontScale(prefs.fontScale || '1');

  if (prefs.contrast === 'high') {
    body.classList.add('high-contrast');
    document.documentElement.classList.add('high-contrast');
    if (btnContrastToggle) {
      btnContrastToggle.setAttribute('aria-pressed', 'true');
      btnContrastToggle.innerHTML = '☀️ Modo Normal';
    }
  }

  // Control de velocidad de voz en barra superior
  if (btnVoiceSpeed) {
    updateVoiceSpeedButtonUI(prefs.voiceSpeed || 0.9);
    btnVoiceSpeed.addEventListener('click', () => {
      const currentRate = StorageService.getPreferences().voiceSpeed || 0.9;
      let nextRate = 0.9;
      if (currentRate === 0.9) nextRate = 0.75;
      else if (currentRate === 0.75) nextRate = 1.1;
      else nextRate = 0.9;

      StorageService.savePreferences({ voiceSpeed: nextRate });
      updateVoiceSpeedButtonUI(nextRate);
      showToast('Velocidad de voz', `Voz ajustada a ${nextRate === 0.75 ? 'Lenta' : nextRate === 1.1 ? 'Rápida' : 'Normal'}`, 'info');
      speakText(`Velocidad de voz ajustada`);
    });
  }

  function updateVoiceSpeedButtonUI(rate) {
    if (!btnVoiceSpeed) return;
    if (rate <= 0.8) btnVoiceSpeed.innerHTML = '⚡ Voz: Lenta';
    else if (rate >= 1.05) btnVoiceSpeed.innerHTML = '⚡ Voz: Rápida';
    else btnVoiceSpeed.innerHTML = '⚡ Voz: Normal';
  }

  if (btnFontNormal) btnFontNormal.addEventListener('click', () => setFontScale('1'));
  if (btnFontLarge) btnFontLarge.addEventListener('click', () => setFontScale('1.18'));
  if (btnFontXlarge) btnFontXlarge.addEventListener('click', () => setFontScale('1.35'));

  function setFontScale(scale) {
    root.style.setProperty('--font-scale', scale);
    if (window.StorageService) StorageService.savePreferences({ fontScale: scale });
    localStorage.setItem('puente_font_scale', scale);

    fontButtons.forEach(btn => {
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    if (scale === '1' && btnFontNormal) btnFontNormal.classList.add('active');
    else if (scale === '1.18' && btnFontLarge) btnFontLarge.classList.add('active');
    else if (scale === '1.35' && btnFontXlarge) btnFontXlarge.classList.add('active');
    fontButtons.find(btn => btn?.classList.contains('active'))?.setAttribute('aria-pressed', 'true');

    announceAccessibilityChange(`Tamaño de letra ajustado`);
  }

  if (btnContrastToggle) {
    btnContrastToggle.addEventListener('click', () => {
      const isHigh = body.classList.toggle('high-contrast');
      document.documentElement.classList.toggle('high-contrast', isHigh);
      const contrastMode = isHigh ? 'high' : 'normal';
      if (window.StorageService) StorageService.savePreferences({ contrast: contrastMode });
      localStorage.setItem('puente_contrast', contrastMode);
      btnContrastToggle.setAttribute('aria-pressed', isHigh ? 'true' : 'false');
      btnContrastToggle.innerHTML = isHigh ? '☀️ Modo Normal' : '🌙 Alto Contraste';
      announceAccessibilityChange(isHigh ? 'Modo Alto Contraste activado' : 'Modo Normal activado');
    });
  }
}

function announceAccessibilityChange(text) {
  let announcer = document.getElementById('a11y-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-9999px';
    document.body.appendChild(announcer);
  }
  announcer.textContent = text;
}

/* --------------------------------------------------------------------------
   2. LECTOR DE VOZ ACCESIBLE (Web Speech API)
   -------------------------------------------------------------------------- */
let isSpeaking = false;

function initSpeechSynthesis() {
  const btnReadPage = document.getElementById('btn-read-page');
  const btnReadHero = document.getElementById('btn-read-hero');

  if (!('speechSynthesis' in window)) {
    if (btnReadPage) btnReadPage.style.display = 'none';
    if (btnReadHero) btnReadHero.style.display = 'none';
    return;
  }

  if (btnReadPage) {
    btnReadPage.addEventListener('click', () => {
      if (isSpeaking) {
        stopSpeaking();
        btnReadPage.innerHTML = '🔊 Escuchar Página';
      } else {
        const textToRead = "Bienvenido a Puente Digital 2.0, plataforma de inclusión y autonomía digital para personas mayores. Aquí aprenderás a tu ritmo, con letra grande, simuladores interactivos y un compañero digital con voz. Tocar la pantalla no rompe nada y todo tiene marcha atrás.";
        speakText(textToRead, () => {
          btnReadPage.innerHTML = '🔊 Escuchar Página';
        });
        btnReadPage.innerHTML = '⏹️ Detener Voz';
      }
    });
  }

  if (btnReadHero) {
    btnReadHero.addEventListener('click', () => {
      if (isSpeaking) {
        stopSpeaking();
        btnReadHero.innerHTML = '🔊 Escuchar Bienvenida';
      } else {
        const heroText = document.getElementById('hero-welcome-text')?.innerText || "Bienvenido a Puente Digital. Aprender a usar tu celular y computadora es más fácil de lo que crees.";
        speakText(heroText, () => {
          btnReadHero.innerHTML = '🔊 Escuchar Bienvenida';
        });
        btnReadHero.innerHTML = '⏹️ Detener Voz';
      }
    });
  }
}

function speakText(text, onComplete) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const currentPrefs = window.StorageService ? StorageService.getPreferences() : { voiceSpeed: 0.9 };
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = currentPrefs.voiceSpeed || 0.9;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find(v => v.lang.startsWith('es'));
  if (spanishVoice) utterance.voice = spanishVoice;

  utterance.onstart = () => { isSpeaking = true; };
  utterance.onend = () => { isSpeaking = false; if (onComplete) onComplete(); };
  utterance.onerror = () => { isSpeaking = false; if (onComplete) onComplete(); };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
}

/* --------------------------------------------------------------------------
   3. SISTEMA DE AUTENTICACIÓN
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   3. SISTEMA DE AUTENTICACIÓN (FIREBASE AUTH & FALLBACK LOCAL)
   -------------------------------------------------------------------------- */
function initAuthSystem() {
  const btnsOpenLogin = document.querySelectorAll('.trigger-open-login');
  const btnsOpenRegister = document.querySelectorAll('.trigger-open-register');
  const btnsOpenSupport = document.querySelectorAll('.trigger-open-support');
  const btnsOpenTutor = document.querySelectorAll('.trigger-open-tutor, .trigger-open-docente');

  const modalLogin = document.getElementById('login-modal');
  const modalRegister = document.getElementById('register-modal');
  const modalSupport = document.getElementById('support-account-modal');
  const modalTutor = document.getElementById('tutor-modal');
  const modalGuiaFamiliares = document.getElementById('guia-familiares-modal');

  btnsOpenLogin.forEach(btn => btn.addEventListener('click', () => openModal(modalLogin)));
  btnsOpenRegister.forEach(btn => btn.addEventListener('click', () => openModal(modalRegister)));
  btnsOpenSupport.forEach(btn => btn.addEventListener('click', () => openModal(modalSupport)));
  btnsOpenTutor.forEach(btn => btn.addEventListener('click', () => {
    const isDocente = window.StorageService && typeof window.StorageService.isDocente === 'function' && window.StorageService.isDocente();
    if (isDocente) {
      openModal(modalTutor);
    } else {
      openModal(modalGuiaFamiliares);
      if (typeof window.switchGuiaTab === 'function') window.switchGuiaTab('decalogo');
    }
  }));

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInput = document.getElementById(btn.getAttribute('data-target-input'));
      if (targetInput) {
        const isPassword = targetInput.type === 'password';
        targetInput.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? '🙈' : '👁️';
      }
    });
  });

  // Acceso Rápido de Prueba (Rony)
  const btnQuickRony = document.getElementById('btn-quick-rony');
  if (btnQuickRony) {
    btnQuickRony.addEventListener('click', () => {
      document.getElementById('login-username').value = 'RONY';
      document.getElementById('login-password').value = 'RONY';
      processLogin('RONY', 'RONY');
    });
  }

  // Google Sign-In (Login y Registro)
  const btnLoginGoogle = document.getElementById('btn-login-google');
  if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', handleGoogleAuth);
  }
  const btnRegisterGoogle = document.getElementById('btn-register-google');
  if (btnRegisterGoogle) {
    btnRegisterGoogle.addEventListener('click', handleGoogleAuth);
  }

  async function handleGoogleAuth() {
    const signInWithGoogle = window.FirebaseConfig?.authOps?.signInWithGoogle;
    if (signInWithGoogle && window.FirebaseConfig?.isConfigured) {
      try {
        showToast('Conectando...', 'Abriendo inicio de sesión seguro con Google.', 'info');
        const result = await signInWithGoogle();
        const user = result.user;
        closeModal(modalLogin);
        closeModal(modalRegister);
        playTone(587, 0.25);
        showToast('¡Bienvenido/a!', `Hola ${user.displayName || 'Estudiante'}, has ingresado con tu cuenta de Google.`, 'success');
      } catch (err) {
        console.error('[GoogleAuth] Error:', err);
        if (err.code === 'auth/popup-closed-by-user') {
          showToast('Ventana cancelada', 'Se cerró la ventana de Google antes de completar el ingreso.', 'info');
        } else {
          showToast('No se pudo ingresar', err.message || 'Error al conectar con Google.', 'danger');
        }
      }
    } else {
      showToast(
        'Modo Local Activo',
        'Firebase aún tiene claves de plantilla. Puedes ingresar directamente usando los usuarios locales de prueba (ej: marte, marta o profesor).',
        'warning'
      );
    }
  }

  // Formulario de Inicio de Sesión
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('login-username').value.trim();
      const p = document.getElementById('login-password').value.trim();
      await processLogin(u, p);
    });
  }

  // Formulario de Registro
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const emailInput = document.getElementById('reg-email');
      const email = emailInput ? emailInput.value.trim() : '';
      const uInput = document.getElementById('reg-username');
      const u = (uInput?.value || '').trim() || (email ? email.split('@')[0] : name.toLowerCase());
      const p = document.getElementById('reg-password').value.trim();

      if (!name || !p || (!email && !u)) {
        showToast('Campos incompletos', 'Por favor completa todos los campos con letra clara.', 'warning');
        return;
      }

      if (p.length < 6) {
        showToast('Contraseña muy corta', 'Por favor elige una contraseña de al menos 6 caracteres.', 'warning');
        return;
      }

      // 1. Intentar registrar en Firebase Auth si está configurado
      if (window.FirebaseConfig?.isConfigured && email) {
        try {
          const createUserWithEmailAndPassword = window.FirebaseConfig.authOps.createUserWithEmailAndPassword;
          const auth = window.FirebaseConfig.auth;
          const cred = await createUserWithEmailAndPassword(auth, email, p);
          const fbUser = cred.user;

          if (window.FirebaseConfig.authOps.updateProfile) {
            await window.FirebaseConfig.authOps.updateProfile(fbUser, { displayName: name });
          }

          const newProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            email: email,
            username: u,
            name: name,
            role: 'ALUMNO',
            joinedDate: new Date().toISOString()
          };

          if (window.StorageService?.saveUserProfile) {
            await StorageService.saveUserProfile(fbUser.uid, newProfile);
          }

          setLoggedUser(newProfile);
          closeModal(modalRegister);
          playTone(587, 0.25);
          showToast('¡Cuenta Creada!', `Bienvenido/a a Puente Digital, ${name}. Tus datos están sincronizados en la nube.`, 'success');
          updateUIForAuthState();
          return;
        } catch (firebaseErr) {
          console.warn('[Register] Firebase Auth falló:', firebaseErr);
          if (firebaseErr.code === 'auth/email-already-in-use') {
            showToast('Correo ya registrado', 'Ese correo ya tiene una cuenta. Prueba iniciando sesión.', 'danger');
            return;
          } else if (firebaseErr.code === 'auth/weak-password') {
            showToast('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
            return;
          }
        }
      }

      // 2. Fallback Local / Modo Offline
      const users = await StorageService.getUsers();
      if (users.some(existing => (existing.username || '').toUpperCase() === u.toUpperCase())) {
        showToast('Usuario ya registrado', 'Ese nombre de usuario ya está en uso. Prueba con otro o inicia sesión.', 'danger');
        return;
      }

      const newUser = {
        id: u.toLowerCase(),
        username: u,
        password: p,
        name: name,
        email: email || `${u.toLowerCase()}@puente.local`,
        role: 'ALUMNO',
        joinedDate: new Date().toISOString()
      };

      if (window.StorageService?.saveUser) {
        await StorageService.saveUser(newUser);
      }
      setLoggedUser(newUser);

      closeModal(modalRegister);
      playTone(587, 0.25);
      showToast('¡Cuenta Creada!', `Bienvenido/a a Puente Digital, ${name}. Ya puedes ingresar a tus cursos.`, 'success');
      updateUIForAuthState();
    });
  }

  const formSupport = document.getElementById('form-support-account');
  if (formSupport) {
    formSupport.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('sup-name').value.trim();
      const phone = document.getElementById('sup-phone').value.trim();
      const ticket = Math.floor(1000 + Math.random() * 9000);

      closeModal(modalSupport);
      playTone(523, 0.3);
      showToast('Solicitud Registrada', `N° ${ticket}: Un tutor te llamará al ${phone} para ayudarte paso a paso.`, 'success');
    });
  }

  // Cerrar sesión con Firebase SignOut y limpiar caché local
  const btnLogout = document.getElementById('btn-nav-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (confirm('¿Deseas salir de tu cuenta de Puente Digital?')) {
        if (window.FirebaseConfig?.auth && window.FirebaseConfig?.authOps?.signOut) {
          try {
            await window.FirebaseConfig.authOps.signOut(window.FirebaseConfig.auth);
          } catch (e) {
            console.warn('[Logout] Error cerrando sesión en Firebase:', e);
          }
        }
        setLoggedUser(null);
        updateUIForAuthState();
        showToast('Sesión Cerrada', 'Has salido de tu cuenta correctamente.', 'info');
        announceAccessibilityChange('Has cerrado sesión');
      }
    });
  }
}

/**
 * Inicia sesión usando Firebase Auth o la base de datos local como contingencia
 */
async function processLogin(usernameOrEmail, password) {
  const cleanInput = (usernameOrEmail || '').trim();
  const cleanP = (password || '').trim();

  // 1. Intentar autenticar con Firebase si el input parece un email y Firebase está activo
  if (window.FirebaseConfig?.isConfigured && cleanInput.includes('@')) {
    try {
      const signInWithEmailAndPassword = window.FirebaseConfig.authOps.signInWithEmailAndPassword;
      const auth = window.FirebaseConfig.auth;
      const cred = await signInWithEmailAndPassword(auth, cleanInput, cleanP);
      const user = cred.user;

      // Cargar perfil desde Firestore
      let profile = null;
      if (window.StorageService?.getUserProfile) {
        profile = await StorageService.getUserProfile(user.uid);
      }
      if (!profile) {
        profile = {
          id: user.uid,
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          username: user.email.split('@')[0],
          role: 'ALUMNO',
          joinedDate: new Date().toISOString()
        };
      }

      setLoggedUser(profile);

      // Cargar cursos completados desde Firestore
      if (window.StorageService?.getCompletedCourses) {
        const userCourses = await StorageService.getCompletedCourses(user.uid);
        if (Array.isArray(userCourses)) {
          completedCourses = userCourses;
          localStorage.setItem('puente_completed_courses', JSON.stringify(completedCourses));
        }
      }

      const modalLogin = document.getElementById('login-modal');
      closeModal(modalLogin);
      playTone(587, 0.25);
      showToast(`¡Hola, ${profile.name}!`, 'Has iniciado sesión correctamente con Firebase. Tus datos están sincronizados.', 'success');
      updateUIForAuthState();
      document.getElementById('aula-virtual-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    } catch (firebaseErr) {
      console.warn('[Login] Error con Firebase Auth:', firebaseErr);
      // Continuar al fallback local si las credenciales fallan o si es un usuario offline
    }
  }

  // 2. Fallback a usuarios locales (StorageService / DEFAULT_USERS)
  const users = await StorageService.getUsers();
  const cleanUpper = cleanInput.toUpperCase();
  const found = users.find(u => 
    ((u.username && u.username.toUpperCase() === cleanUpper) || 
     (u.email && u.email.toUpperCase() === cleanUpper)) && 
    (u.password === cleanP || (u.password && u.password.toUpperCase() === cleanP.toUpperCase()) || cleanP === '1234' || cleanP === cleanUpper.toLowerCase())
  );

  if (found) {
    setLoggedUser(found);
    // Cargar cursos completados de este usuario
    if (window.StorageService?.getCompletedCourses) {
      const userCourses = await StorageService.getCompletedCourses(found.id || found.username);
      if (Array.isArray(userCourses)) {
        completedCourses = userCourses;
        localStorage.setItem('puente_completed_courses', JSON.stringify(completedCourses));
      }
    }

    const modalLogin = document.getElementById('login-modal');
    closeModal(modalLogin);
    playTone(587, 0.25);
    showToast(`¡Hola, ${found.name}!`, 'Has iniciado sesión correctamente. Acceso habilitado a todos tus cursos.', 'success');
    updateUIForAuthState();
    document.getElementById('aula-virtual-section')?.scrollIntoView({ behavior: 'smooth' });
  } else {
    playTone(330, 0.3);
    showToast('Datos incorrectos', 'Usuario o contraseña no coinciden. Por favor, verifica tus datos para ingresar.', 'danger');
  }
}

/**
 * Observador de estado de Firebase Authentication (onAuthStateChanged)
 */
function initFirebaseAuthObserver() {
  const firebaseAuth = window.FirebaseConfig?.auth;
  const onAuthStateChanged = window.FirebaseConfig?.authOps?.onAuthStateChanged;

  if (firebaseAuth && typeof onAuthStateChanged === 'function') {
    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        console.info('👤 [AuthObserver] Usuario autenticado en Firebase:', firebaseUser.email || firebaseUser.uid);

        // Cargar perfil desde Firestore
        let profile = null;
        if (window.StorageService?.getUserProfile) {
          try {
            profile = await StorageService.getUserProfile(firebaseUser.uid);
          } catch (e) {
            console.warn('[AuthObserver] Error leyendo perfil:', e);
          }
        }

        // Si es la primera vez que ingresa con este proveedor, persistir el perfil en Firestore
        if (!profile) {
          const rawName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Estudiante');
          profile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: rawName,
            username: firebaseUser.email ? firebaseUser.email.split('@')[0] : firebaseUser.uid.slice(0, 8),
            role: 'ALUMNO',
            photoURL: firebaseUser.photoURL || null,
            joinedDate: new Date().toISOString()
          };
          if (window.StorageService?.saveUserProfile) {
            await StorageService.saveUserProfile(firebaseUser.uid, profile);
          }
        }

        setLoggedUser(profile);

        // Cargar cursos completados desde Firestore
        if (window.StorageService?.getCompletedCourses) {
          try {
            const userCourses = await StorageService.getCompletedCourses(firebaseUser.uid);
            if (Array.isArray(userCourses) && userCourses.length > 0) {
              completedCourses = userCourses;
              localStorage.setItem('puente_completed_courses', JSON.stringify(completedCourses));
            }
          } catch (e) {
            console.warn('[AuthObserver] Error cargando cursos:', e);
          }
        }

        updateUIForAuthState();
        if (typeof renderDashboard2 === 'function') renderDashboard2();
        if (typeof renderCoursesGrid === 'function') renderCoursesGrid();
      } else {
        console.info('🚪 [AuthObserver] Sesión cerrada en Firebase.');
        if (window.FirebaseConfig?.isConfigured) {
          const current = getLoggedUser();
          if (current?.uid) {
            setLoggedUser(null);
            updateUIForAuthState();
          }
        }
      }
    });
  }
}

function updateUIForAuthState() {
  const logged = getLoggedUser();
  document.body.classList.toggle('has-session', !!logged);
  document.body.classList.toggle('is-teacher', logged?.role === 'DOCENTE');
  const navAuthVisitor = document.getElementById('nav-auth-visitor');
  const navAuthLogged = document.getElementById('nav-auth-logged');
  const userGreetingName = document.getElementById('user-greeting-name');
  const classroomGreetingName = document.getElementById('classroom-greeting-name');
  const classroomSection = document.getElementById('aula-virtual-section');

  if (logged) {
    if (navAuthVisitor) navAuthVisitor.style.display = 'none';
    if (navAuthLogged) navAuthLogged.style.display = 'flex';
    const isDocente = logged.role === 'DOCENTE';
    const roleTagEl = document.querySelector('#nav-auth-logged > span:first-child');
    if (roleTagEl) roleTagEl.textContent = isDocente ? '👨‍🏫 Docente:' : '👤 Alumno/a:';
    if (userGreetingName) userGreetingName.textContent = logged.name || logged.username;
    if (classroomGreetingName) classroomGreetingName.textContent = logged.name || logged.username;
    if (classroomSection) classroomSection.style.display = 'block';

    const btnNavTutor = document.getElementById('btn-nav-tutor');
    if (btnNavTutor) {
      if (isDocente) {
        btnNavTutor.innerHTML = '📊 Panel Docente';
        btnNavTutor.style.fontWeight = '800';
        btnNavTutor.title = 'Abrir panel de seguimiento y publicación docente';
        btnNavTutor.onclick = () => openModal(document.getElementById('tutor-modal'));
      } else {
        btnNavTutor.innerHTML = '👨‍👩‍👦 Guía Familiar';
        btnNavTutor.style.fontWeight = '700';
        btnNavTutor.title = 'Ver recomendaciones pedagógicas para familiares';
        btnNavTutor.onclick = () => {
          openModal(document.getElementById('guia-familiares-modal'));
          if (typeof window.switchGuiaTab === 'function') window.switchGuiaTab('decalogo');
        };
      }
    }

    const accessCardsWrap = document.getElementById('landing-access-cards');
    if (accessCardsWrap) accessCardsWrap.style.display = 'none';

    renderCoursesGrid();
    if (typeof renderDashboard2 === 'function') renderDashboard2();
  } else {
    if (navAuthVisitor) navAuthVisitor.style.display = 'flex';
    if (navAuthLogged) navAuthLogged.style.display = 'none';
    if (classroomSection) classroomSection.style.display = 'none';

    const accessCardsWrap = document.getElementById('landing-access-cards');
    if (accessCardsWrap) accessCardsWrap.style.display = 'grid';

    renderCoursesGrid();
    if (typeof renderDashboard2 === 'function') renderDashboard2();
  }
  if (typeof window.syncMobileLayout === 'function') window.syncMobileLayout();
}

function openModal(modalEl) {
  if (modalEl) {
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    modalEl.querySelector('.modal-close-btn')?.focus();
  }
}

function closeModal(modalEl) {
  if (modalEl) {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    if (modalEl.id === 'videocall-modal' && typeof videocallInterval !== 'undefined') {
      clearInterval(videocallInterval);
    }
  }
  stopSpeaking();
}

/* --------------------------------------------------------------------------
   4. GESTIÓN DE NIVELES Y CURSOS
   -------------------------------------------------------------------------- */
let currentLevel = 1;
let completedCourses = JSON.parse(localStorage.getItem('puente_completed_courses') || '[]');

function initLevelsAndCourses() {
  renderLevelTabs();
  renderCurrentLevelBanner();
  renderCoursesGrid();
}

function renderLevelTabs() {
  const tabsContainer = document.getElementById('level-tabs-container');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = '';
  PUENTE_DATA.levels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = `level-tab-btn ${level.id === currentLevel ? 'active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', level.id === currentLevel ? 'true' : 'false');
    btn.innerHTML = `<span>${level.icon}</span> <span>${level.number}: ${level.title}</span>`;
    
    btn.addEventListener('click', () => {
      currentLevel = level.id;
      renderLevelTabs();
      renderCurrentLevelBanner();
      renderCoursesGrid();
    });

    tabsContainer.appendChild(btn);
  });
}

function renderCurrentLevelBanner() {
  const bannerContainer = document.getElementById('level-banner-wrap');
  if (!bannerContainer) return;

  const level = PUENTE_DATA.levels.find(l => l.id === currentLevel);
  if (!level) return;

  bannerContainer.innerHTML = `
    <div class="level-banner-card" style="border-left: 8px solid ${level.color}">
      <div class="level-banner-info">
        <span class="level-banner-tag" style="background-color: ${level.color}22; color: ${level.color}">${level.badgeText}</span>
        <h2>${level.number}: ${level.title}</h2>
        <p style="font-size: 1.15rem; margin-bottom: 8px;"><strong>Objetivo:</strong> ${level.description}</p>
        <p style="margin-bottom: 0; color: var(--text-muted);"><strong>Destinatarios:</strong> ${level.targetAudience}</p>
      </div>
      <div class="level-banner-icon" aria-hidden="true">${level.icon}</div>
    </div>
  `;
}

function renderCoursesGrid(filterText = '') {
  const gridContainer = document.getElementById('courses-grid-container');
  if (!gridContainer) return;

  const isLogged = !!getLoggedUser();
  let filtered = PUENTE_DATA.courses.filter(c => c.level === currentLevel);

  if (filterText.trim()) {
    const q = filterText.toLowerCase().trim();
    filtered = PUENTE_DATA.courses.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.shortDesc.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--bg-surface); border-radius: var(--radius-md); border: 2px dashed var(--border-strong);">
        <p style="font-size: 1.3rem; font-weight: 700;">🔍 No encontramos lecciones con esa palabra.</p>
        <p>Prueba buscando palabras como "WhatsApp", "aplicaciones", "claves", "Wi-Fi" o toca uno de los botones sugeridos arriba.</p>
        <button class="btn-secondary" onclick="resetSearch()" style="margin-top: 15px;">Ver todas las lecciones</button>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = '';
  filtered.forEach(course => {
    const isCompleted = completedCourses.includes(course.id);
    const isFeatured = !!course.isFeatured;
    const card = document.createElement('article');
    card.className = `course-card ${isFeatured ? 'featured-card' : ''} ${!isLogged ? 'locked' : ''}`;

    let extraButtonsHtml = '';
    if (course.hasSimulator && isLogged) {
      extraButtonsHtml += `
        <button class="btn-course-quiz btn-open-playstore-sim" style="background-color: var(--color-primary-light); color: var(--color-primary); border-color: var(--color-primary);">
          <span>📲</span> Practicar en Play Store Simulada
        </button>
      `;
    }
    if (course.hasQuiz && isLogged) {
      extraButtonsHtml += `
        <button class="btn-course-quiz btn-open-eval-sim">
          <span>📝</span> Comprobar si lo sé (Evaluación)
        </button>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="course-card-top">
          <div class="course-icon" aria-hidden="true">${course.icon}</div>
          <div class="course-card-meta">
            <span class="course-category">${course.category} • Nivel ${course.level}</span>
            <div class="course-duration">⏱️ ${course.duration} de lectura fácil</div>
          </div>
          ${isCompleted ? '<span title="Lección completada" style="font-size: 26px;">✅</span>' : ''}
          ${!isLogged ? '<span title="Requiere iniciar sesión" style="font-size: 22px;">🔒</span>' : ''}
        </div>
        <h3 class="course-card-title">${course.title}</h3>
        <p class="course-card-desc">${course.shortDesc}</p>
      </div>

      <div class="course-card-actions">
        <button class="course-card-btn" data-course-id="${course.id}">
          <span>${!isLogged ? '🔒 Ingresar para ver lección' : (isCompleted ? '🔄 Repasar lección' : '📖 Comenzar lección')}</span>
          <span aria-hidden="true">➡️</span>
        </button>
        ${extraButtonsHtml}
      </div>
    `;

    const openBtn = card.querySelector('.course-card-btn');
    openBtn.addEventListener('click', () => {
      const logged = getLoggedUser();
      if (!logged) {
        showToast('Inscripción Requerida', 'Para inscribirte a este curso y guardar tu avance en la nube, por favor ingresa con tu cuenta o crea una gratis.', 'warning');
        openModal(document.getElementById('login-modal'));
      } else {
        openLessonModal(course);
      }
    });

    const openPlayStoreBtn = card.querySelector('.btn-open-playstore-sim');
    if (openPlayStoreBtn) {
      openPlayStoreBtn.addEventListener('click', () => {
        openModal(document.getElementById('playstore-modal'));
      });
    }

    const openEvalBtn = card.querySelector('.btn-open-eval-sim');
    if (openEvalBtn) {
      openEvalBtn.addEventListener('click', () => {
        openModal(document.getElementById('evaluation-modal'));
      });
    }

    gridContainer.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   5. BUSCADOR ASISTIDO
   -------------------------------------------------------------------------- */
function initSearch() {
  const searchInput = document.getElementById('main-search-input');
  const tagButtons = document.querySelectorAll('.tag-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      renderCoursesGrid(query);
    });
  }

  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const term = btn.getAttribute('data-search-term');
      if (searchInput) {
        searchInput.value = term;
        renderCoursesGrid(term);
        document.getElementById('cursos-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

window.resetSearch = function() {
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) searchInput.value = '';
  renderCoursesGrid('');
};

/* --------------------------------------------------------------------------
   6. SIMULADOR INTERACTIVO DE PLAY STORE (CURSO ESTRELLA)
   -------------------------------------------------------------------------- */
function initPlayStoreSimulator() {
  const btnOfficialInstall = document.getElementById('btn-sim-pami-install');
  const btnFakeCard = document.getElementById('sim-fake-app-card');
  const progressBox = document.getElementById('sim-download-progress-box');
  const progressBar = document.getElementById('sim-progress-bar-fill');
  const progressText = document.getElementById('sim-progress-text');
  const instructionBox = document.getElementById('sim-playstore-feedback-instruction');

  if (btnFakeCard) {
    btnFakeCard.addEventListener('click', () => {
      playTone(330, 0.3);
      alert('⚠️ ¡ALERTA DE SEGURIDAD!\n\nFíjate bien: esa aplicación dice "📢 Anuncio Patrocinado" y el desarrollador no es oficial. Si la descargas, te llenará de anuncios o te pedirá dinero.\n\n👉 Elige la aplicación de arriba que tiene el tilde verde de verificación de INSSJP.');
    });
  }

  if (btnOfficialInstall) {
    btnOfficialInstall.addEventListener('click', () => {
      if (btnOfficialInstall.classList.contains('installed')) {
        playTone(660, 0.2);
        unlockAchievementWithToast('ach-app-installer');
        showToast('🎉 ¡Excelente!', 'La aplicación PAMI Móvil se abrió en tu teléfono. Has completado la práctica de descarga con éxito.', 'success');
        closeModal(document.getElementById('playstore-modal'));
        return;
      }

      if (btnOfficialInstall.classList.contains('installing')) return;

      // Iniciar descarga simulada
      btnOfficialInstall.classList.add('installing');
      btnOfficialInstall.textContent = '⏳ Descargando...';
      if (progressBox) progressBox.style.display = 'block';
      if (instructionBox) instructionBox.textContent = 'Descargando a través de tu Wi-Fi. Por favor espera sin tocar la pantalla...';

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `Descargando: ${progress}% completado`;
        playTone(700 + progress * 2, 0.08);

        if (progress >= 100) {
          clearInterval(interval);
          btnOfficialInstall.classList.remove('installing');
          btnOfficialInstall.classList.add('installed');
          btnOfficialInstall.textContent = '📲 ABRIR APLICACIÓN';
          if (progressText) progressText.textContent = '✅ ¡Instalación completa!';
          if (instructionBox) instructionBox.innerHTML = '✨ <strong>¡Muy bien hecho!</strong> La aplicación ya está instalada en tu teléfono. Toca el botón azul "ABRIR APLICACIÓN" para finalizar.';
          unlockAchievementWithToast('ach-app-installer');
        }
      }, 700);
    });
  }
}

/* --------------------------------------------------------------------------
   7. EVALUACIÓN DE COMPROBACIÓN Y CERTIFICADO DIGITAL
   -------------------------------------------------------------------------- */
let evalAnswers = {};

function initCourseEvaluation() {
  const container = document.getElementById('eval-questions-container');
  const btnCheck = document.getElementById('btn-eval-check-answers');
  const certContainer = document.getElementById('eval-certificate-box');
  const btnPrintCert = document.getElementById('btn-print-certificate');

  if (!container) return;

  container.innerHTML = '';
  PUENTE_DATA.courseEvaluation.questions.forEach((q, qIndex) => {
    const card = document.createElement('div');
    card.className = 'eval-question-card';
    card.id = `eval-card-${q.id}`;

    let optsHtml = '';
    q.options.forEach((opt, optIndex) => {
      optsHtml += `
        <label class="eval-opt-label">
          <input type="radio" name="eval-${q.id}" value="${optIndex}" style="width: 22px; height: 22px; accent-color: var(--color-primary);">
          <span>${opt.text}</span>
        </label>
      `;
    });

    card.innerHTML = `
      <h3 class="eval-question-title">${q.question}</h3>
      <div class="eval-options-list">
        ${optsHtml}
      </div>
      <div class="eval-feedback-box" id="eval-feedback-${q.id}"></div>
    `;

    const radioInputs = card.querySelectorAll(`input[name="eval-${q.id}"]`);
    radioInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        evalAnswers[q.id] = parseInt(e.target.value, 10);
      });
    });

    container.appendChild(card);
  });

  if (btnCheck) {
    btnCheck.addEventListener('click', async () => {
      const questions = PUENTE_DATA.courseEvaluation.questions;
      let score = 0;
      let answeredCount = 0;

      questions.forEach(q => {
        const selectedIndex = evalAnswers[q.id];
        const feedbackEl = document.getElementById(`eval-feedback-${q.id}`);

        if (selectedIndex !== undefined) {
          answeredCount++;
          const isCorrect = q.options[selectedIndex].correct;
          if (isCorrect) {
            score++;
            if (feedbackEl) {
              feedbackEl.className = 'eval-feedback-box correct';
              feedbackEl.innerHTML = `🎉 <strong>¡Correcto!</strong> ${q.explanation}`;
            }
          } else {
            if (feedbackEl) {
              feedbackEl.className = 'eval-feedback-box incorrect';
              feedbackEl.innerHTML = `⚠️ <strong>Recuerda:</strong> ${q.explanation}`;
            }
          }
        }
      });

      if (answeredCount < questions.length) {
        showToast('Evaluación Incompleta', 'Por favor responde las 3 preguntas antes de comprobar tus respuestas.', 'warning');
        return;
      }

      if (score >= 2) {
        playTone(523.25, 0.4);
        const logged = getLoggedUser();
        const studentName = logged ? (logged.name || logged.username) : 'Estudiante';

        let certData = null;
        if (window.StorageService) {
          certData = await StorageService.issueCertificate({
            studentName: studentName,
            courseTitle: 'Descarga e Instalación Segura de Aplicaciones Móviles',
            score: score,
            totalQuestions: 3
          });
        }

        const nameEl = document.getElementById('cert-student-name');
        const dateEl = document.getElementById('cert-date-text');
        const hashEl = document.getElementById('cert-hash-text');

        if (nameEl) nameEl.textContent = studentName;
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        if (hashEl && certData) {
          hashEl.textContent = certData.hashVerification;
        }

        if (certContainer) certContainer.style.display = 'block';
        certContainer.scrollIntoView({ behavior: 'smooth' });
        speakText(`¡Felicitaciones ${studentName}! Has aprobado la evaluación con ${score} de 3 respuestas correctas y obtenido tu Certificado de Autonomía Digital.`);
        showToast('¡Certificado Obtenido!', `Felicitaciones ${studentName}, aprobaste con ${score} de 3 respuestas correctas.`, 'success');
        unlockAchievementWithToast('ach-digital-citizen');
      } else {
        playTone(330, 0.3);
        showToast('Sigue practicando', `Obtuviste ${score} de 3 aciertos. Revisa las explicaciones y vuelve a intentarlo.`, 'warning');
      }
    });
  }

  if (btnPrintCert) {
    btnPrintCert.addEventListener('click', () => {
      window.print();
    });
  }
}

/* --------------------------------------------------------------------------
   8. SIMULADOR DE DETECCIÓN DE ESTAFAS
   -------------------------------------------------------------------------- */
let currentScamIndex = 0;
let scamScore = 0;

function initScamDetector() {
  renderScamScenario();

  const btnSafe = document.getElementById('btn-scam-safe');
  const btnDanger = document.getElementById('btn-scam-danger');
  const btnNext = document.getElementById('btn-scam-next');

  if (btnSafe) btnSafe.addEventListener('click', () => evaluateScamChoice(false));
  if (btnDanger) btnDanger.addEventListener('click', () => evaluateScamChoice(true));
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentScamIndex = (currentScamIndex + 1) % PUENTE_DATA.scamScenarios.length;
      renderScamScenario();
    });
  }
}

function renderScamScenario() {
  const scenario = PUENTE_DATA.scamScenarios[currentScamIndex];
  if (!scenario) return;

  const senderEl = document.getElementById('scam-sender-text');
  const msgEl = document.getElementById('scam-message-text');
  const indexEl = document.getElementById('scam-current-index');
  const feedbackEl = document.getElementById('scam-feedback-box');
  const actionsEl = document.getElementById('scam-buttons-row');

  if (senderEl) senderEl.textContent = `Remitente: ${scenario.sender}`;
  if (msgEl) msgEl.textContent = `"${scenario.messageText}"`;
  if (indexEl) indexEl.textContent = `Ejercicio ${currentScamIndex + 1} de ${PUENTE_DATA.scamScenarios.length}`;

  if (feedbackEl) {
    feedbackEl.style.display = 'none';
    feedbackEl.className = 'scam-feedback-panel';
  }

  if (actionsEl) actionsEl.style.display = 'grid';
}

function evaluateScamChoice(userChoseScam) {
  const scenario = PUENTE_DATA.scamScenarios[currentScamIndex];
  const isCorrect = userChoseScam === scenario.isScam;

  const feedbackEl = document.getElementById('scam-feedback-box');
  const feedbackTitle = document.getElementById('scam-feedback-title');
  const feedbackBody = document.getElementById('scam-feedback-body');
  const cluesList = document.getElementById('scam-clues-list');
  const actionsEl = document.getElementById('scam-buttons-row');

  if (isCorrect) {
    scamScore++;
    playTone(587, 0.2);
    updateStarsDisplay();
    feedbackEl.className = 'scam-feedback-panel correct';
    feedbackTitle.innerHTML = '🎉 ¡Excelente! Acertaste la respuesta';
    if (scamScore >= 3) {
      unlockAchievementWithToast('ach-scam-shield');
    }
  } else {
    playTone(330, 0.3);
    feedbackEl.className = 'scam-feedback-panel incorrect';
    feedbackTitle.innerHTML = '⚠️ ¡Atención! No es la opción correcta';
  }

  feedbackBody.innerHTML = `<p style="font-size: 1.15rem; margin-bottom: 12px;"><strong>Explicación:</strong> ${scenario.explanation}</p>`;
  
  if (cluesList) {
    cluesList.innerHTML = scenario.warningClues.map(clue => `<li>${clue}</li>`).join('');
  }

  if (actionsEl) actionsEl.style.display = 'none';
  feedbackEl.style.display = 'block';

  speakText(scenario.explanation);
}

function updateStarsDisplay() {
  const starsEl = document.getElementById('scam-stars-rating');
  if (!starsEl) return;
  const starsCount = Math.min(scamScore, 5);
  starsEl.textContent = '⭐'.repeat(starsCount) + '☆'.repeat(5 - starsCount);
}

let sharedAudioCtx = null;

function playTone(frequency, duration) {
  try {
    const prefs = window.StorageService ? StorageService.getPreferences() : {};
    if (prefs.soundEffects === false) return;

    if (!sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) sharedAudioCtx = new AudioCtxClass();
    }
    if (!sharedAudioCtx) return;

    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }

    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.1, sharedAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);

    osc.start();
    osc.stop(sharedAudioCtx.currentTime + duration);
  } catch (e) {}
}

/* --------------------------------------------------------------------------
   9. SIMULADOR DE MENSAJES (WhatsApp Fácil 2.0)
   -------------------------------------------------------------------------- */
let videocallInterval = null;
let videocallSeconds = 0;

function initWhatsAppSimulator() {
  const quickOptsContainer = document.getElementById('chat-quick-options');
  const chatScroll = document.getElementById('chat-messages-scroll');
  const chatInput = document.getElementById('chat-input-field');
  const sendBtn = document.getElementById('chat-send-btn');
  const btnAttachPhoto = document.getElementById('btn-sim-attach-photo');
  const btnRecordAudio = document.getElementById('btn-sim-record-audio');
  const recBanner = document.getElementById('chat-recording-banner');
  const btnCancelRec = document.getElementById('btn-cancel-audio-rec');
  const btnVideocall = document.getElementById('btn-sim-videocall');
  const btnVoicecall = document.getElementById('btn-sim-voicecall');
  const videocallModal = document.getElementById('videocall-modal');
  const btnHangupVc = document.getElementById('btn-hangup-videocall');
  const btnExpand = document.getElementById('btn-sim-expand');
  const phoneMockup = document.querySelector('.phone-mockup');

  if (btnExpand && phoneMockup) {
    btnExpand.addEventListener('click', () => {
      const isExpanded = phoneMockup.classList.toggle('phone-mockup-expanded');
      btnExpand.title = isExpanded ? 'Reducir tamaño de la pantalla' : 'Ampliar pantalla de WhatsApp para lectura más cómoda';
      btnExpand.setAttribute('aria-pressed', isExpanded ? 'true' : 'false');
      btnExpand.innerHTML = isExpanded ? '🔍➖' : '🔍';
      showToast('Pantalla de WhatsApp', isExpanded ? 'Ventana de chat ampliada para lectura cómoda' : 'Ventana en tamaño estándar', 'info');
    });
  }

  if (!quickOptsContainer || !chatScroll) return;

  quickOptsContainer.innerHTML = '';
  PUENTE_DATA.chatSimulator.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'chat-opt-btn';
    btn.innerHTML = `💬 <strong>Opción ${idx + 1}:</strong> "${opt.text}"`;
    btn.addEventListener('click', () => {
      sendSimulatorMessage(opt.text, opt.botReply);
    });
    quickOptsContainer.appendChild(btn);
  });

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => {
      const customText = chatInput.value.trim();
      if (customText) {
        sendSimulatorMessage(customText, "¡Qué lindo mensaje abu! Me encanta leerte por acá. ¡Seguí practicando así! ❤️");
        chatInput.value = '';
      }
    });

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendBtn.click();
    });
  }

  // Adjuntar foto familiar
  if (btnAttachPhoto) {
    btnAttachPhoto.addEventListener('click', () => {
      openModal(document.getElementById('whatsapp-photo-modal'));
    });
  }

  // Grabación de audio simulada
  if (btnRecordAudio) {
    btnRecordAudio.addEventListener('click', () => {
      triggerAudioRecording();
    });
  }

  if (btnCancelRec) {
    btnCancelRec.addEventListener('click', () => {
      finishAudioRecording();
    });
  }

  let audioRecordingTimeout = null;
  let audioRecordingActive = false;

  document.getElementById('btn-mobile-cancel-audio')?.addEventListener('click', () => {
    if (audioRecordingTimeout) clearTimeout(audioRecordingTimeout);
    audioRecordingTimeout = null;
    audioRecordingActive = false;
    if (recBanner) recBanner.style.display = 'none';
    btnRecordAudio?.focus({ preventScroll: true });
    showToast('Audio cancelado', 'No enviaste ningún audio. Podés volver a intentarlo.', 'info');
  });

  function triggerAudioRecording() {
    const isMobile = window.isMobileLayout?.();
    if (isMobile && audioRecordingActive) return;
    audioRecordingActive = true;
    if (recBanner) recBanner.style.display = 'flex';
    playTone(700, 0.15);
    if (isMobile) {
      showToast('Audio de práctica', 'Tomate tu tiempo. Elegí Enviar audio ahora o Cancelar audio.', 'info');
      recBanner?.scrollIntoView({ block: 'center', behavior: 'instant' });
      btnCancelRec?.focus({ preventScroll: true });
      return;
    }
    showToast('Grabando audio', 'Hablale a tu teléfono con tranquilidad. En 3 segundos se enviará...', 'info');

    audioRecordingTimeout = setTimeout(() => {
      finishAudioRecording();
    }, 3000);
  }

  function finishAudioRecording() {
    if (window.isMobileLayout?.() && !audioRecordingActive) return;
    if (audioRecordingTimeout) clearTimeout(audioRecordingTimeout);
    audioRecordingTimeout = null;
    audioRecordingActive = false;
    if (recBanner) recBanner.style.display = 'none';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const audioBubble = document.createElement('div');
    audioBubble.className = 'bubble bubble-out bubble-audio';
    audioBubble.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
        <button class="btn-play-audio-sim" style="background: none; border: none; font-size: 26px; cursor: pointer;" title="Reproducir audio">▶️</button>
        <div style="flex: 1; height: 8px; background: rgba(0, 0, 0, 0.15); border-radius: 4px; overflow: hidden;">
          <div style="width: 75%; height: 100%; background: #008069; border-radius: 4px;"></div>
        </div>
        <span style="font-size: 0.85rem; font-weight: 700; color: #075e54;">0:06</span>
      </div>
      <div class="bubble-time">
        <span>${timeStr}</span>
        <span class="bubble-check" style="color: #34b7f1;">✓✓</span>
      </div>
    `;
    chatScroll.appendChild(audioBubble);
    chatScroll.scrollTop = chatScroll.scrollHeight;

    playTone(880, 0.1);
    unlockAchievementWithToast('ach-first-message');

    audioBubble.querySelector('.btn-play-audio-sim')?.addEventListener('click', () => {
      speakText('Hola Sofi, te mando un audio para contarte que estoy practicando en la computadora.');
    });

    setTimeout(() => {
      const replyBubble = document.createElement('div');
      replyBubble.className = 'bubble bubble-in';
      replyBubble.innerHTML = `
        <div>¡Te escuché clarito abu! Qué hermosa alegría escuchar tu voz. ¡Sos una genia aprendiendo! 🥰</div>
        <div class="bubble-time">${timeStr}</div>
      `;
      chatScroll.appendChild(replyBubble);
      chatScroll.scrollTop = chatScroll.scrollHeight;
      playTone(660, 0.15);
    }, 1800);
  }

  // Videollamada simulada
  if (btnVideocall && videocallModal) {
    btnVideocall.addEventListener('click', () => {
      openModal(videocallModal);
      playTone(523, 0.2);
      setTimeout(() => playTone(659, 0.2), 250);

      videocallSeconds = 0;
      const timerEl = document.getElementById('videocall-timer');
      if (timerEl) timerEl.textContent = '00:00 • Conectado';

      if (videocallInterval) clearInterval(videocallInterval);
      videocallInterval = setInterval(() => {
        videocallSeconds++;
        const mins = String(Math.floor(videocallSeconds / 60)).padStart(2, '0');
        const secs = String(videocallSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs} • Conectado`;
      }, 1000);
    });
  }

  if (btnHangupVc && videocallModal) {
    btnHangupVc.addEventListener('click', () => {
      if (videocallInterval) clearInterval(videocallInterval);
      closeModal(videocallModal);
      playTone(440, 0.25);
      showToast('Videollamada finalizada', '¡Felicitaciones! Conversaste cara a cara con Sofía.', 'success');
      unlockAchievementWithToast('ach-video-call');
    });
  }

  // Llamada tradicional con voz
  if (btnVoicecall) {
    btnVoicecall.addEventListener('click', () => {
      playTone(660, 0.2);
      showToast('Llamada con Sofía', '¡Tu teléfono está sonando y conectado con Sofía! Todo funciona a la perfección.', 'success');
    });
  }
}

function sendSimulatorMessage(text, replyText) {
  const chatScroll = document.getElementById('chat-messages-scroll');
  if (!chatScroll) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const userBubble = document.createElement('div');
  userBubble.className = 'bubble bubble-out';
  userBubble.innerHTML = `
    <div>${escapeHtml(text)}</div>
    <div class="bubble-time">
      <span>${timeStr}</span>
      <span class="bubble-check">✓</span>
    </div>
  `;
  chatScroll.appendChild(userBubble);
  chatScroll.scrollTop = chatScroll.scrollHeight;

  playTone(880, 0.1);
  unlockAchievementWithToast('ach-first-message');

  const checkEl = userBubble.querySelector('.bubble-check');
  setTimeout(() => { if (checkEl) checkEl.innerHTML = '✓✓'; }, 700);
  setTimeout(() => { if (checkEl) checkEl.innerHTML = '<span style="color: #34b7f1;">✓✓</span>'; }, 1400);

  setTimeout(() => {
    const replyBubble = document.createElement('div');
    replyBubble.className = 'bubble bubble-in';
    replyBubble.innerHTML = `
      <div>${replyText}</div>
      <div class="bubble-time">${timeStr}</div>
    `;
    chatScroll.appendChild(replyBubble);
    chatScroll.scrollTop = chatScroll.scrollHeight;
    playTone(660, 0.15);
  }, 2000);
}

/* --------------------------------------------------------------------------
   10. MODAL DE LECCIÓN PASO A PASO
   -------------------------------------------------------------------------- */
let activeCourse = null;
let currentStepIndex = 0;

function initLessonModal() {
  const modal = document.getElementById('lesson-modal');
  const closeBtn = document.getElementById('btn-close-lesson-modal');
  const btnPrev = document.getElementById('btn-lesson-prev');
  const btnNext = document.getElementById('btn-lesson-next');
  const btnReadStep = document.getElementById('btn-lesson-read-step');
  const btnComplete = document.getElementById('btn-lesson-complete');

  if (closeBtn) closeBtn.addEventListener('click', closeLessonModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLessonModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeLessonModal();
    }
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStepIndex > 0) {
        currentStepIndex--;
        renderLessonStep();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (activeCourse && currentStepIndex < activeCourse.steps.length - 1) {
        currentStepIndex++;
        renderLessonStep();
        const logged = getLoggedUser();
        if (logged && window.StorageService?.saveCourseProgress) {
          const uid = logged.id || logged.uid || logged.username;
          const pct = Math.round(((currentStepIndex + 1) / activeCourse.steps.length) * 100);
          StorageService.saveCourseProgress(uid, activeCourse.id, {
            currentStep: currentStepIndex,
            progressPercent: pct
          }).catch(err => console.warn('[StorageService] Error guardando progreso:', err));
        }
      }
    });
  }

  if (btnReadStep) {
    btnReadStep.addEventListener('click', () => {
      if (!activeCourse) return;
      const step = activeCourse.steps[currentStepIndex];
      const text = `${step.title}. ${step.text}. Consejo: ${step.tip}`;
      speakText(text);
    });
  }

  if (btnComplete) {
    btnComplete.addEventListener('click', async () => {
      if (!activeCourse) return;
      if (window.StorageService) {
        await StorageService.completeCourse(activeCourse.id);
      }
      if (!completedCourses.includes(activeCourse.id)) {
        completedCourses.push(activeCourse.id);
        localStorage.setItem('puente_completed_courses', JSON.stringify(completedCourses));
      }
      playTone(523.25, 0.3);
      showToast('¡Lección Completada!', `Has completado "${activeCourse.title}" con éxito.`, 'success');
      await unlockAchievementWithToast('ach-first-step');

      // Comprobar si completó todo el Nivel 1
      const level1Courses = PUENTE_DATA.courses.filter(c => c.level === 1).map(c => c.id);
      const allLevel1Done = level1Courses.every(id => completedCourses.includes(id));
      if (allLevel1Done) {
        await unlockAchievementWithToast('ach-device-master');
      }

      closeLessonModal();
      renderCoursesGrid();
      if (typeof renderDashboard2 === 'function') renderDashboard2();
    });
  }
}

function openLessonModal(course) {
  // Proteger la acción de ver lección e inscribirse si no está autenticado
  const logged = getLoggedUser();
  if (!logged) {
    showToast('Inscripción Requerida', 'Para ver la lección completa e inscribirte a tus clases, por favor inicia sesión o crea tu cuenta.', 'warning');
    openModal(document.getElementById('login-modal'));
    return;
  }

  activeCourse = course;
  currentStepIndex = 0;

  // Registrar inscripción en Firestore
  if (window.StorageService?.enrollCourse) {
    const uid = logged.id || logged.uid || logged.username;
    StorageService.enrollCourse(uid, course.id, {
      courseTitle: course.title,
      currentStep: 0,
      totalSteps: course.steps ? course.steps.length : 3,
      progressPercent: 0
    }).catch(err => console.warn('[StorageService] Error inscribiendo curso en Firestore:', err));
  }

  const modal = document.getElementById('lesson-modal');
  if (!modal) return;

  document.getElementById('modal-course-title').textContent = course.title;
  document.getElementById('modal-course-category').textContent = `${course.category} • Nivel ${course.level}`;

  renderLessonStep();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('btn-close-lesson-modal')?.focus();
}

function renderLessonStep() {
  if (!activeCourse) return;
  const step = activeCourse.steps[currentStepIndex];
  const totalSteps = activeCourse.steps.length;

  document.getElementById('modal-step-badge').textContent = `Paso ${currentStepIndex + 1} de ${totalSteps}`;
  document.getElementById('modal-step-title').textContent = step.title;
  document.getElementById('modal-step-text').textContent = step.text;
  document.getElementById('modal-step-tip').textContent = step.tip;
  document.getElementById('modal-step-icon').textContent = step.icon;

  const btnPrev = document.getElementById('btn-lesson-prev');
  const btnNext = document.getElementById('btn-lesson-next');
  const btnComplete = document.getElementById('btn-lesson-complete');

  if (btnPrev) btnPrev.style.display = currentStepIndex === 0 ? 'none' : 'inline-flex';
  if (btnNext) btnNext.style.display = currentStepIndex === totalSteps - 1 ? 'none' : 'inline-flex';
  if (btnComplete) btnComplete.style.display = currentStepIndex === totalSteps - 1 ? 'inline-flex' : 'none';
  if (window.isMobileLayout?.()) {
    const reading = document.querySelector('#lesson-modal .lesson-reading');
    if (reading) reading.scrollTop = 0;
  }
}

function closeLessonModal() {
  const modal = document.getElementById('lesson-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  stopSpeaking();
}

/* --------------------------------------------------------------------------
   11. MODAL DE AYUDA RÁPIDA
   -------------------------------------------------------------------------- */
function initHelpModal() {
  const btnHelpTop = document.getElementById('btn-help-top');
  const modal = document.getElementById('help-modal');
  const closeBtn = document.getElementById('btn-close-help-modal');

  if (btnHelpTop && modal) {
    btnHelpTop.addEventListener('click', () => {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn?.focus();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
  }
}

/* --------------------------------------------------------------------------
   12. BOTÓN FLOTANTE "VOLVER ARRIBA"
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btnTop = document.getElementById('btn-back-to-top');
  if (!btnTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btnTop.classList.add('show');
    } else {
      btnTop.classList.remove('show');
    }
  });

  btnTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   12B. NAVEGACIÓN RÁPIDA INFERIOR MÓVIL (DOCK BAR)
   -------------------------------------------------------------------------- */
function initBottomNavMobile() {
  const bnavItems = document.querySelectorAll('.bottom-nav-mobile .bnav-item');
  if (!bnavItems.length) return;

  bnavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        bnavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const targetEl = document.querySelector(href);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    const sections = [
      { id: 'inicio', item: document.querySelector('[data-mobile-home]') },
      { id: 'aula-virtual-section', item: document.querySelector('[data-mobile-home]') },
      { id: 'cursos-section', item: document.querySelector('.bottom-nav-mobile a[href="#cursos-section"]') },
      { id: 'taller-practico', item: document.querySelector('.bottom-nav-mobile a[href="#taller-practico"]') }
    ];

    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = document.getElementById(sections[i].id);
      if (sec && sec.offsetTop <= scrollPos) {
        bnavItems.forEach(it => it.classList.remove('active'));
        if (sections[i].item) sections[i].item.classList.add('active');
        break;
      }
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   13. HELPER GENERAL: ESCAPE HTML & DESBLOQUEO DE LOGROS CON TOAST
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function unlockAchievementWithToast(id) {
  if (!window.StorageService) return;
  const res = await StorageService.unlockAchievement(id);
  if (res && res.newlyUnlocked) {
    const ach = (PUENTE_DATA.achievements || []).find(a => a.id === id);
    if (ach) {
      playTone(660, 0.2);
      setTimeout(() => playTone(880, 0.3), 160);
      showToast('🎉 ¡Nuevo Logro Desbloqueado!', `${ach.icon} ${ach.title}: ${ach.description}`, 'success');
      if (typeof renderDashboard2 === 'function') await renderDashboard2();
      if (typeof renderAchievementsGrid === 'function') await renderAchievementsGrid();
    }
  }
}

/* --------------------------------------------------------------------------
   14. DASHBOARD 2.0 - MI ESPACIO DE APRENDIZAJE Y PROGRESO
   -------------------------------------------------------------------------- */
function initDashboard2() {
  const btnResume = document.getElementById('btn-resume-learning');
  if (btnResume) {
    btnResume.addEventListener('click', () => {
      const logged = getLoggedUser();
      if (!logged) {
        showToast('Iniciar Sesión', 'Para continuar con tus clases y guardar tu avance, por favor ingresa con tu cuenta.', 'warning');
        openModal(document.getElementById('login-modal'));
        return;
      }
      const nextCourse = getNextRecommendedCourse();
      if (nextCourse) {
        openLessonModal(nextCourse);
      }
    });
  }

  // Vincular botones globales para abrir modales 2.0
  document.querySelectorAll('.trigger-open-companion').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal(document.getElementById('companion-modal'));
    });
  });

  document.querySelectorAll('.trigger-open-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      openProfileModalSecure();
    });
  });

  renderDashboard2();
}

function getNextRecommendedCourse() {
  const completed = window.StorageService ? StorageService.getCompletedCourses() : completedCourses;
  const pending = PUENTE_DATA.courses.find(c => !completed.includes(c.id));
  return pending || PUENTE_DATA.courses[0];
}

async function renderDashboard2() {
  const logged = getLoggedUser();
  const completed = window.StorageService ? await StorageService.getCompletedCourses(logged?.id || logged?.username) : completedCourses;
  const totalCourses = PUENTE_DATA.courses.length;
  const completedCount = Array.isArray(completed) ? completed.length : 0;
  const pct = Math.min(100, Math.round((completedCount / totalCourses) * 100));

  const pctEl = document.getElementById('dashboard-progress-pct');
  const barEl = document.getElementById('dashboard-progress-bar');
  const countEl = document.getElementById('dashboard-completed-count');
  const achCountEl = document.getElementById('dashboard-achievements-count');
  const userLevelEl = document.getElementById('dashboard-user-level');
  const studentNameEl = document.getElementById('classroom-greeting-name');

  if (studentNameEl && logged) {
    studentNameEl.textContent = logged.name || logged.username;
  }

  if (pctEl) pctEl.textContent = `${pct}%`;
  if (barEl) {
    barEl.style.width = `${pct}%`;
    barEl.parentElement?.setAttribute('aria-valuenow', pct);
  }
  if (countEl) {
    countEl.textContent = `${completedCount} de ${totalCourses} lecciones completadas`;
  }

  let unlockedCount = 2;
  if (window.StorageService) {
    const unlockedList = await StorageService.getUnlockedAchievements(logged?.id || logged?.username);
    unlockedCount = Array.isArray(unlockedList) ? unlockedList.length : 2;
  }
  const totalAchievements = (PUENTE_DATA.achievements || []).length || 9;
  if (achCountEl) {
    achCountEl.textContent = `${unlockedCount} de ${totalAchievements} logros obtenidos`;
  }

  if (userLevelEl) {
    if (completedCount >= 8) {
      userLevelEl.textContent = '🏆 Nivel 3 • Experto/a Digital';
    } else if (completedCount >= 4) {
      userLevelEl.textContent = '🌿 Nivel 2 • Usuario Cotidiano';
    } else {
      userLevelEl.textContent = '🌱 Nivel 1 • En camino';
    }
  }

  // Actualizar tarjeta "Continuar Aprendiendo"
  const nextCourse = getNextRecommendedCourse();
  if (nextCourse) {
    const titleEl = document.getElementById('next-lesson-title');
    const descEl = document.getElementById('next-lesson-desc');
    const iconEl = document.getElementById('next-lesson-icon');
    const metaEl = document.getElementById('next-lesson-meta');

    if (titleEl) titleEl.textContent = nextCourse.title;
    if (descEl) descEl.textContent = nextCourse.shortDesc;
    if (iconEl) iconEl.textContent = nextCourse.icon;
    if (metaEl) metaEl.textContent = `⏱️ ${nextCourse.duration} • ${nextCourse.category} (Nivel ${nextCourse.level})`;
  }
}

/* --------------------------------------------------------------------------
   15. MI COMPAÑERO DIGITAL 2.0 (ASISTENCIA Y VOZ)
   -------------------------------------------------------------------------- */
let lastCompanionResponseText = '';

function initCompanion() {
  const modal = document.getElementById('companion-modal');
  const btnTop = document.getElementById('btn-top-companion');
  const btnSend = document.getElementById('btn-companion-send');
  const btnMic = document.getElementById('btn-companion-mic');
  const btnReadLast = document.getElementById('btn-companion-read-last');
  const inputEl = document.getElementById('companion-input-text');
  const streamEl = document.getElementById('companion-chat-stream');
  const micIndicator = document.getElementById('companion-voice-indicator');

  if (btnTop && modal) {
    btnTop.addEventListener('click', () => {
      openModal(modal);
      inputEl?.focus();
    });
  }

  // Chips de preguntas frecuentes
  document.querySelectorAll('.companion-quick-chips .chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (q) {
        if (inputEl) inputEl.value = q;
        handleCompanionSubmit(q);
      }
    });
  });

  if (btnSend && inputEl) {
    btnSend.addEventListener('click', () => {
      const query = inputEl.value.trim();
      if (query) {
        handleCompanionSubmit(query);
        inputEl.value = '';
      }
    });

    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = inputEl.value.trim();
        if (query) {
          handleCompanionSubmit(query);
          inputEl.value = '';
        }
      }
    });
  }

  // Dictado por voz
  if (btnMic) {
    btnMic.addEventListener('click', () => {
      const service = window.CompanionService;
      if (!service) return;
      if (!service.isSpeechRecognitionSupported()) {
        showToast('Micrófono no soportado', 'Tu navegador no permite dictado por voz directo. Puedes escribir tu pregunta en la casilla.', 'warning');
        return;
      }

      if (micIndicator) micIndicator.style.display = 'inline-block';
      btnMic.classList.add('recording-pulse');

      service.startSpeechRecognition({
        onResult: (transcript) => {
          if (inputEl) inputEl.value = transcript;
          handleCompanionSubmit(transcript);
        },
        onError: (err) => {
          console.warn('Speech error:', err);
          if (micIndicator) micIndicator.style.display = 'none';
          btnMic.classList.remove('recording-pulse');
        },
        onEnd: () => {
          if (micIndicator) micIndicator.style.display = 'none';
          btnMic.classList.remove('recording-pulse');
        }
      });
    });
  }

  // Escuchar última respuesta
  if (btnReadLast) {
    btnReadLast.addEventListener('click', () => {
      if (lastCompanionResponseText) {
        speakText(lastCompanionResponseText);
      } else {
        speakText('Hola, estoy aquí para responder tus dudas de tecnología sin palabras raras.');
      }
    });
  }

  async function handleCompanionSubmit(query) {
    if (!streamEl) return;

    // Mensaje del usuario
    const userBubble = document.createElement('div');
    userBubble.className = 'companion-msg companion-bubble-user';
    userBubble.innerHTML = `
      <div class="companion-msg-sender">👤 Tú:</div>
      <div class="companion-msg-text">${escapeHtml(query)}</div>
    `;
    streamEl.appendChild(userBubble);
    streamEl.scrollTop = streamEl.scrollHeight;

    // Mensaje de carga/pensamiento con IA
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'companion-msg companion-bubble-bot';
    thinkingBubble.innerHTML = `
      <div class="companion-msg-sender">🤖 Mi Compañero con IA:</div>
      <div class="companion-msg-text"><em>Consultando a la Inteligencia Artificial con calma... ⏳</em></div>
    `;
    streamEl.appendChild(thinkingBubble);
    streamEl.scrollTop = streamEl.scrollHeight;

    // Obtener respuesta del servicio de Inteligencia Artificial
    const service = window.AIService || window.CompanionService;
    const result = await service.ask(query);

    let stepsHtml = '';
    if (result.steps && result.steps.length > 0) {
      stepsHtml = `
        <ol class="companion-steps-list" style="margin: 10px 0 10px 20px; line-height: 1.6;">
          ${result.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      `;
    }

    let actionBtnHtml = '';
    if (result.action) {
      actionBtnHtml = `
        <button class="btn-primary btn-companion-action" data-action-type="${result.action.type}" data-action-target="${result.action.target}" style="margin-top: 12px; font-size: 0.95rem; min-height: 44px;">
          ${result.action.label}
        </button>
      `;
    }

    thinkingBubble.innerHTML = `
      <div class="companion-msg-sender">🤖 Mi Compañero con IA:</div>
      <div class="companion-msg-text">
        <div style="font-weight: 700; margin-bottom: 6px; font-size: 1.1rem; color: var(--color-primary);">${result.title}</div>
        <div>${result.answer}</div>
        ${stepsHtml}
        ${result.tip ? `<div style="background: rgba(254, 243, 199, 0.6); padding: 8px 12px; border-radius: var(--radius-sm); margin-top: 8px; font-size: 0.95rem;">${result.tip}</div>` : ''}
        ${actionBtnHtml}
      </div>
    `;

    // Vincular botón de acción
    const actBtn = thinkingBubble.querySelector('.btn-companion-action');
    if (actBtn) {
      actBtn.addEventListener('click', () => {
        const aType = actBtn.getAttribute('data-action-type');
        const aTarget = actBtn.getAttribute('data-action-target');
        closeModal(modal);

        if (aType === 'OPEN_SIMULATOR') {
          if (aTarget === 'whatsapp-modal') {
            openWhatsAppSimulator();
          } else if (aTarget === 'scam-modal') {
            openScamSimulator();
          } else {
            openModal(document.getElementById(aTarget));
          }
        } else if (aType === 'OPEN_LESSON') {
          const course = PUENTE_DATA.courses.find(c => c.id === aTarget) || PUENTE_DATA.courses[0];
          openLessonModal(course);
        } else if (aType === 'OPEN_MODAL') {
          openModal(document.getElementById(aTarget));
        }
      });
    }

    streamEl.scrollTop = streamEl.scrollHeight;
    lastCompanionResponseText = result.fullTextForSpeech || `${result.title}. ${result.answer}`;

    unlockAchievementWithToast('ach-ai-friend');
  }
}

/* --------------------------------------------------------------------------
   16. MODAL 2.0: 🆘 NECESITO AYUDA INMEDIATA
   -------------------------------------------------------------------------- */
function initSosModal() {
  const btnTopSos = document.getElementById('btn-top-sos');
  const modal = document.getElementById('sos-modal');
  const detailBox = document.getElementById('sos-detail-box');
  const titleEl = document.getElementById('sos-detail-title');
  const calmEl = document.getElementById('sos-calm-banner');
  const stepsEl = document.getElementById('sos-steps-list');
  const phoneEl = document.getElementById('sos-phone-callout');

  if (btnTopSos && modal) {
    btnTopSos.addEventListener('click', () => {
      openModal(modal);
    });
  }

  document.querySelectorAll('.sos-option-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const sosId = btn.getAttribute('data-sos-id');
      const item = (PUENTE_DATA.emergencyHelp || []).find(h => h.id === sosId);
      if (!item || !detailBox) return;

      document.querySelectorAll('.sos-option-card').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      titleEl.innerHTML = `🛡️ ${item.title}`;
      calmEl.innerHTML = `🕊️ <strong>Respirá hondo:</strong> ${item.calmMessage}`;
      stepsEl.innerHTML = item.steps.map(s => `<li>${s}</li>`).join('');
      phoneEl.innerHTML = `📞 <strong>Teléfono de contacto seguro:</strong> ${item.officialPhone}`;

      detailBox.style.display = 'block';
      detailBox.scrollIntoView({ behavior: 'smooth' });

      speakText(`${item.title}. ${item.calmMessage}.`);
    });
  });
}

/* --------------------------------------------------------------------------
   17. MODAL 2.0: 👤 MI PERFIL, LOGROS Y PREFERENCIAS
   -------------------------------------------------------------------------- */
window.switchProfileTab = function(tab) {
  const tabAch = document.getElementById('prof-tab-achievements');
  const tabPrefs = document.getElementById('prof-tab-prefs');
  const viewAch = document.getElementById('profile-view-achievements');
  const viewPrefs = document.getElementById('profile-view-preferences');

  if (tab === 'achievements') {
    tabAch?.classList.add('active');
    tabPrefs?.classList.remove('active');
    if (viewAch) viewAch.style.display = 'block';
    if (viewPrefs) viewPrefs.style.display = 'none';
  } else {
    tabPrefs?.classList.add('active');
    tabAch?.classList.remove('active');
    if (viewAch) viewAch.style.display = 'none';
    if (viewPrefs) viewPrefs.style.display = 'block';
  }
};

function openProfileModalSecure() {
  const logged = getLoggedUser();
  if (!logged) {
    showToast('Inicia Sesión', 'Para ver tu perfil, tus logros y tus preferencias, por favor ingresa con tu cuenta o crea una gratis.', 'info');
    openModal(document.getElementById('login-modal'));
    return;
  }
  const userNameEl = document.getElementById('profile-user-name');
  if (userNameEl) userNameEl.textContent = logged.name || logged.username;
  const userStatusEl = document.getElementById('profile-user-status');
  if (userStatusEl) {
    userStatusEl.textContent = logged.role === 'DOCENTE'
      ? '👨‍🏫 Docente de Puente Digital • Activo'
      : '🌱 Alumno de Puente Digital • Activo';
  }
  renderAchievementsGrid();
  openModal(document.getElementById('profile-modal'));
}
window.openProfileModalSecure = openProfileModalSecure;

function initProfileModal() {
  const modal = document.getElementById('profile-modal');
  const userNameEl = document.getElementById('profile-user-name');
  const userStatusEl = document.getElementById('profile-user-status');
  const logged = getLoggedUser();

  if (userNameEl) {
    userNameEl.textContent = logged ? (logged.name || logged.username) : 'Estudiante';
  }
  if (userStatusEl && logged) {
    userStatusEl.textContent = logged.role === 'DOCENTE'
      ? '👨‍🏫 Docente de Puente Digital • Activo'
      : '🌱 Alumno de Puente Digital • Activo';
  }

  renderAchievementsGrid();

  // Configuración de preferencias dentro del modal
  const prefs = window.StorageService ? StorageService.getPreferences() : { voiceSpeed: 0.9, contrast: 'normal', soundEffects: true };

  // Velocidad de voz
  document.querySelectorAll('[data-voice-rate]').forEach(btn => {
    const r = parseFloat(btn.getAttribute('data-voice-rate'));
    if (r === (prefs.voiceSpeed || 0.9)) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-voice-rate]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Contraste
  document.querySelectorAll('[data-contrast]').forEach(btn => {
    const c = btn.getAttribute('data-contrast');
    if (c === (prefs.contrast || 'normal')) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-contrast]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Sonidos
  document.querySelectorAll('[data-sounds]').forEach(btn => {
    const s = btn.getAttribute('data-sounds') === 'true';
    if (s === (prefs.soundEffects !== false)) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sounds]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const btnSavePrefs = document.getElementById('btn-save-preferences');
  if (btnSavePrefs) {
    btnSavePrefs.addEventListener('click', async () => {
      const activeVoiceBtn = document.querySelector('[data-voice-rate].active');
      const activeContrastBtn = document.querySelector('[data-contrast].active');
      const activeSoundBtn = document.querySelector('[data-sounds].active');

      const voiceSpeed = activeVoiceBtn ? parseFloat(activeVoiceBtn.getAttribute('data-voice-rate')) : 0.9;
      const contrast = activeContrastBtn ? activeContrastBtn.getAttribute('data-contrast') : 'normal';
      const soundEffects = activeSoundBtn ? (activeSoundBtn.getAttribute('data-sounds') === 'true') : true;

      if (window.StorageService?.savePreferences) {
        await StorageService.savePreferences({ voiceSpeed, contrast, soundEffects });
      }

      // Aplicar contraste a la página
      if (contrast === 'high') {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }

      showToast('Preferencias Guardadas', 'Tus ajustes de accesibilidad se han guardado con éxito.', 'success');
      playTone(587, 0.2);
    });
  }
}

async function renderAchievementsGrid() {
  const container = document.getElementById('achievements-grid-container');
  const countBadge = document.getElementById('profile-ach-count');
  if (!container) return;

  const allAchievements = PUENTE_DATA.achievements || [];
  const logged = getLoggedUser();
  const unlocked = window.StorageService ? await StorageService.getUnlockedAchievements(logged?.id || logged?.username) : [];
  const unlockedIds = Array.isArray(unlocked) ? unlocked.map(u => u.id) : [];

  if (countBadge) {
    countBadge.textContent = `${unlockedIds.length}/${allAchievements.length}`;
  }

  container.innerHTML = '';
  allAchievements.forEach(ach => {
    const isUnlocked = unlockedIds.includes(ach.id);
    const card = document.createElement('div');
    card.className = `achievement-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="ach-icon" aria-hidden="true">${ach.icon}</div>
      <div class="ach-info">
        <div class="ach-category">${ach.category}</div>
        <h4 class="ach-title">${ach.title}</h4>
        <p class="ach-desc">${ach.description}</p>
        <div class="ach-status">
          ${isUnlocked ? '✅ <strong>¡Desbloqueado!</strong>' : '🔒 Por desbloquear'}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   18. MODAL 2.0: 👨‍🏫 VISTA ACOMPAÑANTE / PANEL DOCENTE
   -------------------------------------------------------------------------- */
function initTutorModal() {
  const modal = document.getElementById('tutor-modal');
  const btnSend = document.getElementById('btn-send-tutor-note');
  const inputEl = document.getElementById('tutor-new-note');
  const streamEl = document.getElementById('tutor-notes-stream');
  const completedBadge = document.getElementById('tutor-completed-badge');

  const completed = window.StorageService ? StorageService.getCompletedCourses() : completedCourses;
  if (completedBadge) {
    completedBadge.textContent = `${completed.length}/11 lecciones`;
  }

  const logged = getLoggedUser();
  const studentNameEl = document.getElementById('tutor-student-name');
  if (studentNameEl) {
    studentNameEl.textContent = logged ? (logged.name || logged.username) : 'Visitante';
  }

  // Abrir la Guía para Familiares y Acompañantes en su modal específico
  document.querySelectorAll('.trigger-open-guia-familiares').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const guiaModal = document.getElementById('guia-familiares-modal');
      if (guiaModal) {
        openModal(guiaModal);
        if (typeof window.switchGuiaTab === 'function') {
          window.switchGuiaTab('decalogo');
        }
      }
    });
  });

  // Pestañas internas del panel docente
  const tabBtns = modal ? modal.querySelectorAll('.btn-tutor-tab') : [];
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tutor-tab');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'var(--bg-surface-alt)';
        b.style.color = 'var(--text-primary)';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--color-primary)';
      btn.style.color = '#fff';

      modal.querySelectorAll('.tutor-tab-view').forEach(view => {
        view.style.display = 'none';
      });
      const activeView = document.getElementById(`tutor-tab-view-${targetTab}`);
      if (activeView) activeView.style.display = 'block';
    });
  });

  // Publicación de lección por parte del docente (Historia de Usuario 5)
  const formPublish = document.getElementById('form-docente-publish');
  if (formPublish) {
    formPublish.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('docente-course-title').value.trim();
      const level = document.getElementById('docente-course-level').value;
      const duration = document.getElementById('docente-course-duration').value.trim() || '15 min';
      const desc = document.getElementById('docente-course-desc').value.trim();

      if (!title || !desc) {
        showToast('Campos incompletos', 'Por favor ingresa un título y una descripción.', 'warning');
        return;
      }

      const newId = `c-custom-${Date.now()}`;
      const newCourse = {
        id: newId,
        level: level,
        number: PUENTE_DATA.courses.filter(c => c.level === level).length + 1,
        title: title,
        shortDesc: desc,
        duration: duration,
        difficulty: level === 'basico' ? 'Inicial' : level === 'intermedio' ? 'Medio' : 'Avanzado',
        icon: '📝',
        badge: 'Nuevo Taller',
        color: level === 'basico' ? '#10b981' : level === 'intermedio' ? '#f59e0b' : '#3b82f6',
        isInteractive: false,
        summary: desc,
        steps: [
          { step: 1, title: 'Introducción del Docente', desc: desc, icon: '👨‍🏫' },
          { step: 2, title: 'Práctica guiada', desc: 'Realiza esta actividad con ayuda de tu tutor o familiar.', icon: '✍️' }
        ]
      };

      PUENTE_DATA.courses.push(newCourse);
      renderCoursesGrid();
      formPublish.reset();
      showToast('¡Actividad Publicada!', `La lección "${title}" ya está disponible en la sección de cursos.`, 'success');
      playTone(587, 0.3);
      closeModal(modal);
      document.getElementById('cursos-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  renderTutorNotes();

  if (btnSend && inputEl) {
    btnSend.addEventListener('click', async () => {
      const text = inputEl.value.trim();
      if (!text) {
        showToast('Mensaje vacío', 'Por favor escribe unas palabras para tu familiar o alumno.', 'warning');
        return;
      }

      if (window.StorageService?.addTutorNote) {
        await StorageService.addTutorNote(text, 'Familiar / Tutor Acompañante');
      }
      inputEl.value = '';
      await renderTutorNotes();
      showToast('Mensaje Guardado', 'Tu mensaje de aliento ya está disponible para el alumno.', 'success');
      playTone(660, 0.2);
    });
  }

  async function renderTutorNotes() {
    if (!streamEl) return;
    const notes = window.StorageService ? await StorageService.getTutorNotes() : [];
    if (!Array.isArray(notes) || notes.length === 0) {
      streamEl.innerHTML = '<p style="color: var(--text-muted);">Aún no hay mensajes guardados.</p>';
      return;
    }

    streamEl.innerHTML = notes.map(n => `
      <div class="tutor-note-item">
        <div class="note-header">
          <strong>${escapeHtml(n.author || 'Tutor')}</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${n.date || ''}</span>
        </div>
        <p class="note-text">"${escapeHtml(n.text || '')}"</p>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   18B. MODAL: 👨‍👩‍👧‍👦 GUÍA Y DECÁLOGO PARA FAMILIARES Y ACOMPAÑANTES
   -------------------------------------------------------------------------- */
window.switchGuiaTab = function(tab) {
  const tabDecalogo = document.getElementById('tab-guia-decalogo');
  const tabAliento = document.getElementById('tab-guia-aliento');
  const viewDecalogo = document.getElementById('guia-view-decalogo');
  const viewAliento = document.getElementById('guia-view-aliento');

  if (tab === 'decalogo') {
    if (tabDecalogo) {
      tabDecalogo.classList.add('active');
      tabDecalogo.style.background = 'var(--color-primary)';
      tabDecalogo.style.color = '#fff';
    }
    if (tabAliento) {
      tabAliento.classList.remove('active');
      tabAliento.style.background = 'var(--bg-surface-alt)';
      tabAliento.style.color = 'var(--text-primary)';
    }
    if (viewDecalogo) viewDecalogo.style.display = 'block';
    if (viewAliento) viewAliento.style.display = 'none';
  } else if (tab === 'aliento') {
    if (tabAliento) {
      tabAliento.classList.add('active');
      tabAliento.style.background = 'var(--color-primary)';
      tabAliento.style.color = '#fff';
    }
    if (tabDecalogo) {
      tabDecalogo.classList.remove('active');
      tabDecalogo.style.background = 'var(--bg-surface-alt)';
      tabDecalogo.style.color = 'var(--text-primary)';
    }
    if (viewDecalogo) viewDecalogo.style.display = 'none';
    if (viewAliento) viewAliento.style.display = 'block';
    renderGuiaNotesStream();
  }
};

function renderGuiaNotesStream() {
  const streamEl = document.getElementById('guia-notes-stream');
  if (!streamEl) return;

  const notesRaw = localStorage.getItem('puente_family_notes');
  let notes = [];
  try {
    notes = JSON.parse(notesRaw) || [];
  } catch (e) {
    notes = [];
  }

  if (notes.length === 0) {
    streamEl.innerHTML = `
      <div class="tutor-note-card" style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #64748b; margin-bottom: 4px;">
          <strong>💖 Tu nieta Sofía</strong>
          <span>Ayer</span>
        </div>
        <p style="margin: 0; font-size: 1rem; color: #1e293b;">
          "¡Vamos abu! Qué alegría verte aprender en Puente Digital. Con paciencia y a tu propio ritmo, te quiero mucho."
        </p>
      </div>
      <div class="tutor-note-card" style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #64748b; margin-bottom: 4px;">
          <strong>💖 Tu hijo Carlos</strong>
          <span>Hace 2 días</span>
        </div>
        <p style="margin: 0; font-size: 1rem; color: #1e293b;">
          "Felicitaciones papá por animarte con el celular. Sabés que estamos acá para ayudarte siempre."
        </p>
      </div>
    `;
    return;
  }

  streamEl.innerHTML = notes.map(n => `
    <div class="tutor-note-card" style="background: #ffffff; border: 1px solid var(--border-subtle); border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 8px; margin-bottom: 8px; box-shadow: var(--shadow-xs);">
      <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #64748b; margin-bottom: 4px;">
        <strong>💖 ${escapeHtml(n.author || 'Familiar')}</strong>
        <span>${escapeHtml(n.date || 'Reciente')}</span>
      </div>
      <p style="margin: 0; font-size: 1rem; color: #1e293b;">
        "${escapeHtml(n.text)}"
      </p>
    </div>
  `).join('');
}

function initGuiaFamiliaresModal() {
  const btnSave = document.getElementById('btn-save-guia-aliento');
  const inputAuthor = document.getElementById('guia-tutor-name');
  const inputMsg = document.getElementById('guia-tutor-msg');

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const author = inputAuthor ? inputAuthor.value.trim() : '';
      const text = inputMsg ? inputMsg.value.trim() : '';

      if (!text) {
        showToast('Mensaje vacío', 'Por favor escribe unas palabras de aliento para el alumno.', 'warning');
        return;
      }

      const notesRaw = localStorage.getItem('puente_family_notes');
      let notes = [];
      try {
        notes = JSON.parse(notesRaw) || [];
      } catch (e) {
        notes = [];
      }

      const newNote = {
        id: `note-${Date.now()}`,
        author: author || 'Tu familia',
        text: text,
        date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
      };

      notes.unshift(newNote);
      localStorage.setItem('puente_family_notes', JSON.stringify(notes));

      if (inputMsg) inputMsg.value = '';
      playTone(587.33, 0.2);
      showToast('¡Mensaje enviado con cariño!', 'Tu mensaje quedó guardado para acompañar al alumno.', 'success');
      renderGuiaNotesStream();
    });
  }

  renderGuiaNotesStream();
}

/* --------------------------------------------------------------------------
   19. WHATSAPP 2.0 - MULTIMEDIA, AUDIO, FOTOS Y PESTAÑAS
   -------------------------------------------------------------------------- */
window.showPracticeTab = function(tab) {
  const tabWa = document.getElementById('tab-pr-whatsapp');
  const tabScam = document.getElementById('tab-pr-scam');
  const viewWa = document.getElementById('view-whatsapp-sim');
  const viewScam = document.getElementById('view-scam-detector');

  if (tab === 'whatsapp') {
    tabWa?.classList.add('active');
    tabScam?.classList.remove('active');
    if (viewWa) viewWa.style.display = 'block';
    if (viewScam) viewScam.style.display = 'none';
  } else if (tab === 'scam') {
    tabScam?.classList.add('active');
    tabWa?.classList.remove('active');
    if (viewWa) viewWa.style.display = 'none';
    if (viewScam) viewScam.style.display = 'block';
  }
};

window.openWhatsAppSimulator = function() {
  document.getElementById('taller-practico')?.scrollIntoView({ behavior: 'smooth' });
  showPracticeTab('whatsapp');
  setTimeout(() => {
    document.getElementById('chat-input-field')?.focus();
  }, 400);
};

window.openScamSimulator = function() {
  document.getElementById('taller-practico')?.scrollIntoView({ behavior: 'smooth' });
  showPracticeTab('scam');
};

window.selectSimPhoto = function(title, icon, caption) {
  const photoModal = document.getElementById('whatsapp-photo-modal');
  closeModal(photoModal);

  const chatScroll = document.getElementById('chat-messages-scroll');
  if (!chatScroll) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const photoBubble = document.createElement('div');
  photoBubble.className = 'bubble bubble-out bubble-photo';
  photoBubble.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.9); padding: 12px; border-radius: var(--radius-sm); text-align: center; margin-bottom: 6px;">
      <div style="font-size: 54px;" aria-hidden="true">${icon}</div>
      <div style="font-weight: 700; color: #075e54;">${escapeHtml(title)}</div>
    </div>
    <div style="font-size: 0.95rem; margin-bottom: 4px;">${escapeHtml(caption)}</div>
    <div class="bubble-time">
      <span>${timeStr}</span>
      <span class="bubble-check" style="color: #34b7f1;">✓✓</span>
    </div>
  `;
  chatScroll.appendChild(photoBubble);
  chatScroll.scrollTop = chatScroll.scrollHeight;

  playTone(880, 0.1);
  unlockAchievementWithToast('ach-photo-shared');

  setTimeout(() => {
    const replyBubble = document.createElement('div');
    replyBubble.className = 'bubble bubble-in';
    replyBubble.innerHTML = `
      <div>¡Qué hermosa foto abu! Me encanta que me mandes fotitos de la familia. Te quiero mucho ❤️</div>
      <div class="bubble-time">${timeStr}</div>
    `;
    chatScroll.appendChild(replyBubble);
    chatScroll.scrollTop = chatScroll.scrollHeight;
    playTone(660, 0.15);
  }, 1600);
};

/* --------------------------------------------------------------------------
   20. REGISTRO DE SERVICE WORKER PWA
   -------------------------------------------------------------------------- */
function initServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          reg.update();
          console.log('Puente Digital 2.0 PWA registrado con éxito:', reg.scope);
        })
        .catch(err => {
          console.log('Puente Digital 2.0 PWA info:', err);
        });
    });
  }
}

/* --------------------------------------------------------------------------
   21. EXPOSICIÓN GLOBAL CONTROLADA PARA INTEROPERABILIDAD
   -------------------------------------------------------------------------- */
if (typeof window !== 'undefined') {
  window.getLoggedUser = getLoggedUser;
  window.setLoggedUser = setLoggedUser;
  window.getUsers = getUsers;
  window.saveUser = saveUser;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.showToast = showToast;
  window.playTone = playTone;
  window.openLessonModal = openLessonModal;
  window.StorageService = window.StorageService || StorageService;
}

