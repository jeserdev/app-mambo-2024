import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import MainScreen from '../screens/MainScreen'
import ProductDetailsScreen from '../screens/ProductDetailsScreen'
import CreateProductScreen from '../screens/CreateProductScreen'
import EditProductScreen from '../noproyect/backupEditProductScreen'

const Stack = createNativeStackNavigator()

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen
        name="ProductDetailsScreen"
        component={ProductDetailsScreen}
      />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} />
    </Stack.Navigator>
  )
}

export default MainStack
