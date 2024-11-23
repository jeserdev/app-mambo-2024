// VerificationScreen.js
import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'

const VerificationScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Inicia sesión después del retraso (opcional)
      // loginUser(email, password);
      navigation.navigate('ProductStack', { screen: 'MainScreen' });
    }, 2000) // Retraso de 2 segundos

    return () => clearTimeout(timer) // Limpia el temporizador al desmontar
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Verificando datos...</Text>
    </View>
  )
}

export default VerificationScreen
