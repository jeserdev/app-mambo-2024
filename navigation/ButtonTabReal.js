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
    MainScreen: 'home-outline',
    CreateProductScreen: 'add-outline',
    Profile: 'person-outline',
    CartScreen: 'cart-outline',
    OrderMainScreen: 'bag-check-outline',
    LoginScreen: 'person-outline',
    RegisterScreen: 'person-add-outline',
  };
  
  // Objeto para mapear nombres de rutas a etiquetas
  const tabLabels = {
    MainScreen: 'Productos',
    CreateProductScreen: 'Añadir nuevo',
    Profile: 'Perfil',
    CartScreen: 'Carrito',
    OrderMainScreen: 'Pedidos',
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
        <Stack.Screen name="ProductDetailsScreen" 
   component={ProductDetailsScreen} />
        <Stack.Screen name="SearchProductScreen" component={SearchProductScreen} 
   />
        <Stack.Screen name="EditProductScreen" component={EditProductScreen} /> 
      </Stack.Navigator>
    );
  }
  
  export const ButtonTabReal = ({
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


  const inactiveColor = '#333333';
  const activeColor = '#ed7400';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <View>
            {route.name === 'Profile' && isLoggedIn && profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: size, height: size, borderRadius: size / 2 }} />
            ) : (
              <Ionicons name={iconNames[route.name]} size={size} color={focused ? activeColor : inactiveColor} />
            )}
            {route.name === 'CartScreen' && cartItems.length > 0 && (
              <View style={{ 
                position: 'absolute', 
                top: -5, 
                right: -10, 
                backgroundColor: 'green', 
                borderRadius: 10, 
                paddingHorizontal: 6, 
                paddingVertical: 2 
              }}>
                <Text style={{ color: 'white' }}>{countTotalItems}</Text>
              </View>
            )}
          </View>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={{ color: focused ? activeColor : inactiveColor, fontSize: 10 }}>
            {tabLabels[route.name]}
          </Text>
        ),
      })}
    >
      {isLoggedIn ? (
        <>
          <Tab.Screen name="ProductStack" component={ProductStack} options={{ headerShown: false }} />
          {isLoggedIn && userData && userData.role === 'Administrador' && (
            <Tab.Screen name="CreateProductScreen" component={CreateProductScreen} options={{ headerShown: false }} />
          )}
          <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
          <Tab.Screen 
            name="CartScreen" 
            component={CartScreen} 
            initialParams={{ removeFromCart, updateProductCount, setCartItems }} 
            options={{ 
              headerShown: false, 
              tabBarBadge: isLoggedIn && totalProducts > 0 ? totalProducts : null 
            }} 
          />
          <Tab.Screen name="OrderStack" component={OrderStack} options={{ headerShown: false }} /> 
        </>
      ) : (
        <>
          <Tab.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Tab.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default ButtonTabReal;


