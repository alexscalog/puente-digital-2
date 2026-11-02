/**
 * Puente Digital 2.0 - Capa de Persistencia Híbrida (StorageService)
 * 
 * Arquitectura Híbrida Offline-First / PWA:
 * 1. Persistencia local inmediata en localStorage (garantiza funcionamiento sin conexión y latencia cero).
 * 2. Sincronización asíncrona con Cloud Firestore en la subcolección `users/{userId}/progress`.
 * 3. Aislamiento de fallos con bloques try/catch resilientes: ante caídas de red o falta de credenciales,
 *    el sistema continúa operando transparentemente con el almacenamiento local.
 * 4. Mantiene idénticos nombres y firmas de métodos públicos para compatibilidad 100% con js/app.js.
 */

import { db } from './firebase-config.js';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-lite.js";

const StorageService = (() => {
  // ============================================================================
  // CONSTANTES Y CLAVES DE PERSISTENCIA LOCAL (OFFLINE FIRST / PWA)
  // ============================================================================
  const KEYS = {
    USERS: 'puente_users',
    LOGGED_USER: 'puente_logged_user',
    COMPLETED_COURSES: 'puente_completed_courses',
    ENROLLMENTS: 'puente_enrollments',
    ACHIEVEMENTS: 'puente_achievements',
    PREFERENCES: 'puente_preferences',
    CERTIFICATES: 'puente_certificates',
    TUTOR_NOTES: 'puente_tutor_notes'
  };

  const DEFAULT_USERS = [
    { id: 'profesor', username: 'profesor', password: 'profesor', name: 'Prof. Alejandro', role: 'DOCENTE', joinedDate: '2026-03-01' },
    { id: 'docente', username: 'docente', password: 'docente', name: 'Prof. Alejandro', role: 'DOCENTE', joinedDate: '2026-03-01' },
    { id: 'marte', username: 'marte', password: 'marte', name: 'Marte', role: 'ALUMNO', joinedDate: '2026-03-01' },
    { id: 'marta', username: 'marta', password: 'marta', name: 'Marta', role: 'ALUMNO', joinedDate: '2026-03-01' },
    { id: 'pedro', username: 'pedro', password: 'pedro', name: 'Pedro', role: 'ALUMNO', joinedDate: '2026-03-01' },
    { id: 'felipe', username: 'felipe', password: 'felipe', name: 'Felipe', role: 'ALUMNO', joinedDate: '2026-03-01' },
    { id: 'rony', username: 'RONY', password: 'RONY', name: 'Rony', role: 'ALUMNO', joinedDate: '2026-03-01' }
  ];

  const DEFAULT_PREFERENCES = {
    fontScale: '1',
    contrast: 'normal',
    voiceSpeed: 0.9,
    soundEffects: true,
    reducedMotion: false,
    buttonSize: 'large'
  };

  // ============================================================================
  // HELPERS DE ACCESO SEGURO A LOCALSTORAGE
  // ============================================================================
  function localGet(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn(`[StorageService:localGet] Error al leer "${key}":`, e);
      return defaultValue;
    }
  }

  function localSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[StorageService:localSet] Error al guardar "${key}":`, e);
    }
  }

  /**
   * Resuelve el identificador del usuario activo, ya sea explícito o desde la sesión activa
   */
  function resolveActiveUserId(passedUserId) {
    if (passedUserId && typeof passedUserId === 'string' && passedUserId.trim()) {
      return passedUserId.trim().toLowerCase();
    }
    const logged = getLoggedUser();
    if (logged) {
      if (logged.id) return String(logged.id).trim().toLowerCase();
      if (logged.uid) return String(logged.uid).trim().toLowerCase();
      if (logged.username) return String(logged.username).trim().toLowerCase();
    }
    return null;
  }

  /**
   * Verifica si Firestore está disponible en el entorno y conectado
   */
  function isFirestoreAvailable() {
    return Boolean(
      db &&
      navigator.onLine &&
      typeof doc === 'function' &&
      (!window.FirebaseConfig || window.FirebaseConfig.isConfigured !== false)
    );
  }

  /**
   * Helper Dual-Promise: Garantiza compatibilidad sincrónica (lectura inmediata de propiedades)
   * y asíncrona (resolución con await) sin romper código legacy de app.js.
   */
  function makeDualPromise(asyncFn, syncSnapshot) {
    const promise = asyncFn();
    if (syncSnapshot && typeof syncSnapshot === 'object') {
      try {
        Object.assign(promise, syncSnapshot);
        if (Array.isArray(syncSnapshot)) {
          promise[Symbol.iterator] = syncSnapshot[Symbol.iterator].bind(syncSnapshot);
          promise.length = syncSnapshot.length;
          promise.includes = syncSnapshot.includes.bind(syncSnapshot);
          promise.map = syncSnapshot.map.bind(syncSnapshot);
          promise.filter = syncSnapshot.filter.bind(syncSnapshot);
          promise.find = syncSnapshot.find.bind(syncSnapshot);
          promise.some = syncSnapshot.some.bind(syncSnapshot);
          promise.forEach = syncSnapshot.forEach.bind(syncSnapshot);
          for (let i = 0; i < syncSnapshot.length; i++) {
            promise[i] = syncSnapshot[i];
          }
        }
      } catch (e) {}
    }
    return promise;
  }

  // ============================================================================
  // INICIALIZACIÓN OFFLINE-FIRST
  // ============================================================================
  function init() {
    try {
      if (!localGet(KEYS.USERS)) localSet(KEYS.USERS, DEFAULT_USERS);
      if (!localGet(KEYS.COMPLETED_COURSES)) localSet(KEYS.COMPLETED_COURSES, ['c1-app-install']);
      if (!localGet(KEYS.ENROLLMENTS)) {
        localSet(KEYS.ENROLLMENTS, [
          {
            id: 'c1-app-install',
            courseId: 'c1-app-install',
            status: 'completed',
            progressPercent: 100,
            completedAt: '2026-03-01T10:00:00.000Z'
          }
        ]);
      }
      if (!localGet(KEYS.ACHIEVEMENTS)) {
        localSet(KEYS.ACHIEVEMENTS, [
          { id: 'ach-first-step', unlockedAt: new Date().toISOString() },
          { id: 'ach-app-installer', unlockedAt: new Date().toISOString() }
        ]);
      }
      if (!localGet(KEYS.PREFERENCES)) {
        const oldScale = localStorage.getItem('puente_font_scale') || '1';
        const oldContrast = localStorage.getItem('puente_contrast') || 'normal';
        localSet(KEYS.PREFERENCES, { ...DEFAULT_PREFERENCES, fontScale: oldScale, contrast: oldContrast });
      }
      if (!localGet(KEYS.TUTOR_NOTES)) {
        localSet(KEYS.TUTOR_NOTES, [
          {
            id: 'note-1',
            author: 'Sofía (Nieta)',
            date: '2026-03-10',
            text: '¡Felicitaciones abu por tu primer certificado! Te quiero un montón, el domingo lo festejamos con medialunas.'
          }
        ]);
      }
    } catch (err) {
      console.warn('[StorageService] Error inicializando estado local:', err);
    }
  }

  // ============================================================================
  // 1. GESTIÓN DE USUARIOS Y SESIÓN LOCAL (Colección 'users')
  // ============================================================================

  async function getUserProfile(userId) {
    const cleanId = resolveActiveUserId(userId);
    if (!cleanId) return null;

    // 1. Buscar en Firestore si está disponible
    if (isFirestoreAvailable()) {
      try {
        const userRef = doc(db, 'users', cleanId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const profile = { id: snap.id, ...snap.data() };
          syncUserToLocalCache(profile);
          return profile;
        }
      } catch (err) {
        console.warn(`[StorageService:getUserProfile] Firestore falló para "${cleanId}". Recurriendo a fallback local.`, err);
      }
    }

    // 2. Fallback local (localStorage)
    const localUsers = localGet(KEYS.USERS, DEFAULT_USERS);
    return localUsers.find(u => 
      (u.id && u.id.toLowerCase() === cleanId) || 
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.uid && u.uid.toLowerCase() === cleanId)
    ) || null;
  }

  async function saveUserProfile(userId, profileData) {
    const cleanId = resolveActiveUserId(userId);
    if (!cleanId) throw new Error('Se requiere userId para guardar el perfil.');

    const mergedData = {
      ...profileData,
      id: cleanId,
      updatedAt: new Date().toISOString()
    };

    // 1. Guardar siempre localmente (Garantiza offline / PWA)
    syncUserToLocalCache(mergedData);
    const logged = getLoggedUser();
    if (logged && (logged.id === cleanId || logged.username?.toLowerCase() === cleanId || logged.uid === cleanId)) {
      setLoggedUser({ ...logged, ...mergedData });
    }

    // 2. Sincronizar asíncronamente con Firestore
    if (isFirestoreAvailable()) {
      try {
        const userRef = doc(db, 'users', cleanId);
        await setDoc(userRef, mergedData, { merge: true });
      } catch (err) {
        console.warn(`[StorageService:saveUserProfile] Error al sincronizar Firestore ("${cleanId}"). Guardado localmente.`, err);
      }
    }

    return mergedData;
  }

  function getUsers() {
    const cachedUsers = localGet(KEYS.USERS, DEFAULT_USERS);
    return makeDualPromise(async () => cachedUsers, cachedUsers);
  }

  function saveUser(userObj) {
    const cleanUsername = (userObj.username || '').trim();
    const cleanId = userObj.id || cleanUsername.toLowerCase();
    const newUser = {
      id: cleanId,
      ...userObj,
      role: userObj.role || 'ALUMNO',
      joinedDate: userObj.joinedDate || new Date().toISOString()
    };

    // Guardar local
    syncUserToLocalCache(newUser);

    // Sincronizar asíncronamente si hay conexión
    const asyncSave = async () => {
      if (isFirestoreAvailable()) {
        try {
          const userRef = doc(db, 'users', cleanId);
          await setDoc(userRef, newUser, { merge: true });
        } catch (err) {
          console.warn('[StorageService:saveUser] Guardado en Firestore falló, conservado en local.', err);
        }
      }
      return newUser;
    };

    return makeDualPromise(asyncSave, newUser);
  }

  function syncUserToLocalCache(userObj) {
    const users = localGet(KEYS.USERS, DEFAULT_USERS);
    const idx = users.findIndex(u => 
      (u.id && userObj.id && u.id.toLowerCase() === userObj.id.toLowerCase()) ||
      (u.username && userObj.username && u.username.toLowerCase() === userObj.username.toLowerCase())
    );

    if (idx >= 0) {
      users[idx] = { ...users[idx], ...userObj };
    } else {
      users.push(userObj);
    }
    localSet(KEYS.USERS, users);
  }

  function getLoggedUser() {
    return localGet(KEYS.LOGGED_USER, null);
  }

  function setLoggedUser(userObj) {
    if (userObj) {
      localSet(KEYS.LOGGED_USER, userObj);
    } else {
      try {
        localStorage.removeItem(KEYS.LOGGED_USER);
      } catch (e) {}
    }
  }

  function isDocente() {
    const logged = getLoggedUser();
    return logged?.role === 'DOCENTE';
  }

  // ============================================================================
  // 2. CURSOS COMPLETADOS Y PROGRESO (`users/{userId}/progress`)
  // ============================================================================

  /**
   * Obtiene la lista de cursos completados (Híbrido: Local + users/{userId}/progress/courses)
   */
  function getCompletedCourses(userId) {
    const cached = localGet(KEYS.COMPLETED_COURSES, ['c1-app-install']);
    const activeUserId = resolveActiveUserId(userId);

    const asyncFetch = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          // Consultar documento de cursos en users/{userId}/progress/courses
          const progressRef = doc(db, 'users', activeUserId, 'progress', 'courses');
          const snap = await getDoc(progressRef);
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.completedCourses) && data.completedCourses.length > 0) {
              const merged = Array.from(new Set([...cached, ...data.completedCourses]));
              localSet(KEYS.COMPLETED_COURSES, merged);
              return merged;
            }
          }
        } catch (err) {
          console.warn(`[StorageService:getCompletedCourses] Fallback local activo para "${activeUserId}":`, err.message || err);
        }
      }
      return cached;
    };

    return makeDualPromise(asyncFetch, cached);
  }

  /**
   * Marca un curso como completado.
   * Guarda inmediatamente en localStorage y sincroniza en `users/{userId}/progress`
   */
  function completeCourse(courseId, userId) {
    const activeUserId = resolveActiveUserId(userId);

    // 1. Guardar siempre localmente (Zero Latency / PWA)
    const list = localGet(KEYS.COMPLETED_COURSES, ['c1-app-install']);
    if (!list.includes(courseId)) {
      list.push(courseId);
      localSet(KEYS.COMPLETED_COURSES, list);
    }

    // Actualizar también inscripciones locales
    const enrollments = localGet(KEYS.ENROLLMENTS, []);
    const idx = enrollments.findIndex(e => e.courseId === courseId);
    const updatedEnrollment = {
      courseId,
      status: 'completed',
      progressPercent: 100,
      completedAt: new Date().toISOString()
    };
    if (idx >= 0) {
      enrollments[idx] = { ...enrollments[idx], ...updatedEnrollment };
    } else {
      enrollments.push(updatedEnrollment);
    }
    localSet(KEYS.ENROLLMENTS, enrollments);

    // 2. Sincronizar asíncronamente en Firestore users/{userId}/progress
    const asyncComplete = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          // Documento específico del curso en la subcolección progress
          const courseProgressRef = doc(db, 'users', activeUserId, 'progress', courseId);
          await setDoc(courseProgressRef, {
            ...updatedEnrollment,
            userId: activeUserId,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          // Documento resumen de cursos en users/{userId}/progress/courses
          const summaryCoursesRef = doc(db, 'users', activeUserId, 'progress', 'courses');
          await setDoc(summaryCoursesRef, {
            completedCourses: list,
            lastCompletedCourse: courseId,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn(`[StorageService:completeCourse] Error sincronizando Firestore para "${activeUserId}". Mantenido en local.`, err.message || err);
        }
      }
      return list;
    };

    return makeDualPromise(asyncComplete, list);
  }

  function isCourseCompleted(courseId, userId) {
    const completed = getCompletedCourses(userId);
    return completed.includes(courseId);
  }

  /**
   * Inscribe al usuario en un curso guardando localmente y en `users/{userId}/progress/{courseId}`
   */
  async function enrollCourse(userId, courseId, extraData = {}) {
    const activeUserId = resolveActiveUserId(userId);

    const enrollmentData = {
      courseId,
      status: 'in_progress',
      currentStep: extraData.currentStep || 0,
      totalSteps: extraData.totalSteps || 3,
      progressPercent: extraData.progressPercent || 0,
      enrolledAt: extraData.enrolledAt || new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      ...extraData
    };

    // 1. Guardar localmente
    const enrollments = localGet(KEYS.ENROLLMENTS, []);
    const idx = enrollments.findIndex(e => e.courseId === courseId);
    if (idx >= 0) {
      enrollments[idx] = { ...enrollments[idx], ...enrollmentData };
    } else {
      enrollments.push(enrollmentData);
    }
    localSet(KEYS.ENROLLMENTS, enrollments);

    // 2. Sincronizar asíncronamente en Firestore users/{userId}/progress/{courseId}
    if (activeUserId && isFirestoreAvailable()) {
      try {
        const enrollRef = doc(db, 'users', activeUserId, 'progress', courseId);
        await setDoc(enrollRef, {
          ...enrollmentData,
          userId: activeUserId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn(`[StorageService:enrollCourse] Fallback local activo para "${activeUserId}":`, err.message || err);
      }
    }

    return enrollmentData;
  }

  async function getEnrollments(userId) {
    const activeUserId = resolveActiveUserId(userId);

    // Intentar leer de Firestore si está disponible
    if (activeUserId && isFirestoreAvailable()) {
      try {
        const coursesRef = doc(db, 'users', activeUserId, 'progress', 'courses');
        const snap = await getDoc(coursesRef);
        if (snap.exists() && snap.data().enrollments) {
          const list = snap.data().enrollments;
          localSet(KEYS.ENROLLMENTS, list);
          return list;
        }
      } catch (err) {
        console.warn(`[StorageService:getEnrollments] Error en Firestore, usando local.`, err.message || err);
      }
    }

    return localGet(KEYS.ENROLLMENTS, []);
  }

  /**
   * Guarda el progreso paso a paso de un curso en `users/{userId}/progress/{courseId}`
   */
  async function saveCourseProgress(userId, courseId, progressData) {
    const activeUserId = resolveActiveUserId(userId);

    const payload = {
      courseId,
      ...progressData,
      lastAccessedAt: new Date().toISOString()
    };

    // 1. Guardar en local
    const enrollments = localGet(KEYS.ENROLLMENTS, []);
    const idx = enrollments.findIndex(e => e.courseId === courseId);
    if (idx >= 0) {
      enrollments[idx] = { ...enrollments[idx], ...payload };
    } else {
      enrollments.push(payload);
    }
    localSet(KEYS.ENROLLMENTS, enrollments);

    // 2. Sincronizar en users/{userId}/progress/{courseId}
    if (activeUserId && isFirestoreAvailable()) {
      try {
        const progressRef = doc(db, 'users', activeUserId, 'progress', courseId);
        await setDoc(progressRef, {
          ...payload,
          userId: activeUserId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn(`[StorageService:saveCourseProgress] Error en Firestore, persistido localmente.`, err.message || err);
      }
    }

    return payload;
  }

  // ============================================================================
  // 3. LOGROS Y METAS (`users/{userId}/progress/achievements`)
  // ============================================================================

  function getUnlockedAchievements(userId) {
    const cached = localGet(KEYS.ACHIEVEMENTS, [
      { id: 'ach-first-step', unlockedAt: new Date().toISOString() },
      { id: 'ach-app-installer', unlockedAt: new Date().toISOString() }
    ]);
    const activeUserId = resolveActiveUserId(userId);

    const asyncFetch = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const achRef = doc(db, 'users', activeUserId, 'progress', 'achievements');
          const snap = await getDoc(achRef);
          if (snap.exists() && Array.isArray(snap.data().list)) {
            localSet(KEYS.ACHIEVEMENTS, snap.data().list);
            return snap.data().list;
          }
        } catch (err) {
          console.warn(`[StorageService:getUnlockedAchievements] Fallback local activo para "${activeUserId}":`, err.message || err);
        }
      }
      return cached;
    };

    return makeDualPromise(asyncFetch, cached);
  }

  function unlockAchievement(achievementId, userId) {
    const activeUserId = resolveActiveUserId(userId);
    const unlocked = localGet(KEYS.ACHIEVEMENTS, []);
    const found = unlocked.find(a => a.id === achievementId);

    if (found) {
      const syncResult = { newlyUnlocked: false, achievement: found };
      return makeDualPromise(async () => syncResult, syncResult);
    }

    const newAchievement = {
      id: achievementId,
      achievementId,
      unlockedAt: new Date().toISOString()
    };

    unlocked.push(newAchievement);
    localSet(KEYS.ACHIEVEMENTS, unlocked);
    const syncResult = { newlyUnlocked: true, achievement: newAchievement };

    const asyncUnlock = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const achRef = doc(db, 'users', activeUserId, 'progress', 'achievements');
          await setDoc(achRef, {
            list: unlocked,
            lastUnlocked: achievementId,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn(`[StorageService:unlockAchievement] Error guardando logro en Firestore para "${activeUserId}".`, err.message || err);
        }
      }
      return syncResult;
    };

    return makeDualPromise(asyncUnlock, syncResult);
  }

  function hasAchievement(achievementId, userId) {
    const achievements = getUnlockedAchievements(userId);
    return achievements.some(a => a.id === achievementId);
  }

  // ============================================================================
  // 4. PREFERENCIAS DE ACCESIBILIDAD (`users/{userId}/progress/preferences`)
  // ============================================================================

  function getPreferences(userId) {
    const cached = { ...DEFAULT_PREFERENCES, ...(localGet(KEYS.PREFERENCES, {})) };
    const activeUserId = resolveActiveUserId(userId);

    const asyncFetch = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const prefRef = doc(db, 'users', activeUserId, 'progress', 'preferences');
          const snap = await getDoc(prefRef);
          if (snap.exists() && snap.data()) {
            const remotePrefs = { ...DEFAULT_PREFERENCES, ...snap.data() };
            localSet(KEYS.PREFERENCES, remotePrefs);
            return remotePrefs;
          }
        } catch (err) {
          console.warn(`[StorageService:getPreferences] Error en Firestore, usando preferencias locales.`, err.message || err);
        }
      }
      return cached;
    };

    return makeDualPromise(asyncFetch, cached);
  }

  function savePreferences(partialPrefs, userId) {
    const current = localGet(KEYS.PREFERENCES, DEFAULT_PREFERENCES);
    const updated = { ...current, ...partialPrefs };
    localSet(KEYS.PREFERENCES, updated);

    // Sincronizar llaves legacy
    if (updated.fontScale) localStorage.setItem('puente_font_scale', updated.fontScale);
    if (updated.contrast) localStorage.setItem('puente_contrast', updated.contrast);

    const activeUserId = resolveActiveUserId(userId);

    const asyncSave = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const prefRef = doc(db, 'users', activeUserId, 'progress', 'preferences');
          await setDoc(prefRef, {
            ...updated,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn(`[StorageService:savePreferences] Error sincronizando preferencias en Firestore.`, err.message || err);
        }
      }
      return updated;
    };

    return makeDualPromise(asyncSave, updated);
  }

  // ============================================================================
  // 5. CERTIFICADOS EDUCATIVOS (`users/{userId}/progress/certificates`)
  // ============================================================================

  function getCertificates(userId) {
    const cached = localGet(KEYS.CERTIFICATES, []);
    const activeUserId = resolveActiveUserId(userId);

    const asyncFetch = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const certRef = doc(db, 'users', activeUserId, 'progress', 'certificates');
          const snap = await getDoc(certRef);
          if (snap.exists() && Array.isArray(snap.data().list)) {
            localSet(KEYS.CERTIFICATES, snap.data().list);
            return snap.data().list;
          }
        } catch (err) {
          console.warn(`[StorageService:getCertificates] Fallback local activo:`, err.message || err);
        }
      }
      return cached;
    };

    return makeDualPromise(asyncFetch, cached);
  }

  function issueCertificate(certData, userId) {
    const activeUserId = resolveActiveUserId(userId);
    const certs = localGet(KEYS.CERTIFICATES, []);
    const id = certData.id || `PD-${Date.now().toString(36).toUpperCase()}`;

    const newCert = {
      id,
      userId: activeUserId || 'invitado',
      studentName: certData.studentName || 'Estudiante',
      courseTitle: certData.courseTitle || 'Descarga e Instalación Segura de Aplicaciones',
      issuedDate: new Date().toISOString(),
      score: certData.score || 3,
      totalQuestions: certData.totalQuestions || 3,
      hashVerification: certData.hashVerification || `PD-VERIF-${Math.floor(100000 + Math.random() * 900000)}`
    };

    certs.push(newCert);
    localSet(KEYS.CERTIFICATES, certs);

    const asyncIssue = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const certRef = doc(db, 'users', activeUserId, 'progress', 'certificates');
          await setDoc(certRef, {
            list: certs,
            lastIssued: newCert,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn(`[StorageService:issueCertificate] Error guardando certificado en Firestore.`, err.message || err);
        }
      }
      return newCert;
    };

    return makeDualPromise(asyncIssue, newCert);
  }

  // ============================================================================
  // 6. NOTAS DE ACOMPAÑANTE / TUTOR (`users/{userId}/progress/tutor_notes`)
  // ============================================================================

  function getTutorNotes(userId) {
    const cached = localGet(KEYS.TUTOR_NOTES, [
      {
        id: 'note-1',
        author: 'Sofía (Nieta)',
        date: '2026-03-10',
        text: '¡Felicitaciones abu por tu primer certificado! Te quiero un montón, el domingo lo festejamos con medialunas.'
      }
    ]);
    const activeUserId = resolveActiveUserId(userId);

    const asyncFetch = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const notesRef = doc(db, 'users', activeUserId, 'progress', 'tutor_notes');
          const snap = await getDoc(notesRef);
          if (snap.exists() && Array.isArray(snap.data().list)) {
            localSet(KEYS.TUTOR_NOTES, snap.data().list);
            return snap.data().list;
          }
        } catch (err) {
          console.warn(`[StorageService:getTutorNotes] Fallback local activo:`, err.message || err);
        }
      }
      return cached;
    };

    return makeDualPromise(asyncFetch, cached);
  }

  function addTutorNote(noteText, author = 'Familiar / Tutor', userId) {
    const activeUserId = resolveActiveUserId(userId);
    const notes = localGet(KEYS.TUTOR_NOTES, []);
    const noteId = `note-${Date.now()}`;

    const newNote = {
      id: noteId,
      author,
      date: new Date().toISOString().split('T')[0],
      text: noteText,
      createdAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    localSet(KEYS.TUTOR_NOTES, notes);

    const asyncAdd = async () => {
      if (activeUserId && isFirestoreAvailable()) {
        try {
          const notesRef = doc(db, 'users', activeUserId, 'progress', 'tutor_notes');
          await setDoc(notesRef, {
            list: notes,
            lastAdded: newNote,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn(`[StorageService:addTutorNote] Error en Firestore, guardado en local.`, err.message || err);
        }
      }
      return newNote;
    };

    return makeDualPromise(asyncAdd, newNote);
  }

  // ============================================================================
  // 7. DIAGNÓSTICO Y ESTADO DE CONEXIÓN
  // ============================================================================
  function getStatus() {
    return {
      isOnline: navigator.onLine,
      isFirestoreActive: isFirestoreAvailable(),
      mode: isFirestoreAvailable() ? 'HYBRID_FIRESTORE_SYNC' : 'LOCAL_STORAGE_ONLY',
      activeUser: resolveActiveUserId() || 'anonymous'
    };
  }

  // Inicialización local
  init();

  return {
    // Diagnóstico
    getStatus,
    isFirestoreAvailable,
    // Perfil y Usuarios ('users')
    getUserProfile,
    saveUserProfile,
    getUsers,
    saveUser,
    getLoggedUser,
    setLoggedUser,
    isDocente,
    // Cursos y Progreso (`users/{userId}/progress`)
    getCompletedCourses,
    completeCourse,
    isCourseCompleted,
    enrollCourse,
    getEnrollments,
    saveCourseProgress,
    // Logros (`users/{userId}/progress/achievements`)
    getUnlockedAchievements,
    unlockAchievement,
    hasAchievement,
    // Preferencias (`users/{userId}/progress/preferences`)
    getPreferences,
    savePreferences,
    // Certificados (`users/{userId}/progress/certificates`)
    getCertificates,
    issueCertificate,
    // Notas de Tutor (`users/{userId}/progress/tutor_notes`)
    getTutorNotes,
    addTutorNote
  };
})();

// Exportación global en window para consumo directo en scripts tradicionales
window.StorageService = StorageService;

// Exportación ESM moderna
export default StorageService;
export { StorageService };
