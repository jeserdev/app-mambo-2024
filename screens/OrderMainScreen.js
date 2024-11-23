import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native'
import { AuthContext } from '../state/auth.context'
import { push, ref, get, onValue, set, remove } from 'firebase/database'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { database, storage } from '../database/firebase' // Ajusta la ruta según tu estructura de proyecto
import * as Sharing from 'expo-sharing'
import OrderItem from '../components/OrderItem'
import { useNavigation } from '@react-navigation/native'
import Papa from 'papaparse'
import * as FileSystem from 'expo-file-system'
import { Ionicons } from '@expo/vector-icons'
import OrderGeneralItem from '../components/OrderGeneralItem'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import moment from 'moment-timezone'
import { getAuth } from 'firebase/auth' // Importar getAuth

const OrderMainScreen = () => {
  const { userData } = useContext(AuthContext)
  const navigation = useNavigation()
  const [orders, setOrders] = useState([])
  const [productStatus, setProductStatus] = useState({})

  const statusOptions = [
    'Pendiente',
    'Recibido',
    'Seleccionado',
    'Enviado',
    'Entregado',
    'Cancelado',
  ]

  const [filteredOrders, setFilteredOrders] = useState([])

  const [showButton, setShowButton] = useState(false)

  const [ordersRefresh, setOrdersRefresh] = useState(false)

  const getCurrentUserRole = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        // Aquí debes obtener el rol del usuario desde Firebase (por ejemplo, desde un documento en Firestore o un nodo en Realtime Database)
        const userRoleSnapshot = await get(
          ref(database, `users/${user.uid}/role`)
        )
        const userRole = userRoleSnapshot.val()
        return userRole
      }
      return null // O algún valor por defecto si el usuario no está autenticado
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error)
      return null // Manejar el error adecuadamente
    }
  }

  useEffect(() => {
    if (!userData) {
      console.log('No user data available')
      return
    }

    const orderRef = ref(database, 'orders-send')

    const unsubscribe = onValue(orderRef, (snapshot) => {
      const data = snapshot.val()
      console.log('Snapshot data:', data)

      if (data) {
        let orders = Object.keys(data)
          .flatMap((userKey) => {
            if (data[userKey]) {
              return Object.keys(data[userKey]).map((orderKey) => {
                if (data[userKey][orderKey]) {
                  return {
                    orderId: orderKey,
                    userId: userKey,
                    status: data[userKey][orderKey].items[0]?.status,
                    imageUrl: data[userKey][orderKey].items[0]?.imageUrl,
                    ...data[userKey][orderKey],
                  }
                }
                return null
              })
            }
            return []
          })
          .filter((order) => order !== null)

        console.log('Unfiltered Orders:', orders)

        const hasPendingOrders = orders.some(
          (order) =>
            !order.orderReceived &&
            order.statusOrder !== 'Recibido' &&
            order.statusOrder !== 'Cancelado'
        )
        setShowButton(userData.role !== 'Cliente' && hasPendingOrders)

        if (userData.role === 'Cliente') {
          orders = orders.filter((order) => order.userId === userData.uid)
        } else {
          orders = orders.filter(
            (order) => !order.orderReceived && order.statusOrder !== 'Recibido'
          )
        }

        console.log('Filtered Orders:', orders)
        setOrders(orders)
        setFilteredOrders(orders)
      } else {
        console.log('No data available in snapshot')
        setOrders([])
        setFilteredOrders([])
        setShowButton(false)
      }
    })

    return () => unsubscribe()
  }, [userData, ordersRefresh])

  const productSummary = orders.reduce((summary, order) => {
    if (order.items) {
      order.items.forEach((item) => {
        if (
          item &&
          item.producto &&
          item.cantidad &&
          item.unidad &&
          item.imageUrl &&
          item.status
        ) {
          const key = `${item.producto}-${item.unidad}`
          if (summary[key]) {
            summary[key] = {
              quantity: summary[key].quantity + item.cantidad,
              unidad: item.unidad,
              imageUrl: item.imageUrl,
              status: item.status,
            }
          } else {
            summary[key] = {
              quantity: item.cantidad,
              unidad: item.unidad,
              status: item.status,
              imageUrl: item.imageUrl,
            }
          }
        }
      })
    }
    return summary
  }, {})

  const productSummaryData = Object.entries(productSummary).map(
    ([name, { unidad, status, quantity }]) => ({
      name,
      quantity,
      unidad,
      status,
      imageUrl: productSummary[name].imageUrl,
    })
  )

  const handleStatusChange = (newStatus, productName) => {
    setProductStatus((prevStatus) => ({
      ...prevStatus,
      [productName]: newStatus,
    }))

    const [producto, unidad] = productName.split('-')

    orders.forEach((order) => {
      order.items.forEach((item, index) => {
        if (item.producto === producto && item.unidad === unidad) {
          const itemRef = ref(
            database,
            `orders-send/${order.userId}/${order.orderId}/items/${index}`
          )
          set(itemRef, {
            ...item,
            status: newStatus,
          })
            .then(() => {
              console.log(`Updated status for ${productName} to ${newStatus}`)
            })
            .catch((error) => {
              console.error('Error updating status:', error)
            })
        }
      })
    })
  }

  const handleSendOrders = async () => {
    try {
      const today = moment().tz('Europe/Madrid').startOf('day').toISOString()

      const statusMap = {
        Pendiente: 'Recibido',
        Recibido: 'Seleccionado',
        Seleccionado: 'Enviado',
        Enviado: 'Entregado',
        Entregado: 'Cancelado',
        Cancelado: 'Pendiente',
      }

      const ordersSnapshot = await get(ref(database, 'orders-send'))
      const allOrders = ordersSnapshot.val()

      let maxOrderCut = 0
      for (const userId in allOrders) {
        for (const orderId in allOrders[userId]) {
          const order = allOrders[userId][orderId]
          if (order.orderCut && order.orderCut > maxOrderCut) {
            maxOrderCut = order.orderCut
          }
        }
      }

      const newOrderCut = maxOrderCut + 1
      console.log('Nuevo valor de orderCut:', newOrderCut)

      const updatedOrders = orders.map((order) => {
        const updatedItems = order.items.map((item) => {
          if (item.status in statusMap) {
            return { ...item, status: statusMap[item.status] }
          }
          return item
        })

        const allItemsReceived = updatedItems.every(
          (item) => item.status === 'Recibido'
        )
        const allItemsSelected = updatedItems.every(
          (item) => item.status === 'Seleccionado'
        )
        const allItemsSent = updatedItems.every(
          (item) => item.status === 'Enviado'
        )
        const allItemsDelivered = updatedItems.every(
          (item) => item.status === 'Entregado'
        )
        const anyItemPending = updatedItems.some(
          (item) => item.status === 'Pendiente'
        )

        let newStatusOrder = order.statusOrder
        let orderReceived = order.orderReceived
        let orderReceivedDate = order.orderReceivedDate

        if (allItemsDelivered) {
          newStatusOrder = 'Entregado'
        } else if (allItemsSent) {
          newStatusOrder = 'Enviado'
        } else if (allItemsSelected) {
          newStatusOrder = 'Seleccionado'
        } else if (allItemsReceived) {
          newStatusOrder = 'Recibido'
          if (!orderReceived) {
            orderReceived = true
            orderReceivedDate = today
          }
        } else if (anyItemPending) {
          newStatusOrder = 'Pendiente'
        }

        const orderCut = order.orderCut || newOrderCut

        const updatedOrder = {
          ...order,
          items: updatedItems,
          statusOrder: newStatusOrder,
          orderReceived: orderReceived,
          orderReceivedDate: orderReceivedDate,
          orderCut: orderCut,
        }

        console.log('Pedido actualizado:', updatedOrder)
        return updatedOrder
      })

      const orderPromises = updatedOrders.map(async (order) => {
        const { status, ...orderWithoutStatus } = order
        const orderRef = ref(
          database,
          `orders-send/${order.userId}/${order.orderId}`
        )
        await set(orderRef, orderWithoutStatus)
        console.log('Guardado en Firebase:', orderWithoutStatus)
      })
      await Promise.all(orderPromises).then(() => {
        // Esperar a que todas las promesas se resuelvan y actualizar el estado
        setOrders(updatedOrders)
        Alert.alert(
          'Éxito',
          'Los estados de los pedidos han sido actualizados.'
        )
      })

      return updatedOrders // Retornar el arreglo updatedOrders
    } catch (error) {
      console.error('Error al cambiar los estados de los pedidos:', error)
      Alert.alert(
        'Error',
        'Hubo un error al actualizar los estados de los pedidos.'
      )
      return []
    }
  }

  // Asegúrate de que esta función se llame cuando el usuario sea "Administrador"
  const handleAdminSendOrders = async () => {
    const currentUserRole = await getCurrentUserRole()
    if (currentUserRole === 'Administrador') {
      try {
        const updatedOrders = await handleSendOrders() // Esperar a que handleSendOrders se complete

        if (!updatedOrders || updatedOrders.length === 0) {
          console.log('No hay pedidos para procesar.')
          return
        }

        // Crear el nodo de corte temporal
        const db = getDatabase()
        const cutsRef = ref(db, 'cutsInProgress')
        const newCutRef = push(cutsRef) // Usar push para crear un nuevo nodo con ID único
        const newCutId = newCutRef.key

        // Filtrar los pedidos que cumplen las condiciones (orderReceived: true y orderCut válido)
        const ordersToInclude = updatedOrders.filter(
          (order) =>
            order.orderReceived &&
            (order.orderCut === 1 ||
              order.orderCut === 2 ||
              order.orderCut === 3)
        )

        // Guardar los pedidos completos en el nodo del corte
        const ordersData = {}
        ordersToInclude.forEach((order) => {
          ordersData[order.orderId] = order
        })
        await set(newCutRef, { orders: ordersData }) // Guardar los datos del corte
        console.log('Corte creado exitosamente con ID:', newCutId);
        return ordersToInclude; 
      } catch (error) {
        console.error('Error al crear el corte:', error)
        Alert.alert('Error', 'Hubo un error al procesar el corte.')
      }
    } else {
      Alert.alert(
        'Acceso denegado',
        'Solo los administradores pueden actualizar todos los pedidos.'
      )
    }
  }

  const onSendOrdersButtonPress = async () => {
    try {
      const updatedOrders = await handleAdminSendOrders() 
      console.log('updatedOrders: ', updatedOrders)
  
      if (updatedOrders && updatedOrders.length > 0) { 
        Alert.alert('Genial Realizaste un corte', 'Los estados de los pedidos han sido actualizado y se ha enviado un correo con un pdf adjunto de la orden de compra para todos los productos.')
      } else {
        Alert.alert('Error','No se pudo procesar el corte. Verifica los logs para más detalles.') 
      }
    } catch (error) {
      console.error('Error al enviar pedidos:', error)
      Alert.alert('Error', 'Hubo un error al enviar los pedidos.')
    }
  }

  
  const pickerItemStyles = StyleSheet.create({
    pickerItem: {
      backgroundColor: '#000',
    },
    pendiente: {
      color: '#fecc47',
    },
    recibido: {
      color: '#249D8C',
    },
    seleccionado: {
      color: '#fa990e',
    },
    enviado: {
      color: '#5b8d27',
    },
    entregado: {
      color: '#114b0b',
    },
    cancelado: {
      color: '#FF6347',
    },
  })

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Pedido General Order main</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Producto</Text>
            <Text style={styles.tableCell}>Estado del producto</Text>
          </View>

          {productSummaryData.length > 0 ? (
            productSummaryData.map((item) => (
              <OrderGeneralItem
                key={item.name}
                item={item}
                statusOptions={statusOptions}
                productStatus={productStatus}
                handleStatusChange={handleStatusChange}
                pickerItemStyles={pickerItemStyles}
              />
            ))
          ) : (
            <Text>No hay productos resumidos</Text>
          )}

          {showButton && ( // Renderizado condicional del botón
            <TouchableOpacity onPress={onSendOrdersButtonPress}>
              <View style={styles.buttonContainer}>
                <Text style={styles.buttonText}>
                  Cambiar estados de pedidos
                </Text>
                <Ionicons
                  name="checkmark-done-outline"
                  size={30}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
          )}

          
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderMainScreenCutsOne')}
          >
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Ver Corte 1</Text>
              {/* O el ícono que prefieras */}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OrderMainScreenCutsTwo')}
          >
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Ver Corte 2</Text>
              {/* O el ícono que prefieras */}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OrderMainScreenCutsThree')}
          >
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Ver Corte 3</Text>
              {/* O el ícono que prefieras */}
            </View>
          </TouchableOpacity>

          <View style={styles.header2}>
            <Text style={styles.title}>Órdenes de Pedidos</Text>
          </View>
        </>
      }
      data={orders}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => <OrderItem order={item} />}
    />
  )
}

const styles = {
  container: {
    flex: 1,
    padding: 0,
    marginVertical: '5%',
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginVertical: '2%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff',
  },
  header2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff',
    marginVertical: '2%',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
    width: '70%',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    height: 40,
  },
  buttonText: {
    color: '#fff',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: '2%',
  },
}

export default OrderMainScreen
