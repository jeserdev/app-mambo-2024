import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { getDatabase, ref, remove, set, get, child } from 'firebase/database' // Import Firebase database functions
import { getAuth } from 'firebase/auth'
import { RadioButton } from 'react-native-paper' // Import RadioButton from react-native-paper
import { Ionicons } from '@expo/vector-icons'
import { CartContext } from '../context/cart-context'

const CartItem = ({ item, removeFromCart, updateProductCount }) => {
  const [unit, setUnit] = useState(item.unidad)
  const [selectedOption, setSelectedOption] = useState(item.option)
  const { updateCartUpdated } = useContext(CartContext)

  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const db = getDatabase()
    const productRef = ref(db, `product-items/${item.id}`)
    get(productRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const productData = snapshot.val()
          setShowText(productData.maduracion === 'si') // Mostrar solo si es "si"
        }
      })
      .catch((error) => {
        console.error('Error al obtener maduración:', error)
      })
  }, [item.id])

  console.log('item', selectedOption)

  const handleDelete = async () => {
    try {
      const db = getDatabase()
      const currentUser = getAuth().currentUser
      await remove(ref(db, `orders/${currentUser.uid}/${item.id}`))
      removeFromCart(item.id)

      updateCartUpdated() //  Actualiza el estado del contexto

      // ...
    } catch (error) {
      // ...
    }
  }

  const handleQuantityChange = async (change) => {
    const currentUser = getAuth().currentUser
    const db = getDatabase()
    const ordersRef = ref(db, `orders/${currentUser.uid}`)
    const productRef = child(ordersRef, item.id)
    const snapshot = await get(productRef)

    if (snapshot.exists()) {
      const existingOrder = snapshot.val()
      const newCount = existingOrder.cantidad + change
      if (newCount < 1) {
        const confirm = window.confirm('Do you want to delete this item?')
        if (confirm) {
          await handleDelete()
        } else {
          existingOrder.cantidad = 1
        }
      } else {
        existingOrder.cantidad = newCount
      }
      await set(productRef, existingOrder)
      updateProductCount(item.id, newCount) // Update product count using context
    }
  }

  const handleUnitChange = async (newUnit) => {
    const currentUser = getAuth().currentUser
    const db = getDatabase()
    const ordersRef = ref(db, `orders/${currentUser.uid}`)
    const productRef = child(ordersRef, item.id)
    const snapshot = await get(productRef)

    if (snapshot.exists()) {
      const existingOrder = snapshot.val()
      existingOrder.unidad = newUnit
      await set(productRef, existingOrder)
    }
  }

  const handleOptionChange = async (newOption) => {
    const currentUser = getAuth().currentUser
    const db = getDatabase()
    const ordersRef = ref(db, `orders/${currentUser.uid}`)
    const productRef = child(ordersRef, item.id)
    const snapshot = await get(productRef)

    if (snapshot.exists()) {
      const existingOrder = snapshot.val()
      existingOrder.option = newOption
      await set(productRef, existingOrder)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item.producto}</Text>
      <View style={styles.upperContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
        <View style={styles.imageContainer}>
          <Text style={styles.quantitytext}>Cantidad</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.cantidad}</Text>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.lowerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <RadioButton.Group
            onValueChange={(newValue) => {
              setUnit(newValue)
              handleUnitChange(newValue)
            }}
            value={unit}
          >
            <View style={styles.radioContainer}>
              {item.cajas !== '' && (
                <RadioButton.Item label="Cajas" value="cajas" color="#ed7400" />
              )}
              {item.kilos !== '' && (
                <RadioButton.Item label="Kilos" value="kilos" color="#ed7400" />
              )}
              {item.sacos !== '' && (
                <RadioButton.Item label="Sacos" value="sacos" color="#ed7400" />
              )}
              {item.manojos !== '' && (
                <RadioButton.Item
                  label="Manojos"
                  value="manojos"
                  color="#ed7400"
                />
              )}
              {item.palet !== '' && (
                <RadioButton.Item label="Palet" value="palet" color="#ed7400" />
              )}
            </View>
          </RadioButton.Group>
        </ScrollView>

        <Ionicons
          name="trash-outline"
          size={30}
          color="#373737"
          onPress={handleDelete}
        />
      </View>

      {showText && <Text style={styles.textSub}>Opciones del producto</Text>}
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
          onValueChange={(newValue) => {
            setSelectedOption(newValue)
            handleOptionChange(newValue) // Actualiza la opción seleccionada en la base de datos
          }}
          value={selectedOption}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {Object.entries(item.options || {})
              .sort(([optionA], [optionB]) => {
                if (optionA === selectedOption) return -1
                if (optionB === selectedOption) return 1
                return 0
              })
              .map(([option, available]) => {
                if (available) {
                  return (
                    <View
                      key={option}
                      style={{
                        backgroundColor:
                          selectedOption === option ? '#bdecb6' : '#f3f3f3',
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 30,
                        padding: 8,
                        margin: 10,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedOption === option ? '#191919' : '#808080',
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
              })}
          </View>
        </RadioButton.Group>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderBottomColor: '#DBDBDB',
    borderLeftColor: '#fff',
    borderTopColor: '#fff',
    borderRightColor: '#fff',
    borderRadius: 0,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 0.5,
  },
  quantityContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lowerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  image: {
    width: '100%',
    height: 100,
  },
  name: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  quantitytext: {
    fontSize: 15,
    fontWeight: 'normal',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  quantity: {
    fontSize: 16,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    marginHorizontal: 15,
    backgroundColor: '#ed7400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
})

export default CartItem
