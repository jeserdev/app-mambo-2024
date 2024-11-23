import React, { useContext, useState, useEffect, useMemo } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, Image, TouchableOpacity, BackHandler, View } from 'react-native'
import RegisterScreen from '../screens/RegisterScreen'
import CreateProductScreen from '../screens/CreateProductScreen'
import MainScreen from '../screens/MainScreen'
import LoginScreen from '../screens/LoginScreen'
import ProfileUserMainScreen from '../screens/ProfileUserMainScreen'
import ProductDetailsScreen from '../screens/ProductDetailsScreen'
import ProfileUserDetailsScreen from '../screens/ProfileUserDetailsScreen'
import EditProfileUserScreen from '../screens/EditProfileUserScreen'
import EditProductScreen from '../screens/EditProductScreen'
import { AuthContext } from '../state/auth.context'
import { Ionicons } from '@expo/vector-icons'
import CartScreen from '../screens/CartScreen'
import OrderMainScreen from '../screens/OrderMainScreen'
import OrderDetailsScreen from '../screens/OrderDetailsScreen' // Asegúrate de que la ruta de importación sea correcta
import { MenuScreen } from '../screens/MenuScreen'
import SearchProductScreen from '../screens/SearchProductScreen'
import OrderMainScreenCuts from '../screens/OrderMainScreenCuts'
import OrderMainScreenCutsOne from '../screens/OrderMainScreenCutsOne'
import OrderMainScreenCutsTwo from '../screens/OrderMainScreenCutsTwo'
import OrderMainScreenCutsThree from '../screens/OrderMainScreenCutsThree'
import { CartContext } from '../context/cart-context'
import { ref, onValue } from 'firebase/database'
import { database } from '../database/firebase'


const Tab = createBottomTabNavigator()

export const ButtonTabNew = ({
  removeFromCart,
  updateProductCount,
  setCartItems,
}) => {
  const { isLoggedIn, userData, logout } = useContext(AuthContext)

  const [profileImage, setProfileImage] = useState(null)

  const { cartItems, updateBadge } = useContext(CartContext)
  const uniqueProductCount = useMemo(
    () => new Set(cartItems.map((item) => item.id)).size,
    [cartItems] // Re-renderizado en cada cambio de cartItems
  )

  const countTotalItems = cartItems.reduce(
    (total, item) => total + item.count,
    0
  ) // Calcular el número total de items

  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    if (isLoggedIn && userData) {
      setProfileImage(userData.profileImage)

      const userOrderRef = ref(database, `orders/${userData.uid}`)

      const unsubscribe = onValue(userOrderRef, (snapshot) => {
        const data = snapshot.val()
        let totalValue = 0

        if (data) {
          // Iterar sobre los productos en la orden
          Object.values(data).forEach((product) => {
            // Verificar si el producto pertenece al usuario actual y si tiene la propiedad valuecart
            if (product.userId === userData.uid && product.valuecart) {
              totalValue += product.valuecart
            }
          })

          setTotalProducts(totalValue)
        } else {
          setTotalProducts(0)
        }
      })

      return () => unsubscribe()
    }
  }, [isLoggedIn, userData])

  const inactiveColor = '#333333' // Color para los íconos inactivos y textos de tabs
  const activeColor = '#ed7400' // Color para los íconos activos

  const handleLogout = () => {
    logout()
    // No salgas de la aplicación al presionar el botón de salida
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          if (
            route.name === 'ProfileUserMainScreen' &&
            isLoggedIn &&
            profileImage
          ) {
            return (
              <Image
                source={{ uri: profileImage }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
            )
          }

          const iconName = {
            RegisterScreen: 'person-add-outline',
            LoginScreen: 'person-outline',
            MainScreen: 'home-outline',
            CreateProductScreen: 'add-outline',
            ProfileUserMainScreen: 'person-outline',
            ProductDetailsScreen: 'eye-outline',
            EditProductScreen: 'create-outline',
            CartScreen: 'cart-outline',
            LogoutButton: 'log-out-outline',
            OrderMainScreen: 'bag-check-outline',
          }[route.name]

          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={iconName}
                size={size}
                color={focused ? activeColor : inactiveColor}
              />
              {route.name === 'CartScreen' && cartItems > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    backgroundColor: 'green',
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: 'white' }}>{countTotalItems}</Text>
                </View>
              )}
            </View>
          )
        },
        tabBarLabel: ({ focused, color }) => {
          let label

          switch (route.name) {
            case 'RegisterScreen':
              label = 'Registro'
              break
            case 'LoginScreen':
              label = 'Iniciar Sesión'
              break
            case 'MainScreen':
              label = 'Productos'
              break
            case 'CreateProductScreen':
              label = 'Añadir nuevo'
              break

            case 'ProfileUserDetailsScreen':
              label = 'Perfil2'
              break
            case 'MenuScreen':
              label = 'menu'
              break
            case 'EditProfileUserScreen':
              label = 'Editar usuario'
              break
            case 'ProductDetailsScreen':
              label = 'Detalle'
              break
            case 'EditProductScreen':
              label = 'Editar'
              break
            case 'CartScreen':
              label = 'Carrito'
              break
            case 'LogoutButton':
              label = 'Salir'
              break
            case 'OrderMainScreen':
              label = 'Pedidos'
              break
            case 'OrderMainScreenCuts':
              label = 'Cortes'
              break
            case 'OrderMainScreenCutsOne':
              label = 'Cortes'
              break
            case 'OrderMainScreenCutsTwo':
              label = 'Cortes'
              break
            case 'OrderMainScreenCutsThree':
              label = 'Cortes'
              break
            default:
              label = ''
              break
          }

          return (
            <Text
              style={{
                color: focused ? activeColor : inactiveColor,
                fontSize: 10,
              }}
            >
              {label}
            </Text>
          )
        },
      })}
    >
      {isLoggedIn ? (
        <>
          <Tab.Screen
            name="MainScreen"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          {isLoggedIn && userData && userData.role === 'Administrador' && (
            <Tab.Screen
              name="CreateProductScreen"
              component={CreateProductScreen}
              options={{ headerShown: false }}
            />
          )}
          <Tab.Screen
            name="ProfileUserMainScreen"
            component={ProfileUserMainScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="OrderMainScreenCuts"
            component={OrderMainScreenCuts}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="OrderMainScreenCutsOne"
            component={OrderMainScreenCutsOne}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="OrderMainScreenCutsTwo"
            component={OrderMainScreenCutsTwo}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="OrderMainScreenCutsThree"
            component={OrderMainScreenCutsThree}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="ProfileUserDetailsScreen"
            component={ProfileUserDetailsScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="EditProfileUserScreen"
            component={EditProfileUserScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="ProductDetailsScreen"
            component={ProductDetailsScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="SearchProductScreen"
            component={SearchProductScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />

          <Tab.Screen
            name="MenuScreen"
            component={MenuScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />

          <Tab.Screen
            name="EditProductScreen"
            component={EditProductScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />
          <Tab.Screen
            name="OrderDetailsScreen"
            component={OrderDetailsScreen}
            options={{ headerShown: false, tabBarButton: () => null }}
          />

          <Tab.Screen
            name="CartScreen"
            component={CartScreen}
            initialParams={{ removeFromCart, updateProductCount, setCartItems }}
            options={{
              headerShown: false,
              tabBarBadge:
                isLoggedIn && totalProducts > 0 ? totalProducts : null,
            }}
          />
          <Tab.Screen
            name="OrderMainScreen"
            component={OrderMainScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Tab.Navigator>
  )
}

export default ButtonTabNew
