/**
 * Puente Digital 2.0 - Script de Verificación y Diagnóstico de Firebase Firestore
 * 
 * Este script permite comprobar la conectividad, autenticación y permisos de
 * lectura/escritura en Cloud Firestore contra la colección `_healthcheck`.
 * 
 * Modo de uso desde la Consola del Navegador (F12):
 *   testFirebaseConnection()
 *   // O con opciones:
 *   testFirebaseConnection({ cleanup: false, verbose: true })
 */

import {
  db,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  isFirebaseConfigured,
  firebaseConfig
} from './firebase-config.js';

/**
 * Ejecuta una prueba completa de lectura y escritura en Firestore.
 * 
 * @param {Object} [options]
 * @param {boolean} [options.cleanup=true] Elimina el documento de prueba al finalizar
 * @param {boolean} [options.verbose=true] Muestra detalles de latencia y datos en consola
 * @returns {Promise<{success: boolean, latencyMs?: number, data?: any, error?: any}>}
 */
export async function testFirebaseConnection(options = {}) {
  const { cleanup = true, verbose = true } = options;

  console.group('%c🔥 [Firebase Healthcheck] Verificando conexión con Cloud Firestore...', 'color: #0284c7; font-weight: bold; font-size: 13px;');

  // 1. Validar si existen credenciales reales o placeholders
  if (!isFirebaseConfigured()) {
    console.warn(
      '%c⚠️ [Firebase Config] Credenciales no configuradas',
      'color: #f59e0b; font-weight: bold;',
      '\nEl archivo `js/firebase-config.js` aún contiene valores por defecto (placeholders):' +
      `\n- Project ID actual: "${firebaseConfig.projectId}"` +
      `\n- API Key actual: "${firebaseConfig.apiKey}"` +
      '\n\n💡 Para conectar Firestore con tu base de datos:' +
      '\n 1. Ingresa a la consola: https://console.firebase.google.com/' +
      '\n 2. Crea o selecciona tu proyecto y copia la configuración de tu aplicación Web.' +
      '\n 3. Pega tus credenciales en el objeto `firebaseConfig` dentro de `js/firebase-config.js`.' +
      '\n 4. Vuelve a ejecutar `testFirebaseConnection()` en esta consola.'
    );
    console.groupEnd();
    return {
      success: false,
      reason: 'unconfigured',
      message: 'Placeholders detectados en firebaseConfig.'
    };
  }

  if (!db) {
    console.error(
      '%c❌ [Firebase Init] Instancia Firestore no disponible',
      'color: #ef4444; font-weight: bold;',
      '\nLa función getFirestore() no pudo inicializarse. Revisa errores previos en la consola.'
    );
    console.groupEnd();
    return {
      success: false,
      reason: 'db_not_initialized'
    };
  }

  const testId = `ping_${Date.now()}`;
  const docRef = doc(db, '_healthcheck', testId);
  const startTime = performance.now();

  const testPayload = {
    testId,
    status: 'ok',
    clientTimestamp: new Date().toISOString(),
    serverTimestamp: serverTimestamp(),
    platform: 'Puente Digital 2.0',
    description: 'Documento de prueba temporal para diagnóstico de conectividad y reglas de seguridad.'
  };

  try {
    // 2. Intento de Escritura (setDoc)
    if (verbose) {
      console.log('1️⃣ Intentando escribir documento de prueba en colección "_healthcheck"...', { docId: testId });
    }
    await setDoc(docRef, testPayload);

    // 3. Intento de Lectura (getDoc)
    if (verbose) {
      console.log('2️⃣ Leyendo documento recién creado para validar permisos de lectura...');
    }
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('El documento fue escrito pero no se encontró en la posterior lectura.');
    }

    const fetchedData = docSnap.data();
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    // 4. Limpieza opcional del documento de prueba
    if (cleanup) {
      try {
        await deleteDoc(docRef);
        if (verbose) console.log('3️⃣ Documento de prueba eliminado correctamente.');
      } catch (cleanErr) {
        console.warn('⚠️ No se pudo eliminar el documento temporal de prueba:', cleanErr);
      }
    }

    // 5. Mensaje de Éxito
    console.log(
      '%c✅ Conexión a Firebase Firestore exitosa',
      'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px;'
    );
    console.log('📊 Diagnóstico de conexión:', {
      projectId: firebaseConfig.projectId,
      collection: '_healthcheck',
      documentId: testId,
      latenciaTotal: `${latencyMs} ms`,
      permisos: 'Lectura y Escritura operativas (R/W OK)',
      datosRecibidos: fetchedData
    });
    console.groupEnd();

    return {
      success: true,
      latencyMs,
      data: fetchedData
    };
  } catch (error) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    console.error(
      '%c❌ Fallo al conectar con Firebase Firestore',
      'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px;'
    );

    // Diagnóstico pedagógico según el código de error
    const errorCode = error?.code || 'desconocido';
    let diagnostico = '';

    switch (errorCode) {
      case 'permission-denied':
        diagnostico = 'Las Reglas de Seguridad de Cloud Firestore rechazaron la operación.\n' +
          '👉 Solución: Ve a Firebase Console -> Firestore Database -> pestaña "Reglas" y asegúrate de permitir lectura/escritura.\n' +
          '   Ejemplo para pruebas de desarrollo:\n' +
          '   rules_version = \'2\';\n' +
          '   service cloud.firestore {\n' +
          '     match /databases/{database}/documents {\n' +
          '       match /{document=**} {\n' +
          '         allow read, write: if true;\n' +
          '       }\n' +
          '     }\n' +
          '   }';
        break;

      case 'unauthenticated':
        diagnostico = 'La operación requiere que el usuario esté autenticado con Firebase Auth antes de escribir.';
        break;

      case 'unavailable':
        diagnostico = 'El servicio de Firestore no está disponible o el navegador no tiene conexión a internet activa.';
        break;

      case 'not-found':
        diagnostico = 'No se encontró la base de datos de Cloud Firestore. Asegúrate de haber presionado "Crear base de datos" en Firebase Console.';
        break;

      case 'failed-precondition':
        diagnostico = 'Precondición fallida (puede deberse a índices pendientes o múltiples pestañas con persistencia offline).';
        break;

      default:
        if (error.message?.includes('API key') || error.message?.includes('apiKey') || errorCode.includes('api-key')) {
          diagnostico = 'La API Key de Firebase no es válida o tiene restricciones de dominio en Google Cloud Console.';
        } else {
          diagnostico = `Error inesperado (${errorCode}): ${error.message}`;
        }
    }

    console.warn(`🔍 Diagnóstico del error [${errorCode}]:\n${diagnostico}`);
    console.error('Detalles del error técnico:', error);
    console.groupEnd();

    return {
      success: false,
      errorCode,
      error,
      latencyMs,
      diagnostico
    };
  }
}

// Exposición global en window para invocación rápida desde la consola de desarrollador
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
  window.testFirestore = testFirebaseConnection;

  // Auto-ejecutar diagnóstico informativo si Firebase ya está configurado
  if (isFirebaseConfigured()) {
    console.info('ℹ️ [Firebase Test] Credenciales detectadas. Ejecutando verificación de conexión inicial...');
    testFirebaseConnection({ cleanup: true, verbose: false }).catch(() => {});
  } else {
    console.info(
      '💡 [Firebase Test] Script de verificación cargado. Puedes probar la conexión en cualquier momento ejecutando:\n   testFirebaseConnection()'
    );
  }
}

export default testFirebaseConnection;
