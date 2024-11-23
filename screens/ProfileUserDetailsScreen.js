import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { ref, remove } from 'firebase/database'
import { database } from '../database/firebase'

const deleteUser = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`)
    await remove(userRef)
    console.log('Usuario eliminado exitosamente')
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    throw error
  }
}

const ProfileUserDetailsScreen = ({ route, navigation }) => {
  const { user } = route.params

  const handleEditPress = () => {
    navigation.navigate('EditProfileUserScreen', { user })
  }

  const handleDeletePress = () => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de que quieres eliminar a ${user.fullName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            deleteUser(user.id)
              .then(() => {
                navigation.goBack()
              })
              .catch((error) => {
                console.error('Error al eliminar usuario:', error)
              })
          },
          style: 'destructive',
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profileImage }} style={styles.userImage} />
      <Text style={styles.label}>Nombre:</Text>
      <Text style={styles.text}>{user.fullName}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.text}>{user.email}</Text>
      <Text style={styles.label}>Dirección:</Text>
      <Text style={styles.text}>{user.address}</Text>
      <Text style={styles.label}>Ciudad:</Text>
      <Text style={styles.text}>{user.city}</Text>
      <Text style={styles.label}>DNI:</Text>
      <Text style={styles.text}>{user.dni}</Text>
      <Text style={styles.label}>Número de Teléfono:</Text>
      <Text style={styles.text}>{user.phoneNumber}</Text>
      <TouchableOpacity style={styles.button} onPress={handleEditPress}>
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeletePress}
      >
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
})

export default ProfileUserDetailsScreen
