import React, { useState, useEffect, useContext } from 'react'
import {
  ScrollView,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
} from 'react-native'
import { ref, onValue, set, remove } from 'firebase/database'
import { database } from '../database/firebase'
import { getAuth } from 'firebase/auth'
import CartItem from '../components/CartItem'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import moment from 'moment-timezone'
import uuid from 'react-native-uuid'
import { RadioButton, TextInput } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { AuthContext } from '../state/auth.context'
import 'moment/locale/es'

const CartScreen = ({ route }) => {
  const calculateDefaultDeliveryDate = () => {
    const today = new Date()
    const currentHour = today.getHours()
    const currentDay = today.getDay() // 0 (Domingo) a 6 (Sábado)

    // Días laborables para entrega (martes a sábado)
    const workingDays = [2, 3, 4, 5, 6]

    // Si es martes, miércoles, jueves, viernes o sábado entre las 12 AM y las 3 AM, la entrega es el mismo día
    if (
      workingDays.includes(currentDay) &&
      currentHour >= 0 &&
      currentHour < 3
    ) {
      return today
    }

    // Encontrar el siguiente día laborable
    let nextWorkingDay = currentDay // Inicializar nextWorkingDay con el día actual
    do {
      nextWorkingDay = (nextWorkingDay + 1) % 7 // Incrementar el día, volviendo a 0 si llega a 7
    } while (!workingDays.includes(nextWorkingDay)) // Repetir hasta encontrar un día laborable

    // Calcular la fecha del siguiente día laborable
    const nextDayDate = new Date(
      today.setDate(today.getDate() + (nextWorkingDay - currentDay))
    )
    return nextDayDate
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation()
  const { userData } = useContext(AuthContext)
  const [deliveryDate, setDeliveryDate] = useState(
    calculateDefaultDeliveryDate()
  )
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const { removeFromCart, updateProductCount } = route.params

  const [addresses, setAddresses] = useState([]) // Estado para las direcciones
  const [selectedAddress, setSelectedAddress] = useState(null) // Estado para la dirección seleccionada

  useEffect(() => {
    const userId = userData?.uid

    if (userId) {
      const ordersRef = ref(database, `orders/${userId}`)
      const userRef = ref(database, `users/${userId}`)

      // Cargar las direcciones del usuario
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setAddresses(data.addresses || [])
          setSelectedAddress(data.addresses ? data.addresses[0] : null)
        } else {
          setAddresses([])
          setSelectedAddress(null)
        }
      })

      const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const items = Object.entries(data)
            .filter(([id, value]) => value.userId === userId)
            .map(([id, value]) => ({
              id,
              ...value,
            }))
          setCartItems(items)
        } else {
          setCartItems([])
        }
        setLoading(false)
      })

      return () => {
        unsubscribeUser()
        unsubscribeOrders()
      }
    }
  }, []) // Ejecutar solo una vez cuando el componente se monta

  const ProductConfirmationStep = ({ cartItems, onNextStep }) => {
    return (
      <View>
        <Text style={styles.headertext}>Confirmar el pedido:</Text>
        <FlatList
          data={cartItems}
          renderItem={({ item }) => (
            <CartItem
              item={item}
              removeFromCart={removeFromCart}
              updateProductCount={updateProductCount}
            />
          )}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity style={styles.button} onPress={onNextStep}>
          <Text style={styles.buttonText}>Siguiente </Text>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    )
  }

  // Paso 2: Dirección de entrega
  const DeliveryAddressStep = ({ onNextStep, onPreviousStep }) => {
    return (
      <View>
        <Text style={styles.headertext}>Dirección de entrega:</Text>
        {addresses.map((address, index) => (
          <TouchableOpacity
            key={index}
            style={styles.addressOption}
            onPress={() => setSelectedAddress(address)}
          >
            <Text style={styles.addressOptionText}>{address}</Text>
            <RadioButton
              value={index} // Usar el índice como valor
              status={selectedAddress === address ? 'checked' : 'unchecked'}
              onPress={() => setSelectedAddress(address)}
            />
          </TouchableOpacity>
        ))}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onPreviousStep}>
            <Ionicons
              name="arrow-back-circle-outline"
              size={24}
              color="white"
            />
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onNextStep}>
            <Text style={styles.buttonText}>Siguiente </Text>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const DeliveryDateStep = ({
    deliveryDate,
    onDateChange,
    onNextStep,
    onPreviousStep,
  }) => {
    const formattedDate = moment(deliveryDate).locale('es').format('LL') // Ejemplo: 3 de julio de 2024

    // Calcular el día de entrega en función de la fecha actual y la hora
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let deliveryDayMessage = ''

    if (
      deliveryDate.getDate() === today.getDate() &&
      deliveryDate.getHours() >= 0 &&
      deliveryDate.getHours() < 3
    ) {
      deliveryDayMessage = 'Hoy'
    } else if (deliveryDate.getDate() === tomorrow.getDate()) {
      deliveryDayMessage = 'Mañana'
    } else {
      deliveryDayMessage = moment(deliveryDate).locale('es').format('dddd') // Ejemplo: Martes
    }

    return (
      <View>
        <Text style={styles.headertext}>Fecha de entrega:</Text>

        {/* Mensaje que indica el día de entrega */}
        <Text style={styles.deliveryDayMessage}>
          Entrega: {deliveryDayMessage}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setDatePickerVisibility(true)}
        >
          <Text style={styles.buttonText}>Seleccionar fecha de entrega </Text>
          <Ionicons name="calendar-outline" size={24} color="white" />
        </TouchableOpacity>
        {isDatePickerVisible && (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()} // Fecha mínima: hoy
            shouldDisableDate={(date) => {
              // Deshabilitar domingos y lunes (0 y 1)
              return date.getDay() === 0 || date.getDay() === 1
            }}
          />
        )}
        <Text style={styles.dateText}>Fecha seleccionada: {formattedDate}</Text>
        <View style={styles.buttonContainer}>
          {currentStep > 1 && ( // Mostrar botón "Anterior" si no es el primer paso
            <TouchableOpacity
              style={styles.button}
              onPress={handlePreviousStep}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={24}
                color="white"
              />
              <Text style={styles.buttonText}>Anterior</Text>
            </TouchableOpacity>
          )}
          {currentStep < 4 && ( // Mostrar botón "Siguiente" si no es el último paso
            <TouchableOpacity style={styles.button} onPress={handleNextStep}>
              <Text style={styles.buttonText}>Siguiente </Text>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  const PaymentMethodStep = ({
    paymentMethod,
    onPaymentMethodChange,
    onPreviousStep,
    onSendOrder,
  }) => {
    return (
      <View>
        <Text style={styles.headertext}>Método de pago:</Text>

        {['Efectivo', 'Datafono', 'Crédito'].map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentMethodButton,
              paymentMethod === method && styles.selectedPaymentMethod,
            ]}
            onPress={() => onPaymentMethodChange(method)} // Solo cambiar el método de pago
          >
            <Text style={styles.paymentMethodButtonText}>{method}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onPreviousStep}>
            <Ionicons
              name="arrow-back-circle-outline"
              size={24}
              color="white"
            />
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>
          {cartItems.length > 0 && (
            <TouchableOpacity style={styles.button} onPress={onSendOrder}>
              <Text style={styles.buttonText}>Enviar Pedido </Text>
              <Ionicons name="bag-check-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  useEffect(() => {
    const ordersRef = ref(database, `orders/${userData.uid}`)
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const items = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }))
        setCartItems(items)
      } else {
        setCartItems([])
      }
      setLoading(false) // Desactiva loading una vez que se carguen los datos
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userData && userData.address) {
      setDeliveryAddress(userData.address)
    }
  }, [userData])

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1)
  }

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1)
  }

  const handleSendOrder = async () => {
    const orderId = uuid.v4()
    const newOrderRef = ref(database, `orders-send/${userData.uid}/${orderId}`)

    const updatedCartItems = cartItems.map((item) => ({
      ...item,
      precio: 0,
      status: 'Pendiente',
      orderReceived: false,
    }))

    const order = {
      items: updatedCartItems,
      statusOrder: 'Pendiente',
      orderReceived: false,
      fecha: new Date().toISOString(),
      deliveryAddress: selectedAddress,
      deliveryDate: deliveryDate.toISOString(), // Incluye la fecha de entrega
      paymentMethod, // Incluye el método de pago
    }

    await set(newOrderRef, order)

    const ordersRef = ref(database, `orders/${userData.uid}`)
    await remove(ordersRef)

    // Obtiene la hora actual en España
    const currentHour = moment().tz('Europe/Madrid').hour()

    const nextDay = moment()
      .tz('Europe/Madrid')
      .add(1, 'days')
      .format('DD-MM-YYYY')

    // Muestra una alerta diferente dependiendo de la hora
    if (currentHour >= 12 || currentHour < 2) {
      Alert.alert(
        'Pedido enviado',
        'Se ha enviado tu pedido. Te confirmaremos cuando esté listo.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      )
    } else {
      Alert.alert(
        'Pedido enviado pero la entrega no será hoy',
        `Se ha enviado tu pedido. La entrega se realizará el día ${nextDay}`,
        [{ text: 'VALE', onPress: () => console.log('OK Pressed') }]
      )
    }

    setCartItems([]) // Vaciar el carrito
    setCurrentStep(1) // Volver al primer paso
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )
  }

  const handleAddProductToCart = (product) => {
    setCartItems((prevCartItems) => [
      ...prevCartItems,
      { id: product.id, ...product },
    ])

    // Guardar en Firebase (opcional, si quieres persistir los datos)
    //const newProductRef = ref(database, `orders/${userData.uid}/${product.id}`);
    //set(newProductRef, product);
  }

  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisibility(false)
    if (selectedDate) {
      const dayOfWeek = selectedDate.getDay() // 0 (Domingo) a 6 (Sábado)
      const currentHour = new Date().getHours()

      if (dayOfWeek === 0 || dayOfWeek === 1) {
        // Calcular el siguiente día laborable (martes a sábado)
        let nextWorkingDay = dayOfWeek === 0 ? 2 : 2 // Si es domingo, el siguiente laborable es martes (2). Si es lunes, también es martes (2).
        const nextWorkingDate = new Date(selectedDate)
        nextWorkingDate.setDate(
          selectedDate.getDate() + (nextWorkingDay - dayOfWeek)
        )

        // Mostrar un mensaje de error al usuario
        Alert.alert(
          'Día no válido',
          `No se puede entregar el pedido los domingos ni los lunes. La fecha de entrega se ha cambiado al ${moment(
            nextWorkingDate
          )
            .locale('es')
            .format('dddd')} ${nextWorkingDate.getDate()}.`
        )

        // Actualizar la fecha con el siguiente día laborable
        setDeliveryDate(nextWorkingDate)
      } else if (
        selectedDate.getDate() === new Date().getDate() &&
        currentHour >= 3 &&
        currentHour <= 23
      ) {
        // Calcular el siguiente día laborable (martes a sábado)
        let nextWorkingDay = dayOfWeek
        do {
          nextWorkingDay = (nextWorkingDay + 1) % 7
        } while (nextWorkingDay === 0 || nextWorkingDay === 1) // Repetir hasta encontrar un día entre martes y sábado

        const nextWorkingDate = new Date(selectedDate)
        nextWorkingDate.setDate(
          selectedDate.getDate() + (nextWorkingDay - dayOfWeek)
        )

        // Mostrar un mensaje al usuario
        Alert.alert(
          'Pedido programado para el siguiente día laboral',
          `El día de hoy no podemos entregar tu pedido. Lo entregaremos el ${moment(
            nextWorkingDate
          )
            .locale('es')
            .format(
              'dddd'
            )} ${nextWorkingDate.getDate()}. Recuerda hacer el pedido con anterioridad.`
        )

        // Actualizar la fecha con el siguiente día laborable
        setDeliveryDate(nextWorkingDate)
      } else {
        // Asegurarse de que la hora sea correcta para la entrega en el mismo día
        const currentHour = new Date().getHours()
        if (
          selectedDate.getDate() === new Date().getDate() &&
          currentHour >= 3
        ) {
          selectedDate.setHours(0, 0, 0, 0) // Reiniciar la hora a las 12 AM
        }
        setDeliveryDate(selectedDate)
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductConfirmationStep
            cartItems={cartItems}
            onNextStep={handleNextStep}
          />
        )
      case 2:
        return (
          <DeliveryAddressStep
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
            onNextStep={handleNextStep}
            onPreviousStep={handlePreviousStep}
          />
        )
      case 3:
        return (
          <DeliveryDateStep
            deliveryDate={deliveryDate}
            onDateChange={handleDateChange}
            onNextStep={handleNextStep}
            onPreviousStep={handlePreviousStep}
          />
        )
      case 4:
        return (
          <View style={styles.stepContainer}>
            <PaymentMethodStep
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onPreviousStep={handlePreviousStep}
              onSendOrder={handleSendOrder}
            />
          </View>
        )
      default:
        return null
    }
  }

  return (
    <View style={{ flex: 1, marginBottom: 108 }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Mostrar mensaje si el carrito está vacío */}
          {cartItems.length === 0 && (
            <Text style={styles.headertext}>No se han agregado productos</Text>
          )}

          {/* Renderizar el paso actual (2, 3, o 4) */}
          {cartItems.length > 0 && renderStep()}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  deliveryDayMessage: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addressOptionText: {
    fontSize: 16,
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
    marginRight: 0,
  },
  headertext: {
    fontSize: 20,
    fontWeight: 'normal',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ed7400',
    padding: 10,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  dateText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  paymentMethodButton: {
    backgroundColor: '#ed7400',
    padding: 10,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 10,
  },
  paymentMethodButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  Flat: {
    marginBottom: 240,
    flex: 1,
  },
  sendButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Para separar los botones
    marginTop: 10,
  },
  stepContainer: {
    marginBottom: 20, // Espacio para que los botones no queden muy abajo
    margin: 10,
  },

  twoButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Ajusta la distribución de los botones
    marginTop: 0,
  },

  selectedPaymentMethod: {
    borderWidth: 0,
    borderColor: 'white',
    backgroundColor: '#024936',
  },
})

export default CartScreen
