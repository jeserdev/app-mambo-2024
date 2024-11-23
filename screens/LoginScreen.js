import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth' // Import for Authentication
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import * as SecureStore from 'expo-secure-store';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const auth = getAuth()
      console.log('Intentando iniciar sesión con el correo:', email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log('Inicio de sesión exitoso')
      Alert.alert('Ingresaste Correctamente', '¡Bienvenido!')
      navigation.navigate('ProductStack', { screen: 'MainScreen' })
      setEmail('')
      setPassword('')

      // Guarda los datos del usuario en el almacenamiento seguro
      await SecureStore.setItemAsync('email', email);
      await SecureStore.setItemAsync('password', password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message)
      Alert.alert(
        'Error',
        'Error al iniciar sesión. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }


  const handleResetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Correo electrónico enviado', 'Se ha enviado un correo electrónico para restablecer tu contraseña.');
      })
      .catch((error) => {
        console.error('Error al enviar correo electrónico:', error);
        Alert.alert('Error', 'Error al enviar correo electrónico. Por favor, inténtalo de nuevo.');
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <IconMamboCenter style={styles.headerIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Ingresar</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>
      <View style={styles.register}>
        <Text style={styles.registerText}>¿Aún no tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.registerLink}>Regístrate aquí</Text>
        </TouchableOpacity>
       
      </View>
      <TouchableOpacity onPress={handleResetPassword}>
        <Text style={styles.resetPasswordLink}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2e8d1',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#024936',
  },
  input: {
    width: '70%',
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 25,
    backgroundColor: '#FFF',
  },
  button: {
    width: '50%',
    height: 40,
    borderRadius: 25,
    backgroundColor: '#ed7400', // Adjust button color if desired
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  register: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#024936',
  },
  resetPasswordLink: {
    fontSize: 16,
    color: '#024936',
  },
  registerLink: {
    fontSize: 16,
    color: '#024936',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  header: {
    flexDirection: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginRight: 0,
    backgroundColor: '#f2e8d1',
  },
})

export default LoginScreen
