import React, { createContext, useState, useEffect } from 'react'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { database } from '../database/firebase' // Assuming database is initialized there
import * as SecureStore from 'expo-secure-store'

const AuthContext = createContext({
  isLoggedIn: false,
  role: '',
  userData: null,
  isLoading: false,
  setIsLoggedIn: () => {},
  setRole: () => {},
  setUser: () => {},
  login: () => {},
  logout: () => {},
})

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState('')
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const auth = getAuth()

  useEffect(() => {
    const autoLogin = async () => {
      const savedEmail = await SecureStore.getItemAsync('email')
      const savedPassword = await SecureStore.getItemAsync('password')

      if (savedEmail && savedPassword) {
        login(savedEmail, savedPassword)
      }
    }

    autoLogin()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true)

        const userRef = ref(database, `users/${user.uid}`)
        setIsLoading(true)
        try {
          const userSnapshot = await get(userRef)
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val()

            setUserData(userData)
            setRole(userData.role)
          }
        } catch (error) {
          throw error
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoggedIn(false)
        setRole('')
        setUserData(null)
      }
    })

    return () => unsubscribe()
  }, [auth])

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)

      // Guarda los datos del usuario en el almacenamiento seguro
      await SecureStore.setItemAsync('email', email)
      await SecureStore.setItemAsync('password', password)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)

      // Remove the user data from secure storage
      await SecureStore.deleteItemAsync('email')
      await SecureStore.deleteItemAsync('password')
    } catch (error) {
      throw error
    }
  }

  const contextValue = {
    isLoggedIn,
    role,
    userData,
    isLoading,
    setIsLoggedIn,
    setRole,
    setUser: setUserData,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
