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
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Objeto para mapear nombres de rutas a nombres de iconos
const iconNames = {
  ProductStack: 'home-outline', // Icono para ProductStack
  CreateProductScreen: 'add-outline',
  ProfileStack: 'person-outline', // Icono para ProfileStack
  CartScreen: 'cart-outline',
  OrderStack: 'bag-check-outline', // Icono para OrderStack
  LoginScreen: 'person-outline',
  RegisterScreen: 'person-add-outline',
};

// Objeto para mapear nombres de rutas a etiquetas
const tabLabels = {
  ProductStack: 'Productos', // Etiqueta para ProductStack
  CreateProductScreen: 'Añadir nuevo',
  ProfileStack: 'Perfil', // Etiqueta para ProfileStack
  CartScreen: 'Carrito',
  OrderStack: 'Pedidos', // Etiqueta para OrderStack
  LoginScreen: 'Iniciar Sesión',
  RegisterScreen: 'Registro',
};

// Stack para las pantallas de perfil
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileUserMainScreen" component={ProfileUserMainScreen} />
      <Stack.Screen name="ProfileUserDetailsScreen" component={ProfileUserDetailsScreen} />
      <Stack.Screen name="EditProfileUserScreen" component={EditProfileUserScreen} />
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
    </Stack.Navigator>
  );
}

// Stack para las pantallas de pedidos
function OrderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderMainScreen" component={OrderMainScreen} />
      <Stack.Screen name="OrderMainScreenCuts" component={OrderMainScreenCuts} />
      <Stack.Screen name="OrderMainScreenCutsOne" component={OrderMainScreenCutsOne} />
      <Stack.Screen name="OrderMainScreenCutsTwo" component={OrderMainScreenCutsTwo} />
      <Stack.Screen name="OrderMainScreenCutsThree" component={OrderMainScreenCutsThree} />
      <Stack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}

// Stack para las pantallas de productos
function ProductStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <Stack.Screen name="SearchProductScreen" component={SearchProductScreen} />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} /> 
    </Stack.Navigator>
  );
}


export const ButtonTabNew = ({
  removeFromCart,
  updateProductCount,
  setCartItems,
}) => {
  const { isLoggedIn, userData, logout } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState(null);
  const { cartItems } = useContext(CartContext);

  const countTotalItems = cartItems.reduce((total, item) => total + item.count, 0);

  
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (isLoggedIn && userData) {
      setProfileImage(userData.profileImage);
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

  const inactiveColor = '#333333';
  const activeColor = '#ed7400';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          
          <View>
            {/* Mostrar icono según el nombre de la ruta */}
            <Ionicons name={iconNames[route.name]} size={size} color={focused ? activeColor : inactiveColor} />
            
          </View>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={{ color: focused ? activeColor : inactiveColor, fontSize: 11 }}>
            {tabLabels[route.name]}
          </Text>
        ),
      })}
    >
      {isLoggedIn ? (
        <>
          {/* Pantallas visibles cuando el usuario está autenticado */}
          <Tab.Screen name="ProductStack" component={ProductStack} options={{ headerShown: false }} />
          {isLoggedIn && userData && userData.role === 'Administrador' && (
            <Tab.Screen name="CreateProductScreen" component={CreateProductScreen} options={{ headerShown: false }} />
          )}
          <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ headerShown: false }} />
          <Tab.Screen 
     name="CartScreen" 
  component={CartScreen} 
  initialParams={{ removeFromCart, updateProductCount, setCartItems }} 
  options={{ 
    headerShown: false, 
    tabBarBadge: isLoggedIn && totalProducts > 0 ? totalProducts : null,
    tabBarBadgeStyle: { backgroundColor: '#024936', color: 'white' } // Estilos forzados
  }} 
/>
          <Tab.Screen name="OrderStack" component={OrderStack} options={{ headerShown: false }} /> 
        </>
      ) : (
        <>
          {/* Pantallas visibles cuando el usuario NO está autenticado */}
          <Tab.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Tab.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default ButtonTabNew;