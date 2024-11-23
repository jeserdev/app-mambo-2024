import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../state/auth.context'
import { Ionicons } from '@expo/vector-icons'
import { ref, onValue } from 'firebase/database'
import { database } from '../database/firebase'

const ProfileUserMainScreen = () => {
  const { userData, logout } = useContext(AuthContext)
  const navigation = useNavigation()
  const [user, setUser] = useState(null)
  const screenWidth = Dimensions.get('window').width

  useEffect(() => {
    const userId = userData?.uid
    if (userId) {
      const userRef = ref(database, `users/${userId}`)
      const unsubscribe = onValue(userRef, (snapshot) => {
        const userData = snapshot.val()
        // Update only the necessary properties
        setUser((prevUser) => ({
          ...prevUser,
          fullName: userData.fullName,
          email: userData.email,
          profileImage: userData.profileImage,
          phoneNumber: userData.phoneNumber,
          postcode: userData.postcode,
          city: userData.city,
          addresses: userData.addresses,
          role: userData.role,
          uid : userData.uid,
          // ... other properties you need to update
        }))
      })
      return () => unsubscribe()
    }
  }, []) // No dependencies, runs only once when the component mounts

  const handleEditProfile = () => {
    navigation.navigate('EditProfileUserScreen', { user })
  }

  const handleLogout = () => {
    logout() // Llama a la función logout del contexto de autenticación
  }

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.userContainer}>
          <Image source={{ uri: user.profileImage }} style={styles.userImage} />
          <View style={styles.userData}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
            <Text style={styles.userRole}>{user.uid}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={34} color="black" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer2}>
          <TouchableOpacity style={styles.editButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 65,
    height: 65,
    marginRight: 0,
    marginTop: 15,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userData: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    width: '100%',
    height: 40,
    borderRadius: 60,
    backgroundColor: '#ed7400', // Adjust button color if desired
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonDel: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#024936', // Adjust button color if desired
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
    width: '40%',
  },
  buttonContainer2: {
    marginTop: 10,
    alignItems: 'flex-end',
    width: '40%',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
})

export default ProfileUserMainScreen
