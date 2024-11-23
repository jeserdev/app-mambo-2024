import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
} from 'react-native'
import { ref, get, update } from 'firebase/database'
import {
  getStorage,
  getDownloadURL,
  uploadBytes,
  ref as storageRef,
} from 'firebase/storage'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { database } from '../database/firebase'
import { launchImageLibraryAsync, launchCameraAsync } from 'expo-image-picker'
import { Checkbox, TextInput } from 'react-native-paper'

const EditProfileUserScreen = ({ route, navigation }) => {
  const { user } = route.params

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(null)
  const [postcode, setPoscode] = useState(null)
  const [city, setCity] = useState('')
  const [uid, setUid] = useState('')
  const [addresses, setAddresses] = useState([])
  const [profileImage, setProfileImage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setUid(user.uid)
      setFullName(user.fullName)
      setPhoneNumber(user.phoneNumber ? user.phoneNumber.toString() : '') // Convertir a cadena de texto
      setPoscode(user.postcode ? user.postcode.toString() : '') // Convertir a cadena de texto
      setCity(user.city)
      setAddresses(user.addresses || [])
      setProfileImage(user.profileImage)
      ;(async () => {
        if (Platform.OS !== 'web') {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert(
              'Se necesita permiso para acceder a la biblioteca de medios.'
            )
          }
        }
      })()
    }
  }, [user])

  const handleAddAddress = () => {
    if (addresses.length < 3) {
      setAddresses([...addresses, ''])
    } else {
      Alert.alert(
        'Máximo de direcciones alcanzado',
        'Solo puedes agregar hasta 3 direcciones.'
      )
    }
  }

  const handleAddressChange = (index, newAddress) => {
    setAddresses((prevAddresses) => {
      const updatedAddresses = [...prevAddresses]
      updatedAddresses[index] = newAddress
      return updatedAddresses
    })
  }

  const handleDeleteAddress = (index) => {
    Alert.alert(
      'Eliminar dirección',
      '¿Estás seguro de que deseas eliminar esta dirección?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            setAddresses((prevAddresses) =>
              prevAddresses.filter((_, i) => i !== index)
            )
          },
          style: 'destructive',
        },
      ]
    )
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

  const takePhoto = async () => {
    try {
      const result = await launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0]
        setProfileImage(selectedImage.uri)
      } else {
        console.log('No se capturó ninguna imagen o se canceló la operación.')
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error)
      Alert.alert('Error al tomar la foto')
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

      // Manipulate the image if necessary (e.g., resize, compress)
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

      // Convert the image to bytes
      const imageBytes = await fetch(localUri).then((response) =>
        response.blob()
      )

      // Upload the image to Firebase Storage
      await uploadBytes(storageReference, imageBytes)

      // Get the download URL of the uploaded image
      const downloadUrl = await getDownloadURL(storageReference)

      console.log('Imagen subida exitosamente:', downloadUrl)

      return downloadUrl // Return the download URL for subsequent use
    } catch (error) {
      console.error('Error al guardar la foto:', error)
      throw new Error('Error al guardar la foto: ' + error.message)
    }
  }

  const saveProfile = async () => {
    setLoading(true)

    try {
      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Use the correct identifier to fetch user data
      const userRef = ref(database, `users/${user.uid}`)
      console.log(user.uid)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        throw new Error(
          'No se encontraron datos de usuario para el ID proporcionado.'
        )
      }

      const userData = snapshot.val()
      let profileImageUrlLocal = userData.profileImage

      if (profileImage) {
        try {
          profileImageUrlLocal = await savePhoto(profileImage)
        } catch (error) {
          console.error('Error al guardar la foto:', error)
          Alert.alert('Error al guardar la foto.')
          return // Early return if there's an error saving the photo
        }
      }

      const updatedUserData = {
        ...userData,
        fullName,
        phoneNumber,
        postcode,
        city,
        addresses,
        profileImage: profileImageUrlLocal,
      }

      await update(userRef, updatedUserData)
      Alert.alert('Perfil actualizado exitosamente.')
      navigation.navigate('ProfileUserMainScreen')
    } catch (error) {
      console.error('Error al guardar el perfil:', error)
      Alert.alert('Error al guardar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Perfil</Text>

        <TextInput
          style={styles.input}
          label="Nombre completo" // Cambia placeholder por label
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          label="Número de teléfono" // Cambia placeholder por label
          value={phoneNumber ? phoneNumber.toString() : ''}
          onChangeText={(value) =>
            setPhoneNumber(value ? parseInt(value, 10) : null)
          }
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          label="Postcode" // Cambia placeholder por label
          value={postcode ? postcode.toString() : ''}
          onChangeText={(value) =>
            setPoscode(value ? parseInt(value, 10) : null)
          }
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          label="Ciudad" // Cambia placeholder por label
          value={city}
          onChangeText={setCity}
        />

        <View>
          <Text style={styles.label}>Mis Direcciones:</Text>
          {addresses.map((address, index) => (
            <View key={index} style={styles.addressContainer}>
              <TextInput
                style={styles.addressInput}
                label={`Dirección ${index + 1}`} // Cambia placeholder por label
                value={address}
                onChangeText={(newAddress) =>
                  handleAddressChange(index, newAddress)
                }
              />
              <TouchableOpacity onPress={() => handleDeleteAddress(index)}>
                <Text style={styles.deleteAddressButton}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))}
          {addresses.length < 3 && (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={handleAddAddress}
            >
              <Text style={styles.addAddressButtonText}>Agregar dirección</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImageFromGallery}
        >
          <Text style={styles.imagePickerText}>
            Seleccionar imagen de la galería
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imagePicker} onPress={takePhoto}>
          <Text style={styles.imagePickerText}>Tomar foto</Text>
        </TouchableOpacity>

        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#024936',
  },

  label: {
    fontSize: 18,
    marginBottom: 20,
    color: '#024936',
  },
  input: {
    width: '100%',
    height: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 0,
    borderColor: '#FFF',
    borderRadius: 0,
    backgroundColor: '#FFF',
  },
  addressInput: {
    width: '100%',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 0,
    borderColor: '#FFF',
    borderRadius: 0,
    backgroundColor: '#FFF',
  },
  addAddressButton: {
    width: '50%',
    height: 40,
    borderRadius: 25,
    backgroundColor: '#ed7400',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    width: '50%',
    height: 40,
    borderRadius: 25,
    backgroundColor: '#ed7400',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  imagePicker: {
    marginTop: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#024936',
    textDecorationLine: 'underline',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
})

export default EditProfileUserScreen
