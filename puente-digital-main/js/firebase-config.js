/**
 * Puente Digital 2.0 - Configuración e Inicialización de Firebase SDK v10 (Firestore Lite)
 * 
 * Este archivo inicializa Firebase App, Firebase Authentication y Cloud Firestore Lite
 * utilizando la sintaxis moderna modular de Firebase SDK v10.12.0 cargada directamente
 * desde la CDN oficial de Google (sin necesidad de bundlers o transpiladores).
 * 
 * Firestore Lite utiliza peticiones REST HTTP estándar sin WebChannel ni streaming persistente,
 * garantizando máxima estabilidad y eliminando errores 400 de transporte.
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-lite.js";

// ============================================================================
// 1. CREDENCIALES DEL PROYECTO FIREBASE
// ============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyBp_ApQPe3lWHyRU0SkwQNhigrv-u96_o4",
  authDomain: "puente-digital-72c89.firebaseapp.com",
  projectId: "puente-digital-72c89",
  storageBucket: "puente-digital-72c89.firebasestorage.app",
  messagingSenderId: "240812760174",
  appId: "1:240812760174:web:e3dd9ce9656671454f1a7f"
};

// ============================================================================
// 2. VERIFICACIÓN DE CREDENCIALES
// ============================================================================
/**
 * Determina si la configuración posee credenciales válidas y activas.
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("TU_API_KEY") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("TU_PROJECT")
  );
}

// ============================================================================
// 3. INICIALIZACIÓN DE SERVICIOS FIREBASE
// ============================================================================
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const isInitialized = true;

console.info(`✅ [Firebase] Conexión inicializada con Firestore Lite en el proyecto "${firebaseConfig.projectId}" (SDK v10.12.0).`);

// Proveedor de autenticación con Google
export const googleProvider = new GoogleAuthProvider();

/**
 * Inicia sesión utilizando la ventana emergente oficial de Google (Gmail)
 */
export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Authentication no está inicializado.');
  }
  return await signInWithPopup(auth, googleProvider);
}

// ============================================================================
// 4. EXPORTACIONES MODULARES ESM
// ============================================================================
export {
  getFirestore,
  // Métodos Firestore Lite para consumo modular
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  // Métodos Auth para consumo modular
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
};

// ============================================================================
// 5. EXPOSICIÓN GLOBAL EN WINDOW PARA INTEROPERABILIDAD
// ============================================================================
if (typeof window !== 'undefined') {
  window.FirebaseConfig = {
    app,
    auth,
    db,
    isConfigured: isFirebaseConfigured(),
    isInitialized: true,
    firebaseConfig,
    firestore: {
      getFirestore,
      doc,
      getDoc,
      getDocs,
      setDoc,
      updateDoc,
      addDoc,
      deleteDoc,
      collection,
      query,
      where,
      orderBy,
      serverTimestamp
    },
    authOps: {
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      updateProfile,
      GoogleAuthProvider,
      googleProvider,
      signInWithPopup,
      signInWithGoogle
    }
  };
}

export default {
  app,
  db,
  auth,
  firebaseConfig,
  isFirebaseConfigured
};

// Comprobación de inicialización en consola
if (app && db && auth) {
  console.log("Firebase inicializado correctamente en Puente Digital");
}
