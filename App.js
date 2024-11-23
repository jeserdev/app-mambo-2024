import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ButtonTabNew } from './navigation/ButtonTabNew'
import { AuthProvider } from './state/auth.context' // Import your AuthProvider
import { MenuDrawerScreen } from './screens/MenuDrawerScreen'
import { AuthContext } from './state/auth.context'
import { CartProvider } from './context/cart-context'
import { CartItems } from './components/CartItem'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <CartProvider> 
      <NavigationContainer>
        <AuthProvider>
          <AuthContent />
          <StatusBar style="auto" />
        </AuthProvider>
      </NavigationContainer>
    </CartProvider>
  )
}

function AuthContent() {
  const { isLoggedIn } = useContext(AuthContext)

  return (
    <>
      {isLoggedIn && <MenuDrawerScreen />}
      <ButtonTabNew CartItems={CartItems} />
    </>
  )
}
