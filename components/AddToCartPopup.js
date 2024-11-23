import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native'
import { database } from '../database/firebase'
import { ref, set, child, get } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import { useNavigation } from '@react-navigation/native'
import { RadioButton } from 'react-native-paper'

const AddToCartPopup = ({ product, onClose }) => {
  const navigation = useNavigation()
  const [value, setValue] = useState('bultos')
  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(true) // Ensures modal opens initially

  // Form states
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('kilos')
  const [stock, setStock] = useState(0) // Initialize stock to 0 to avoid errors
  const [loading, setLoading] = useState(false)

  const handleRemoveFromCartClick = async () => {
    try {
      const currentUser = getAuth().currentUser
      const productRef = ref(
        database,
        `orders/${currentUser.uid}/${product.id}`
      )
      await remove(productRef)
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false)
    onClose?.() // Call the provided onClose function if available
  }

  // Function to reset states when the modal opens
  const resetStates = () => {
    setQuantity(1)
    setUnit(product.kilosAvailable ? 'kilos' : 'cajas') // Set unit based on available stock
    setStock(parseInt(product.kilosAvailable || product.boxesAvailable) || 0)
    setLoading(false)
  }

  /// useEffect hook to handle state resets and stock retrieval on modal visibility change
  useEffect(() => {
    if (modalVisible) {
      resetStates()
    }
  }, [modalVisible, product])

  // useEffect hook to fetch initial quantity
  useEffect(() => {
    const fetchInitialQuantity = async () => {
      const initialQuantity = await getInitialQuantity()
      setQuantity(initialQuantity)
    }

    fetchInitialQuantity()
  }, [])

  useEffect(() => {
    if (unit === 'kilos') {
      setStock(parseInt(product.kilosAvailable) || 0)
    } else if (unit === 'cajas') {
      setStock(parseInt(product.boxesAvailable) || 0)
    } else if (unit === 'bultos') {
      setStock(parseInt(product.bultosAvailable) || 0)
    }
  }, [unit, product])

  // Function to add item to cart with Firebase interaction
  // Function to add item to cart with Firebase interaction
  const handleAddToCartClick = async () => {
    setLoading(true) // Set loading state to true

    try {
      const currentUser = getAuth().currentUser
      const ordersRef = ref(database, `orders/${currentUser.uid}`)

      const newOrder = {
        producto: product.name,
        cantidad: quantity,
        unidad: unit,
        userId: currentUser.uid,
        fecha: new Date().toISOString(),
        imageUrl: product.imageUrl, // Add the imageUrl to the order
      }

      const productRef = child(ordersRef, product.id)
      const snapshot = await get(productRef)

      if (snapshot.exists()) {
        const existingOrder = snapshot.val()
        existingOrder.cantidad = quantity // Set the quantity of the existing product
        existingOrder.unidad = unit // Update the unit of the existing product
        existingOrder.imageUrl = product.imageUrl // Update the imageUrl of the existing product
        await set(productRef, existingOrder)
      } else {
        await set(productRef, newOrder)
      }

      // Update the product stock in the database
      const productStockRef = ref(database, `products/${product.id}`)
      const productSnapshot = await get(productStockRef)
      if (productSnapshot.exists()) {
        const productData = productSnapshot.val()
        if (unit === 'kilos') {
          productData.kilosAvailable -= quantity
        } else if (unit === 'cajas') {
          productData.boxesAvailable -= quantity
        } else if (unit === 'bultos') {
          productData.bultosAvailable -= quantity
        }
        await set(productStockRef, productData)
      }

      closeModal() // Close the modal after successful addition

      Alert.alert(
        '¡Pedido agregado!',
        'El producto se ha agregado al carrito de manera exitosa.'
      )
    } catch (error) {
      console.error('Error adding to cart:', error)
      Alert.alert(
        'Error',
        'Error al agregar el producto al carrito. Inténtalo de nuevo.'
      )
    } finally {
      setLoading(false) // Set loading state to false regardless of outcome
    }
  }

  const getInitialQuantity = async () => {
    const currentUser = getAuth().currentUser
    const productRef = child(
      ref(database, `orders/${currentUser.uid}`),
      product.id
    )
    const snapshot = await get(productRef)

    if (snapshot.exists()) {
      return snapshot.val().cantidad
    } else {
      return 1
    }
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleIncreaseQuantity = () => {
    if (quantity + 1 > stock) {
      Alert.alert(
        'Stock insuficiente',
        'No puedes agregar más de este producto porque excede el stock disponible.'
      )
    } else {
      setQuantity(quantity + 1)
    }
  }

  // Function to handle unit changes
  const handleUnitChange = (selectedUnit) => {
    setUnit(selectedUnit)

    // Update stock state based on the new unit
    if (selectedUnit === 'kilos') {
      product.kilosAvailable = parseInt(product.kilosAvailable) || 0
      setStock(product.kilosAvailable)
    } else if (selectedUnit === 'cajas') {
      product.boxesAvailable = parseInt(product.boxesAvailable) || 0
      setStock(product.boxesAvailable)
    } else if (selectedUnit === 'bultos') {
      product.bultosAvailable = parseInt(product.bultosAvailable) || 0
      setStock(product.bultosAvailable)
    }
  }

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainScreen')}>
            <IconMamboCenter style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
        {/* Product name */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'normal',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          {product.name}
        </Text>

        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        </View>

        {/* Quantity selection */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecreaseQuantity}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={{ marginHorizontal: 10, fontSize: 20 }}
            value={quantity.toString()}
            onChangeText={(text) => {
              const value = parseInt(text)
              if (!isNaN(value)) {
                if (value > stock) {
                  setQuantity(stock)
                } else if (value < 1) {
                  setQuantity(1)
                } else {
                  setQuantity(value)
                }
              }
            }}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncreaseQuantity}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Unit selection */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            padding: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              marginHorizontal: 10,
              borderRadius: 50,
              overflow: 'hidden',
            }}
          >
            <Button
              title="Kilos"
              onPress={() => handleUnitChange('kilos')}
              color={unit === 'kilos' ? '#024936' : 'gray'}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginHorizontal: 10,
              borderRadius: 50,
              overflow: 'hidden',
            }}
          >
            <Button
              title="Cajas"
              onPress={() => handleUnitChange('cajas')}
              color={unit === 'cajas' ? '#024936' : 'gray'}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginHorizontal: 10,
              borderRadius: 50,
              overflow: 'hidden',
            }}
          >
            <Button
              title="Bultos"
              onPress={() => handleUnitChange('bultos')}
              color={unit === 'bultos' ? '#024936' : 'gray'}
            />
          </View>
        </View>
        {/* Stock and button (conditionally displayed) */}
        {stock !== undefined && ( // Only display if stock is available
          <View>
            <View>
              <Text style={{ textAlign: 'center' }}>
                Stock disponible: {stock} {unit}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  }}
                >
                  <Button
                    title="Agregar al carrito"
                    onPress={handleAddToCartClick}
                    disabled={loading}
                    color={'#ed7400'}
                    borderRadius={'60'}
                  />
                </View>
                {loading && <ActivityIndicator size="small" color="gray" />}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f3f3f3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 100,
  },

  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#024936',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 90,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#024936',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRef: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#024936',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 20,
    color: '#024936',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginRight: 0,
  },
})

export default AddToCartPopup
