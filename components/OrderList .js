import React from 'react'
import { View } from 'react-native'
import OrderGeneralItem from './OrderGeneralItem'

const OrderList = ({ orders }) => {
  // Comprueba si algún item no tiene imageUrl
  for (let userId in orders['orders-send']) {
    for (let orderId in orders['orders-send'][userId]) {
      for (let item of orders['orders-send'][userId][orderId].items) {
        if (!item.imageUrl) {
          console.log('Item sin imageUrl:', item)
        }
      }
    }
  }

  // Renderiza la lista de OrderGeneralItem
  return (
    <View>
      {orders.map((item, index) => (
        <OrderGeneralItem key={index} item={item} />
      ))}
    </View>
  )
}

export default OrderList
