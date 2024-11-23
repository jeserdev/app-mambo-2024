import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { database } from '../database/firebase';
import { ref, get, update, remove } from 'firebase/database';
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg';

const ProfileUser = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = getAuth().currentUser;
      const userRef = ref(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser(userData);
      } else {
        Alert.alert('Error', 'No se encontraron datos del usuario');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error.message);
      Alert.alert('Error', 'Error al obtener datos del usuario. Por favor, inténtalo de nuevo.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
      Alert.alert('Error', 'Error al cerrar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  const handleUpdateUser = () => {
    navigation.navigate('ProfileUserDetails', { user });
  };

  const handleDeleteUser = async () => {
    Alert.alert('Eliminar usuario', '¿Estás seguro de que deseas eliminar tu cuenta?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            const currentUser = getAuth().currentUser;
            const userRef = ref(database, `users/${currentUser.uid}`);
            await remove(userRef);
            await signOut(getAuth());
            navigation.replace('LoginScreen');
          } catch (error) {
            console.error('Error al eliminar usuario:', error.message);
            Alert.alert('Error', 'Error al eliminar usuario. Por favor, inténtalo de nuevo.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <IconMamboCenter style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.userDataContainer}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          <Text style={styles.userInfo}>{`Nombre: ${user.fullName}`}</Text>
          <Text style={styles.userInfo}>{`Correo: ${user.email}`}</Text>
          <Text style={styles.userInfo}>{`Dirección: ${user.address}`}</Text>
          <Text style={styles.userInfo}>{`DNI: ${user.dni}`}</Text>
          <Text style={styles.userInfo}>{`Ciudad: ${user.city}`}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
        <Text style={styles.buttonText}>Actualizar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleDeleteUser}>
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2e8d1',
  },
  header: {
    flexDirection: 'row',
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
  userDataContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    width: '50%',
    height: 40,
    borderRadius: 25,
    backgroundColor: '#ed7400',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ProfileUser;
