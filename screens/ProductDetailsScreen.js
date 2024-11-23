import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Button,
  Platform,
} from 'react-native'
import { ref, set, child, get, remove } from 'firebase/database'
import { useNavigation } from '@react-navigation/native'
import { database } from '../database/firebase'
import { AuthContext } from '../state/auth.context'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import { getAuth } from 'firebase/auth'
import { RadioButton } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { CartContext } from '../context/cart-context'

const ProductDetailsScreen = ({ route }) => {
  const [selectedOption, setSelectedOption] = useState('')
  const [product, setProduct] = useState({})
  const navigation = useNavigation()
  const { isLoggedIn, userData } = useContext(AuthContext)
  const [quantity, setQuantity] = useState(1)
  const [maduracion, setMaduracion] = useState('1')
  const [selectedMaduracion, setSelectedMaduracion] = useState(
    product.maduracion || '1'
  )
  const { addToCart, removeFromCart, updateProductCount } =
    useContext(CartContext) // Ahora podemos usar updateCartUpdated en CartItem

  const [stock, setStock] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showText, setShowText] = useState(false)
  const [unit, setUnit] = useState('')

  useEffect(() => {
    if (route.params && route.params.productId) {
      const productRef = ref(
        database,
        `product-items/${route.params.productId}`
      )

      get(productRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const productData = snapshot.val()
            setProduct(productData)
            setShowText(productData.maduracion === 'si')

            // Initialize unit here
            if (productData.boxesAvailable > 0) setUnit('cajas')
            else if (productData.kilosAvailable > 0) setUnit('kilos')
            else if (productData.sacosPreAvailable > 0) setUnit('sacos')
            else if (productData.manojosAvailable > 0) setUnit('manojos')
            else if (productData.paletAvailable > 0) setUnit('palet')
            else setUnit('')
          } else {
            console.log('Product not found in database.')
            Alert.alert(
              'Producto no encontrado',
              'El producto que busca no se encuentra disponible.'
            )
          }
        })
        .catch((error) => {
          console.error('Error fetching product details:', error)
          Alert.alert(
            'Error',
            'Ocurrió un error al obtener los detalles del producto.'
          )
        })
    }
  }, [route.params, maduracion])

  useEffect(() => {
    switch (unit) {
      case 'cajas':
        setStock(product.boxesAvailable || 0)
        break
      case 'kilos':
        setStock(product.kilosAvailable || 0)
        break
      case 'sacos':
        setStock(product.sacosPreAvailable || 0)
        break
      case 'manojos':
        setStock(product.manojosAvailable || 0)
        break
      case 'palet':
        setStock(product.paletAvailable || 0)
        break
      default:
        setStock(0)
    }
  }, [unit, product])

  const handleSelectMaduracion = (newValue) => {
    setSelectedMaduracion(newValue) // Actualiza el estado correcto
  }

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
        cajas: product.boxesAvailable,
        kilos: product.kilosAvailable,
        sacos: product.sacosPreAvailable,
        manojos: product.manojosAvailable,
        palet: product.paletAvailable,
        options: product.options, // asegúrate de que 'product.options' contiene todas las opciones disponibles
        option: selectedOption, // la opción seleccionada
        valuecart: 1,
      }

      const productRef = child(ordersRef, product.id)
      const snapshot = await get(productRef)

      if (snapshot.exists()) {
        const existingOrder = snapshot.val()
        existingOrder.cantidad = quantity // Set the quantity of the existing product
        existingOrder.unidad = unit // Update the unit of the existing product
        existingOrder.imageUrl = product.imageUrl // Update the imageUrl of the existing product
        existingOrder.cajas = product.boxesAvailable // Update the cajas of the existing product
        existingOrder.kilos = product.kilosAvailable // Update the kilos of the existing product
        existingOrder.sacos = product.sacosPreAvailable // Update the sacos of the existing product
        existingOrder.manojos = product.manojosAvailable // Update the manojos of the existing product
        existingOrder.palet = product.paletAvailable // Update the palet of the existing product
        existingOrder.option = selectedOption // Update the option of the existing product

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
        } else if (unit === 'sacos') {
          productData.sacosAvailable -= quantity
        } else if (unit === 'palet') {
          productData.paletAvailable -= quantity
        } else if (unit === 'manojos') {
          productData.manojosAvailable -= quantity
        }
        await set(productStockRef, productData)
      }

      addToCart({ id: product.id, count: quantity, ...newOrder })
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

  const handleEditProduct = () => {
    navigation.navigate('EditProductScreen', { productId: product.id })
  }

  const handleDeleteProduct = () => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: deleteProduct },
      ]
    )
  }

  const deleteProduct = () => {
    const productRef = ref(database, `product-items/${product.id}`)
    remove(productRef)
      .then(() => {
        Alert.alert('Éxito', 'Producto eliminado correctamente.')
        navigation.navigate('ProductStack', { screen: 'MainScreen' });
      })
      .catch((error) => {
        console.error('Error deleting product:', error)
        Alert.alert('Error', 'Ocurrió un error al eliminar el producto.')
      })
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
    } else if (selectedUnit === 'sacos') {
      product.sacosAvailable = parseInt(product.sacosAvailable) || 0
      setStock(product.sacosAvailable)
    } else if (selectedUnit === 'palet') {
      product.paletAvailable = parseInt(product.paletAvailable) || 0
      setStock(product.paletAvailable)
    } else if (selectedUnit === 'manojos') {
      product.manojosAvailable = parseInt(product.manojosAvailable) || 0
      setStock(product.manojosAvailable)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product && (
        <>
          <View style={styles.imageContainer}>
            {product.imageUrl && (
              <Image source={{ uri: product.imageUrl }} style={styles.image} />
            )}

            <View style={styles.column1}>
              <Text style={styles.labelTitle}>
                {product.name}, Cat: {product.quality}
              </Text>
            </View>
          </View>

          <View style={styles.infoContainer1}>
            <View style={styles.column1}>
              <Text style={styles.textDesc}>
                {product.country && `Origen: ${product.country}`}
                {product.brand && `, Marca: ${product.brand}`}
                {product.variety && `, Variedad: ${product.variety}`}
                {/* 
                {product.kilosAvailable > 0 &&
                  `, Kilos Disponibles: ${product.kilosAvailable}`}
                {product.boxesAvailable > 0 &&
                  `, Cajas Disponibles: ${product.boxesAvailable}`}
                {product.sacosPreAvailable > 0 &&
                  `, Sacos de: ${product.sacosPreAvailable} Kilos`}
                {product.tare > 0 && `, Tara del ${product.tare} %.`}
               */}{' '}
                Unidad:{' '}
                {product.units &&
                  Object.entries(product.units)
                    .filter(([key, value]) => value === true)
                    .map(([key, value]) => <Text key={key}> {key}</Text>)}
              </Text>

              <Text style={styles.textSub}>
                Disponibilidad: {product.availability}
              </Text>

              <View style={styles.container}>
                {showText && (
                  <Text style={styles.textSub}>
                    {product.maduracion && `Maduración: ${product.maduracion}`}
                  </Text>
                )}
              </View>

              <Text style={styles.textSub}>Seleciona las unidades:</Text>

              <RadioButton.Group
                onValueChange={(newValue) => setUnit(newValue)}
                value={unit}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 10,
                      margin: 10,
                    }}
                  >
                    {product.boxesAvailable > 0 && (
                      <View
                        style={{
                          backgroundColor:
                            unit === 'cajas' ? '#bdecb6' : '#f3f3f3',
                          flexDirection: 'row',
                          alignItems: 'center',

                          borderRadius: 100,
                          padding: 4,
                          width: 100,
                        }}
                      >
                        <RadioButton
                          value="cajas"
                          color="#191919"
                          uncheckedColor="#808080"
                        />
                        <Text
                          style={{
                            color: unit === 'cajas' ? '#191919' : '#808080',
                          }}
                        >
                          Cajas
                        </Text>
                      </View>
                    )}
                    {product.kilosAvailable > 0 && (
                      <View
                        style={{
                          backgroundColor:
                            unit === 'kilos' ? '#bdecb6' : '#f3f3f3',
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 100,
                          padding: 4,
                          width: 100,
                        }}
                      >
                        <RadioButton
                          value="kilos"
                          color="#191919"
                          uncheckedColor="#808080"
                        />
                        <Text
                          style={{
                            color: unit === 'kilos' ? '#191919' : '#808080',
                          }}
                        >
                          Kilos
                        </Text>
                      </View>
                    )}
                    {product.sacosPreAvailable > 0 && (
                      <View
                        style={{
                          backgroundColor:
                            unit === 'sacos' ? '#bdecb6' : '#f3f3f3',
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 100,
                          padding: 4,
                          width: 100,
                        }}
                      >
                        <RadioButton
                          value="sacos"
                          color="#191919"
                          uncheckedColor="#808080"
                        />
                        <Text
                          style={{
                            color: unit === 'sacos' ? '#191919' : '#808080',
                          }}
                        >
                          Sacos
                        </Text>
                      </View>
                    )}
                    {product.manojosAvailable > 0 && (
                      <View
                        style={{
                          backgroundColor:
                            unit === 'manojos' ? '#bdecb6' : '#f3f3f3',
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 100,
                          padding: 4,
                          width: 100,
                        }}
                      >
                        <RadioButton
                          value="manojos"
                          color="#191919"
                          uncheckedColor="#808080"
                        />
                        <Text
                          style={{
                            color: unit === 'manojos' ? '#191919' : '#808080',
                          }}
                        >
                          Manojos
                        </Text>
                      </View>
                    )}
                    {product.paletAvailable > 0 && (
                      <View
                        style={{
                          backgroundColor:
                            unit === 'palet' ? '#bdecb6' : '#f3f3f3',
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 100,
                          padding: 4,
                          width: 100,
                        }}
                      >
                        <RadioButton
                          value="palet"
                          color="#191919"
                          uncheckedColor="#808080"
                        />
                        <Text
                          style={{
                            color: unit === 'palet' ? '#191919' : '#808080',
                          }}
                        >
                          Palet
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </RadioButton.Group>
            </View>

            <View style={styles.container}>
              {showText && (
                <Text style={styles.textSub}>Opciones del producto:</Text>
              )}
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',

                padding: 0,
                margin: 0,
              }}
            >
              <RadioButton.Group
                onValueChange={(newValue) => setSelectedOption(newValue)}
                value={selectedOption}
              >
                <View
                  style={{
                    flexDirection: 'row', // Alinea los elementos de RadioButton en una línea horizontal
                    justifyContent: 'center', // Centra los elementos de RadioButton horizontalmente
                    alignItems: 'center', // Centra los elementos de RadioButton verticalmente
                  }}
                >
                  {Object.entries(product.options || {}).map(
                    ([option, available]) => {
                      if (available) {
                        return (
                          <View
                            key={option}
                            style={{
                              backgroundColor:
                                selectedOption === option
                                  ? '#bdecb6'
                                  : '#f3f3f3',
                              flexDirection: 'row',
                              alignItems: 'center',
                              borderRadius: 30,
                              padding: 8,
                              margin: 10, // Añade un margen para separar los elementos de RadioButton
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  selectedOption === option
                                    ? '#191919'
                                    : '#808080',
                              }}
                            >
                              {option}
                            </Text>
                            <RadioButton
                              value={option}
                              color="#191919"
                              uncheckedColor="#808080"
                            />
                          </View>
                        )
                      }
                    }
                  )}
                </View>
              </RadioButton.Group>
            </ScrollView>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecreaseQuantity}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={{ marginHorizontal: 10, fontSize: 28 }}
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
          </View>

          <View style={styles.containerButton}>
            <View style={styles.container}>
              {stock !== undefined && ( // Only display if stock is available
                <View>
                  <View style={styles.textStock}>
                    <Text style={{ textAlign: 'center' }}>
                      Stock disponible:{' '}
                      {unit === 'cajas'
                        ? `${product.boxesAvailable} Cajas`
                        : unit === 'kilos'
                        ? `${product.kilosAvailable} Kilos`
                        : unit === 'sacos'
                        ? `${product.sacosPreAvailable} Sacos`
                        : unit === 'manojos'
                        ? `${product.manojosAvailable} Manojos`
                        : unit === 'palet'
                        ? `${product.paletAvailable} Palets`
                        : '0'}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      {loading && (
                        <ActivityIndicator size="small" color="gray" />
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.container}>
              <TouchableOpacity
                style={styles.addToCart}
                onPress={handleAddToCartClick}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 9,
                  }}
                >
                  <View>
                    <Ionicons name="cart" size={13} color="#fff" />
                  </View>
                  <Text style={{ color: '#fff' }}>Añadir al pedido</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {isLoggedIn && userData && userData.role === 'Administrador' && (
            <View style={styles.infoContainer}>
              <View style={styles.buttonContainer}>
                <Ionicons
                  name="create-outline"
                  size={30}
                  color="#373737"
                  onPress={handleEditProduct}
                />
              </View>

              <View style={styles.buttonContainer2}>
                <Ionicons
                  name="trash-outline"
                  size={30}
                  color="#373737"
                  onPress={handleDeleteProduct}
                />
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  ButtonCart: {
    marginRight: 0,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    margin: 10,
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
    marginTop: 0,
    padding: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '100',
    marginTop: 0,
    color: '#024936',
  },
  labelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#024936',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    color: '#024936',
  },

  textSub: {
    fontSize: 16,
    marginTop: 5,
    color: '#024936',
    paddingBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },

  textDesc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },

  addToCart: {
    backgroundColor: '#ed7400',
    padding: 0,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 0,
    flexDirection: 'flex',
    justifyContent: 'center',
    borderRadius: 60,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  buttonContainer: {
    marginTop: 0,
    alignItems: 'flex-start',
    width: '40%',
  },
  buttonContainer2: {
    marginTop: 0,
    alignItems: 'flex-end',
    width: '40%',
  },

  header: {
    flexDirection: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff', // Optional: Set background color for the header
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginRight: 0,
  },
  ButtonAdd: {
    width: '100%',
    padding: 5,
    textAlignVertical: 'center',
    marginBottom: 0,
    color: '#fff',
    borderRadius: 60,
    backgroundColor: '#ed7400', // Adjust button color if desired
    justifyContent: 'center',
    alignItems: 'center',

    textAlign: 'center',
  },
  ButtonAdd2: {
    paddingTop: 5,
  },

  quantityContainer: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    justifyContent: 'center',
  },

  textStock: {
    marginTop: 10,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textStock2: {
    marginTop: -18,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    backgroundColor: '#f3f3f3',
    fontSize: 35,
    width: 50,
    fontWeight: '100',
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#191919',
    borderRadius: 100,
    borderWidth: 1,
    marginTop: 5,
  },
  column1: {
    fontSize: 15,
    fontWeight: '100',
    alignContent: 'center',
    justifyContent: 'center',
    color: '#191919',
    marginTop: 0,
    padding: 0,
  },
})

export default ProductDetailsScreen
