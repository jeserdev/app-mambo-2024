import React, { useState } from 'react'
import { View, Button } from 'react-native'
import CartScreen from '../screens/CartScreen'

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product) => {
    console.log('Datos a agregar al carrito:', product) // Verifica si los datos llegan aquí correctamente
    setCartItems([...cartItems, product])
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <View>
      {/* Botón para navegar a la pantalla del carrito */}
      <Button
        title="Ver carrito"
        onPress={() => navigation.navigate('CartScreen', { cartItems })}
      />
      {/* Componente CartScreen que muestra los elementos del carrito */}
      <CartScreen cartItems={cartItems} />
    </View>
  )
}

export default ShoppingCart
