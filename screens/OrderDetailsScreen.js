import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { database } from '../database/firebase'
import { ref, onValue } from 'firebase/database'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import { get } from 'firebase/database'

const OrderDetailsScreen = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)
  const route = useRoute()
  const navigation = useNavigation()
  const [userFullName, setUserFullName] = useState(null)
  const [address, setUserAddress] = useState(null)
  const [phoneNumber, setUserPhoneNumber] = useState(null)

  const orderId = route.params?.orderId

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    const orderRef = ref(database, `orders-send`)
    const unsubscribe = onValue(
      orderRef,
      (snapshot) => {
        const ordersData = snapshot.val()
        let order = null
        let userId = null

        // Find the specific order using the provided orderId
        for (const uid in ordersData) {
          if (ordersData[uid][orderId]) {
            order = ordersData[uid][orderId]
            userId = uid
            break
          }
        }

        if (order) {
          setOrder(order)
          console.log('Order object:', order)

          // Fetch user details
          const userRef = ref(database, `users/${userId}`)
          onValue(
            userRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const fullName = snapshot.val().fullName
                const address = snapshot.val().address // Get the user's address
                const phoneNumber = snapshot.val().phoneNumber
                console.log('User full name:', fullName)
                console.log('User address:', address)
                console.log('User phone number:', phoneNumber)

                setUserFullName(fullName) // Set the user's full name in state
                setUserAddress(address) // Set the user's address in state
                setUserPhoneNumber(phoneNumber) // Set the user's phone number in state
              }
            },
            (error) => {
              console.error(error)
            }
          )
        } else {
          setError('No order found for ID: ' + orderId)
        }
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orderId])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deatlles de la Orden</Text>
      </View>

      <View>
        <Text>Orden ID: {orderId}</Text>
        <Text>Cliente: {userFullName}</Text>
        <Text>Direción: {address}</Text>
        <Text>Telefono: {phoneNumber}</Text>

        {order ? (
          <>
            <Text>Estado: {order.statusOrder}</Text>
            <Text>Fecha: {order.fecha}</Text>
            <View style={styles.itemsContainer}>
              <Text style={styles.headerText}>Productos:</Text>
              <FlatList
                data={order.items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <View style={styles.row}>
                      <View style={styles.textContainer}>
                        <Text style={styles.orderItem}>
                          Producto: {item.producto}
                        </Text>
                        <Text style={styles.orderItem}>
                          Cantidad: {item.cantidad}
                        </Text>
                        <Text style={styles.orderItem}>
                          Unidad:{' '}
                          {item.unidad.charAt(0).toUpperCase() +
                            item.unidad.slice(1)}
                        </Text>
                        <Text style={styles.orderItem}>
                          Estado del producto: {item.status}
                        </Text>
                      </View>
                      {item.imageUrl && (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.productImage}
                        />
                      )}
                    </View>
                  </View>
                )}
              />
            </View>
          </>
        ) : (
          <Text>{loading ? 'Loading order...' : error}</Text>
        )}
      </View>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1, // Distribute remaining space equally among cells
    textAlign: 'center', // Center content within each cell
    alignItems: 'center', // Center content horizontally (in addition to vertically)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 60,
    height: 60,
  },
  // New styles for the table
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1, // Distribute remaining space equally among cells
    textAlign: 'center', // Center content within each cell
  },
  itemsContainer: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  orderItem: {
    marginBottom: 5,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
}

export default OrderDetailsScreen
