import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import RegisterScreen from '../screens/RegisterScreen'
import CreateProductScreen from '../screens/CreateProductScreen'
import MainScreen from '../screens/MainScreen'
import LoginScreen from '../screens/LoginScreen'
import ProfileUserMainScreen from '../screens/'
import ProductDetailsScreen from '../screens/ProductDetailsScreen'
import EditProductScreen from '../noproyect/backupEditProductScreen'
import { AuthContext } from '../state/auth.context'
import IconProfileMamboFooter from '../assets/icons/IconProfileMamboFooter.svg'
import IconProfile from '../assets/icons/IconProfileMamboFooter.svg'
import IconPlus from '../assets/icons/IconProfileMamboFooterPlus.svg'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'

const Tab = createBottomTabNavigator()

export const ButtomTab = () => {
  const { isLoggedIn } = useContext(AuthContext)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconComponent

          if (!isLoggedIn) {
            if (
              route.name === 'RegisterScreen' ||
              route.name === 'LoginScreen'
            ) {
              iconComponent =
                route.name === 'RegisterScreen' ? (
                  <IconProfileMamboFooter
                    width={size}
                    height={size}
                    fill={color}
                  />
                ) : (
                  <IconProfile width={size} height={size} fill={color} />
                )
            }
          } else {
            if (route.name === 'MainScreen') {
              iconComponent = (
                <IconMamboCenter width={size} height={size} fill={color} />
              )
            } else if (route.name === 'CreateProductScreen') {
              iconComponent = (
                <IconPlus width={size} height={size} fill={color} />
              )
            } else if (route.name === 'ProfileUserMainScreen') {
              iconComponent = (
                <IconProfileMamboFooter
                  width={size}
                  height={size}
                  fill={color}
                />
              )
            }
          }

          return iconComponent
        },
        tabBarLabel: ({ focused, color }) => {
          let label

          if (route.name === 'RegisterScreen') {
            label = 'Registro'
          } else if (route.name === 'LoginScreen') {
            label = 'Iniciar Sesión'
          } else {
            if (route.name === 'MainScreen') {
              label = 'Productos'
            } else if (route.name === 'CreateProductScreen') {
              label = 'Crear Producto'
            } else if (route.name === 'ProfileUserMainScreen') {
              label = 'Perfil'
            }
          }

          return <Text style={{ color, fontSize: 10 }}>{label}</Text>
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
          <Tab.Screen
            name="CreateProductScreen"
            component={CreateProductScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="ProfileUserMainScreen"
            component={ProfileUserMainScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="ProductDetailsScreen"
            component={ProductDetailsScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="EditProductScreen"
            component={EditProductScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Tab.Navigator>
  )
}
