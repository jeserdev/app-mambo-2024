import React, { useContext, useEffect } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../state/auth.context'
import { Ionicons } from '@expo/vector-icons'

export function MenuScreen() {
  const navigation = useNavigation()
  const { isLoggedIn, userData, logout } = useContext(AuthContext)

  useEffect(() => {
    if (isLoggedIn && userData) {
    }
  }, [isLoggedIn, userData])

  const handleLogout = () => {
    logout()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfileUserMainScreen')}
      >
        <Ionicons name="person-outline" size={24} color="#000" />
        <Text style={styles.buttonText}>Ir al perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#000" />
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    marginLeft: 10,
  },
})
