import { database } from '../database/firebase'
import { get, ref, push } from 'firebase/database'

// Función para obtener los pedidos preliminares desde la base de datos
export const fetchPreliminaryOrders = async () => {
  try {
    const ordersRef = ref(database, 'pedidos_preliminares')
    const snapshot = await get(ordersRef)
    if (snapshot.exists()) {
      const ordersData = snapshot.val()
      // Convertir el objeto de pedidos en un array de pedidos
      const ordersArray = Object.values(ordersData)
      return ordersArray
    } else {
      return []
    }
  } catch (error) {
    console.error('Error al obtener pedidos preliminares:', error)
    throw error
  }
}

// Función para agregar un pedido preliminar a la base de datos
export const addPreliminaryOrder = async (orderData) => {
  try {
    const ordersRef = ref(database, 'pedidos_preliminares')
    await push(ordersRef, orderData)
    console.log('Pedido preliminar agregado correctamente')
  } catch (error) {
    console.error('Error al agregar pedido preliminar:', error)
    throw error
  }
}
