import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Switch,
} from 'react-native'
import { database } from '../database/firebase'
import { ref, push, get, set } from 'firebase/database'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { Picker } from '@react-native-picker/picker'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker'
import { app } from '../database/firebase'
import Base64 from 'base64-js'

import PrivacyPolicyModal from '../components/PrivacyPolicyModal'

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dni, setDNI] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [fullName, setFullName] = useState('') // New state for full name
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageUrl, setProfileImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('Cliente')
  const [showModal, setShowModal] = useState(true) // Mostrar al inicio
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false)
  const [empresa, setEmpresa] = useState('')
  const [postcode, setPostcode] =useState('')

  const handleAcceptPrivacyPolicy = () => {
    setPrivacyPolicyAccepted(true)
    setShowModal(false)
    // Aquí enviarías la información a tu base de datos (privacyPolicyAccepted: true)
  }

  const pickImageFromGallery = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0]
        setProfileImage(selectedImage.uri)
      } else {
        Alert.alert('Por favor, selecciona una imagen')
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error)
      Alert.alert('Error al seleccionar imagen')
    }
  }

  const savePhoto = async (uri) => {
    try {
      const filename = `${Date.now()}.jpg`

      // Create a reference to the storage location
      const storageReference = storageRef(
        getStorage(),
        `profile_images/${filename}`
      )

      // Manipulate the image
      const manipulatorResult = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      )

      // Get the local URI of the manipulated image
      const localUri = manipulatorResult.uri

      // Upload the manipulated image to Firebase Storage
      await uploadImage(storageReference, localUri)

      // Get the public download URL of the uploaded image
      const downloadUrl = await getDownloadURL(storageReference)

      console.log('Image uploaded successfully:', downloadUrl)

      return downloadUrl // Optionally return the download URL for further processing
    } catch (error) {
      console.error('Error saving photo:', error)
      throw new Error('Error saving photo: ' + error.message)
    }
  }

  const uploadImage = async (storageReference, uri) => {
    try {
      const response = await fetch(uri)
      const blob = await response.blob()
      await uploadBytes(storageReference, blob)
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Error uploading image: ' + error.message)
    }
  }

  const base64ToBlob = (base64String) => {
    // Remove data prefix if present
    const base64WithoutPrefix = base64String.replace(
      /^data:image\/\w+;base64,/,
      ''
    )

    // Convert base64 to a byte array
    const byteCharacters = Buffer.from(base64WithoutPrefix, 'base64')

    // Create a Blob from the byte array
    return new Blob([byteCharacters], { type: 'image/jpeg' })
  }

  const handleRegister = async () => {
    if (!privacyPolicyAccepted) {
      Alert.alert(
        'Política de Privacidad',
        'Por favor, acepta la política de privacidad para continuar con el registro.',
        [
          {
            text: 'OK',
            onPress: () => setShowModal(true), // Mostrar el modal al presionar OK
          },
        ]
      )
      return
    }

    setLoading(true)
    try {
      const userExists = await checkUserExists(email)
      if (userExists) {
        throw new Error('El usuario ya está registrado.')
      }
      await registerUser(email, password)
      await loginUser(email, password)

      const currentUser = getAuth().currentUser

      // Save the image and get the download URL
      let profileImageUrlLocal
      if (profileImage) {
        profileImageUrlLocal = await savePhoto(profileImage)
      }

      const userData = {
        empresa,
        email,
        fullName,
        role: selectedRole,
        uid: currentUser.uid, // Use the UID as the key
        phoneNumber,
        dni,
        city,
        address,
        postcode,
        profileImage: profileImageUrlLocal || null,
        privacyPolicyAccepted: privacyPolicyAccepted, // Guardar estado de aceptación
        createdAt: new Date().toISOString(), // Guardar la fecha de creación
      }

      const userRef = ref(database, `users/${currentUser.uid}`) // Reference using the UID
      await set(userRef, userData)

      Alert.alert(
        'Gracias Registrarse en nuestra App',
        '¡Ingresaste con éxito!'
      )

      navigation.navigate('VerificationScreen')

      // Limpiar los campos de entrada y reiniciar la imagen de perfil
      setEmpresa('')
      setEmail('')
      setPassword('')
      setPhoneNumber('')
      setDNI('')
      setCity('')
      setAddress('')
      setPostcode('')
      setProfileImage(null)
    } catch (error) {
      console.error('Error al registrar usuario:', error.message)
      Alert.alert(
        'Error',
        'Error al registrar usuario. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  const checkUserExists = async (email) => {
    try {
      const usersRef = ref(database, 'users')
      const snapshot = await get(usersRef)
      if (snapshot.exists()) {
        const users = snapshot.val()
        const userValues = Object.values(users)
        return userValues.some((user) => user.email === email)
      }
      return false
    } catch (error) {
      console.error('Error al verificar usuario:', error.message)
      return false
    }
  }

  const registerUser = async (email, password) => {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const loginUser = async (email, password) => {
    const auth = getAuth()
    await signInWithEmailAndPassword(auth, email, password)
  }

  const handleOpenPrivacyPolicy = () => {
    setShowModal(true) // Mostrar el modal
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <IconMamboCenter style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Registro</Text>

      {/* New input for full name */}
      <TextInput
        style={styles.input}
        placeholder="Empresa"
        value={empresa}
        onChangeText={setEmpresa}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={fullName}
        onChangeText={setFullName}
      />

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
      <TextInput
        style={styles.input}
        placeholder="Número de teléfono"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Código postal"
        value={postcode}
        onChangeText={setPostcode}
        
      />
      <TextInput
        style={styles.input}
        placeholder="Ciudad"
        value={city}
        onChangeText={setCity}
      />
    

      <View style={styles.imagePickerContainer}>
        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        )}
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={pickImageFromGallery}
          disabled={loading}
        >
          <Text style={styles.imagePickerButtonText}>Seleccionar logo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.privacyPolicyContainer}>
        <TouchableOpacity onPress={handleOpenPrivacyPolicy}>
          <Text style={styles.privacyPolicyText}>
            He leído y acepto la Política de Privacidad.
          </Text>
        </TouchableOpacity>
        <Switch
          value={privacyPolicyAccepted}
          onValueChange={setPrivacyPolicyAccepted}
          trackColor={{ false: '#f4f4f4', true: '#ed7400' }} // Colores del switch
          thumbColor={privacyPolicyAccepted ? '#024936' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={!privacyPolicyAccepted || loading} // Deshabilitar si no se ha aceptado o si está cargando.
      ></TouchableOpacity>

      <View style={styles.login}>
        <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.loginLink}>Inicia sesión aquí</Text>
        </TouchableOpacity>
      </View>

      <View>
        <PrivacyPolicyModal
          isVisible={showModal}
          onClose={() => setShowModal(false)} // Solo cerrar si ya aceptó
          onAccept={handleAcceptPrivacyPolicy}
        />
      </View>
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
  header: {
    flexDirection: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2e8d1',
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginRight: 0,
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
    backgroundColor: '#ed7400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  login: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#024936',
  },
  loginLink: {
    fontSize: 16,
    color: '#024936',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  roleLabel: {
    fontSize: 16,
    color: '#024936',
    marginBottom: 5,
  },
  roleDropdown: {
    width: 190,
    color: '#024936',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  imagePickerButton: {
    backgroundColor: '#ed7400',
    padding: 10,
    borderRadius: 50,
  },
  imagePickerButtonText: {
    color: '#fff',
    borderRadius: 50,
  },
  privacyPolicyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  privacyPolicyText: {
    marginLeft: 5,
    color: '#024936',
    textDecorationLine: 'underline',
  },
})

export default RegisterScreen
