// navigation/RootNavigator.js
import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { AuthContext } from '../state/auth.context'
import MainScreen from '../screens/MainScreen'
import RegisterScreen from '../screens/RegisterScreen'
import LoginScreen from '../screens/LoginScreen'
import CreateProductScreen from '../screens/CreateProductScreen'
import ProFileUser from '../screens/ProFileUser'
import ProductDetailsScreen from '../screens/ProductDetailsScreen'
import EditProductScreen from '../noproyect/backupEditProductScreen' // Agregar la importación aquí

const Tab = createBottomTabNavigator()

const RootNavigator = () => {
  const { isLoggedIn } = useContext(AuthContext)

  return (
    <NavigationContainer>
      <Tab.Navigator>
        {isLoggedIn ? (
          <>
            <Tab.Screen name="Main" component={MainScreen} />
            <Tab.Screen name="CreateProduct" component={CreateProductScreen} />
            <Tab.Screen name="Profile" component={ProFileUser} />
            <Tab.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
            />{' '}
            {/* Incluir la pantalla ProductDetailsScreen */}
            <Tab.Screen name="EditProduct" component={EditProductScreen} />{' '}
            {/* Incluir la pantalla EditProductScreen */}
          </>
        ) : (
          <>
            <Tab.Screen name="Register" component={RegisterScreen} />
            <Tab.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigator
