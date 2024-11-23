import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  Button,
  ScrollView,
  TextInput,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { database } from '../database/firebase'
import { ref, onValue, off } from 'firebase/database'
import { IconMamboSearchClose } from '../assets/icons/IconMamboSearchClose'
import { Ionicons } from '@expo/vector-icons'
import { AuthContext } from '../state/auth.context'

const SearchProductScreen = () => {
  const { isLoggedIn, role, userData, isLoading, login, logout } =
    useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const navigation = useNavigation()
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const categories = [
    'Todos',
    ...new Set(
      products
        .map((product) => String(product.category))
        .filter((category) => category !== 'A' && category !== 'undefined')
    ),
  ]

  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  const filteredProducts = products.filter((product) =>
    removeAccents(product.name.toLowerCase()).includes(
      removeAccents(searchQuery.toLowerCase())
    )
  )

  useEffect(() => {
    const productsRef = ref(database, 'product-items')

    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        const productsData = []
        snapshot.forEach((childSnapshot) => {
          const product = childSnapshot.val()
          productsData.push(product)
        })

        const orderedProducts = productsData.sort(
          (a, b) => b.createdAt - a.createdAt
        )
        setProducts(orderedProducts)
      } else {
        console.log('No se encontraron productos en la base de datos.')
      }
    }

    onValue(productsRef, handleData)

    return () => {
      off(productsRef, 'value', handleData)
    }
  }, [])

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('ProductDetailsScreen', { productId: item.id })
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        defaultSource={require('../assets/splash.png')}
      />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
          <View style={styles.searchBoxContainer}>
      <TextInput
        style={styles.searchBox}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar productos..."
      />
      {searchQuery ? (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle" size={20} color="green" />
        </TouchableOpacity>
      ) : null}
    </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  )
}

const { width, height } = Dimensions.get('window')
const itemSize = Math.min(width, height) / 3

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: '#fff',
  },

  searchBoxContainer: {
    flexDirection: 'row',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    margin: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    backgroundColor: 'white',
  },
  itemContainer: {
    width: itemSize,
    height: itemSize,
    margin: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  columnWrapper: {
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'flex',
    padding: 0,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 20,
    height: 20,
    marginRight: 0,
    marginTop: 25,
  },
  categoryButton: {
    padding: 5,
    margin: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 4,
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: '400',
    fontSize: 13,
  },
})

export default SearchProductScreen

console.log(ref(database, 'product-items'))
