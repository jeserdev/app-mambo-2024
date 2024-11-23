import React, { useState } from 'react'
import { View, Text, Picker } from 'react-native'
import { update } from 'firebase/database'

const ProductRow = ({ product }) => {
  const status = product.status || 'No Status Available'

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus) // Actualizar el estado local

    // Actualizar el estado en la base de datos Firebase
    update(ref(database, `orders-send/${item.userId}/${item.orderId}/status`), {
      status: newStatus,
    })
  }

  return (
    <View>
      <Text>Producto: {product.name}</Text>
      <Text>Cantidad: {product.quantity}</Text>
      <Text>Unidad: {product.unidad}</Text>
      {/* Conditionally render status if available */}
      {status && <Text>Estado: {status}</Text>}
    </View>
  )
}

export default ProductRow
