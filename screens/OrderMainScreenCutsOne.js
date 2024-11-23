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
import { ref, get, onValue, set, remove } from 'firebase/database'
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

const OrderMainScreenCutOne = () => {
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
          .filter((order) => order !== null) // Filtrar los elementos nulos (órdenes incompletas)

        // Filtrar por orderCut: 1 (para todos los usuarios)
        const filteredOrders = orders.filter((order) => order.orderCut === 1)

        // Verificar si hay pedidos pendientes antes de filtrar (solo para administradores)
        const hasPendingOrders = filteredOrders.some(
          (order) =>
            order.statusOrder !== 'Entregado' &&
            order.statusOrder !== 'Cancelado'
        )
        setShowButton(userData.role !== 'Cliente' && hasPendingOrders)

        // Filtrar las órdenes por usuario (solo para clientes)
        if (userData.role === 'Cliente') {
          orders = filteredOrders.filter(
            (order) => order.userId === userData.uid
          )
        } else {
          orders = filteredOrders // Los administradores ven todos los pedidos con orderCut: 1
        }

        setOrders(orders) // Actualizar el estado de orders
        setFilteredOrders(orders) // Actualizar filteredOrders para el FlatList
      } else {
        setOrders([])
        setFilteredOrders([])
        setShowButton(false) // Ocultar el botón si no hay datos
      }
    })

    return () => unsubscribe()
  }, [userData, ordersRefresh]) // Dependencia de userData y ordersRefresh

  const productSummary = filteredOrders.reduce((summary, order) => {
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
      // Obtener la fecha actual en España
      const today = moment().tz('Europe/Madrid').startOf('day').toISOString()

      const statusMap = {
        Pendiente: 'Recibido',
        Recibido: 'Seleccionado',
        Seleccionado: 'Enviado',
        Enviado: 'Entregado',
        Entregado: 'Cancelado',
        Cancelado: 'Pendiente',
      }

      // Obtener todos los pedidos de Firebase
      const ordersSnapshot = await get(ref(database, 'orders-send'))
      const allOrders = ordersSnapshot.val()

      // Encontrar el valor máximo de orderCut entre todos los pedidos
      let maxOrderCut = 0
      for (const userId in allOrders) {
        for (const orderId in allOrders[userId]) {
          const order = allOrders[userId][orderId]
          if (order.orderCut && order.orderCut > maxOrderCut) {
            maxOrderCut = order.orderCut
          }
        }
      }

      // Incrementar el valor de orderCut para los nuevos pedidos
      const newOrderCut = maxOrderCut + 1
      console.log('Nuevo valor de orderCut:', newOrderCut)

      const updatedOrders = filteredOrders.map((order) => {
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

        // Si el pedido ya tiene un valor de orderCut, conservarlo, de lo contrario, asignar el nuevo valor
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

      // Guardar los pedidos actualizados en Firebase
      const orderPromises = updatedOrders.map(async (order) => {
        const { status, ...orderWithoutStatus } = order // Remover el campo `status` si existe
        const orderRef = ref(
          database,
          `orders-send/${order.userId}/${order.orderId}`
        )
        await set(orderRef, orderWithoutStatus)
        console.log('Guardado en Firebase:', orderWithoutStatus)
      })
      await Promise.all(orderPromises)

      // Actualizar el estado local y mostrar mensaje de éxito
      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders.filter((order) => order.orderCut === 1))
      Alert.alert('Éxito', 'Los estados de los pedidos han sido actualizados.')
    } catch (error) {
      console.error('Error al cambiar los estados de los pedidos:', error)
      Alert.alert(
        'Error',
        'Hubo un error al actualizar los estados de los pedidos.'
      )
    }
  }

  // Asegúrate de que esta función se llame cuando el usuario sea "Administrador"
  const handleAdminSendOrders = async () => {
    const currentUserRole = await getCurrentUserRole() // Implementa esta función para obtener el rol del usuario actual
    if (currentUserRole === 'Administrador') {
      await handleSendOrders()
    } else {
      Alert.alert(
        'Acceso denegado',
        'Solo los administradores pueden actualizar todos los pedidos.'
      )
    }
  }

  // Esta función debería ser llamada en lugar de handleSendOrders para verificar el rol
  const onSendOrdersButtonPress = async () => {
    await handleAdminSendOrders()
  }

  const handleGenerateCSV = async () => {
    try {
      const csv = Papa.unparse(productSummaryData)
      const fileName = FileSystem.documentDirectory + '/data.csv'

      await FileSystem.writeAsStringAsync(fileName, csv)
      console.log(`File written to ${fileName}`)

      const fileRef = storageRef(storage, 'data.csv')
      const response = await fetch(fileName)
      const blob = await response.blob()
      await uploadBytes(fileRef, blob)

      console.log('File uploaded to Firebase Storage')
    } catch (error) {
      console.error(error)
    }
  }

  const downloadCSV = async () => {
    try {
      const fileRef = storageRef(storage, 'data.csv')
      const url = await getDownloadURL(fileRef)

      console.log(`File can be downloaded from ${url}`)

      const path = `${FileSystem.documentDirectory}data.csv`
      const result = await FileSystem.downloadAsync(url, path)
      console.log(`File downloaded and saved to ${result.uri}`)

      if (!(await Sharing.isAvailableAsync())) {
        alert(`Uh oh, sharing isn't available on your platform`)
        return
      }

      await Sharing.shareAsync(result.uri)
    } catch (error) {
      console.error(error)
    }
  }

  const handleGenerateAndDownloadCSV = async () => {
    await handleGenerateCSV()
    downloadCSV()
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
            <Text style={styles.title}>Pedido General one</Text>
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

          <TouchableOpacity onPress={handleGenerateAndDownloadCSV}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Download CSV</Text>
              <Ionicons
                title="Download CSV"
                name="download-outline"
                size={30}
                color="#fff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OrderMainScreenCutsTwo')}
          >
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Ver Cortes de Pedidos 2</Text>
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

export default OrderMainScreenCutOne
