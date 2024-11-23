import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons' // Importa Ionicons

const OrderItem = ({ order }) => {
  const navigation = useNavigation()

  const handlePress = () => {
    console.log('Pressed order ID:', order.orderId)
    if (order.orderId) {
      navigation.navigate('OrderDetailsScreen', { orderId: order.orderId })
    } else {
      console.log('No order ID')
    }
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.orderContainer}>
      <View style={styles.textContainer}>
        {/* Aquí estás mostrando el ID del pedido. Si no hay un ID de pedido, muestras un espacio en blanco. */}
        <Text style={styles.orderId}>
          Order ID
          {order.orderId ? order.orderId.substring(0, 8) : ' '}
        </Text>
        {/* Aquí estás mostrando el estado del pedido. Si no hay un estado de pedido, muestras 'No Status'. */}
        <Text style={styles.orderStatus}>
          Estado:
          {order.statusOrder ? order.statusOrder : ' No Status'}
        </Text>
        {/* Aquí estás mostrando la fecha del pedido. Si no hay una fecha de pedido, muestras 'No Date'. */}
        <Text style={styles.orderDate}>
          Fecha:
          {order.fecha ? new Date(order.fecha).toLocaleDateString() : 'No Date'}
        </Text>


        
      </View>
      <View style={styles.iconContainer}>
        <Ionicons name="receipt-outline" size={34} color="#ed7400" />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  orderContainer: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 0.7, // Ocupa el 70% del espacio disponible
  },
  iconContainer: {
    flex: 0.3, // Ocupa el 30% del espacio disponible
    justifyContent: 'center', // Centra el icono verticalmente
    alignItems: 'center', // Centra el icono horizontalmente
  },
  orderId: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 16,
    marginBottom: 5,
  },
})

export default OrderItem
