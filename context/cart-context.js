import React, { createContext, useState, useEffect, useContext } from 'react'
import { ref, set, get, remove, child, onValue } from 'firebase/database'
import { database } from '../database/firebase'
import { AuthContext } from '../state/auth.context'
import { getAuth } from 'firebase/auth'
import { Alert } from 'react-native'

export const CartContext = createContext({
  cartItems: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  updateProductCount: (productId, count) => {},
  cartUpdated: false,
  updateCartUpdated: () => {},
})

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartUpdated, setCartUpdated] = useState(false)
  const [loading, setLoading] = useState(true)
  const { userData } = useContext(AuthContext) // Obtener datos de usuario

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged(async (user) => {
      if (user) {
        const ordersRef = ref(database, `orders/${user.uid}`)
        onValue(ordersRef, (snapshot) => {
          // Listener para cambios en tiempo real
          const data = snapshot.val()
          if (data) {
            const items = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
            }))
            setCartItems(items) // Actualiza cartItems cuando cambia en Firebase
          } else {
            setCartItems([])
          }
        })
      } else {
        setCartItems([])
      }
      setLoading(false)
    })
    return unsubscribe // Devuelve la función para cancelar la suscripción
  }, [])

  const addToCart = async (product) => {
    try {
      const existingProduct = cartItems.find((item) => item.id === product.id)

      if (existingProduct) {
        setCartItems(
          cartItems.map((item) =>
            item.id === product.id ? { ...item, count: item.count + 1 } : item
          )
        )
      } else {
        setCartItems([...cartItems, { ...product, count: 1 }])
      }
      setCartUpdated(!cartUpdated)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const updateProductCount = (productId, count) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, count } : item
      )
    )
    setCartUpdated(!cartUpdated)
  }

  const removeFromCart = async (productId) => {
    try {
      const currentUser = getAuth().currentUser
      const productRef = ref(database, `orders/${currentUser.uid}/${productId}`)
      await remove(productRef)
      console.log('Producto eliminado del carrito en Firebase')

      // update cart item counts in the database
      const ordersRef = ref(database, `orders/${currentUser.uid}`)
      const cartItemsSnapshot = await get(ordersRef)
      if (cartItemsSnapshot.exists()) {
        const cartItemsData = cartItemsSnapshot.val()
        const productIds = Object.keys(cartItemsData)

        // Update the product stock in the database
        const productStockRef = ref(database, `product-items/${productId}`)
        const productSnapshot = await get(productStockRef)
        if (productSnapshot.exists()) {
          const productData = productSnapshot.val()
          productIds.forEach((itemId) => {
            const cartItem = cartItemsData[itemId]
            if (cartItem.unidad === 'kilos') {
              productData.kilosAvailable += cartItem.cantidad
            } else if (cartItem.unidad === 'cajas') {
              productData.boxesAvailable += cartItem.cantidad
            } else if (cartItem.unidad === 'sacos') {
              productData.sacosAvailable += cartItem.cantidad
            } else if (cartItem.unidad === 'palet') {
              productData.paletAvailable += cartItem.cantidad
            } else if (cartItem.unidad === 'manojos') {
              productData.manojosAvailable += cartItem.cantidad
            }
          })
          await set(productStockRef, productData)
        }
      }

      Alert.alert(
        '¡Producto eliminado!',
        'El producto ha sido eliminado del carrito.'
      )
    } catch (error) {
      console.error('Error removing from cart:', error)
      Alert.alert(
        'Error',
        'Hubo un error al eliminar el producto del carrito. Inténtalo de nuevo.'
      )
    }
    setCartUpdated(!cartUpdated)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateProductCount,
        cartUpdated,
        updateCartUpdated: setCartUpdated,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
