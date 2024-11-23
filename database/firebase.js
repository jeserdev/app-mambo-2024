import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_DATABASE_URL,
} from '@env'

import Constants from 'expo-constants'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  reactNativeLocalPersistence,
  getReactNativePersistence,
} from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { ref, get } from 'firebase/database'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { onAuthStateChanged } from 'firebase/auth'



const { expoConfig } = Constants

// Configuración de Firebase (reemplazar con tu configuración real)
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  databaseURL: FIREBASE_DATABASE_URL,
}

//console.log('Variables de entorno en firebase.js:', {
// apiKey: firebaseConfig.apiKey,
//  authDomain: firebaseConfig.authDomain,
//  projectId: firebaseConfig.projectId,
//  storageBucket: firebaseConfig.storageBucket,
// messagingSenderId: firebaseConfig.messagingSenderId,
// appId: firebaseConfig.appId,
//  databaseURL: firebaseConfig.databaseURL,
//})
//
// Inicializar la aplicación Firebase (verificar si ya está inicializada)
const firebaseApp = initializeApp(firebaseConfig)

// Inicializar Firebase Auth con AsyncStorage para persistencia
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Obtener la instancia de la base de datos
const database = getDatabase(firebaseApp)

// Exportar instancias de la base de datos y de auth (opcional, ajustar según tus necesidades)
export { database, auth }

// Función para obtener los datos del usuario desde la base de datos en tiempo real
export const getUserDataFromFirebase = async (userId) => {
  const dbRef = userId ? ref(database, 'users/' + userId) : null

  if (dbRef) {
    try {
      const snapshot = await get(dbRef)
      if (snapshot.exists()) {
        const user = snapshot.val()
        return user
      } else {
        throw new Error('User not found: ' + userId)
      }
    } catch (error) {
      throw error
    }
  } else {
    throw new Error('No user ID provided')
  }
}

// Identificar al usuario conectado y sus datos
onAuthStateChanged(auth, (user) => {
  if (user) {
    getUserDataFromFirebase(user.uid)
      .then((userData) => {
        if (!userData) {
          console.error('No user data found'); // o mostrar un mensaje al usuario
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error); // o mostrar un mensaje al usuario
      });
  }
});
