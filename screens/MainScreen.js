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
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { database } from '../database/firebase'
import { ref, onValue, off } from 'firebase/database'

import { AuthContext } from '../state/auth.context'

const MainScreen = () => {
  const { isLoggedIn, role, userData, isLoading, login, logout } =
    useContext(AuthContext)
  const [products, setProducts] = useState([])
  const navigation = useNavigation()
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const categories = [
    'Todos',
    ...new Set(
      products
        .map((product) => String(product.category))
        .filter((category) => category !== 'A' && category !== 'undefined' )
    ),
  ]

  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((product) => product.category === selectedCategory)

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
      <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
  {categories.map((category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        { backgroundColor: selectedCategory === category ? '#ed7400' : '#D3D3D3' },
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={styles.categoryButtonText}>{category}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>
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

export default MainScreen

console.log(ref(database, 'product-items'))
