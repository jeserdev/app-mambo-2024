import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { ButtonTabNew } from './ButtonTabNew'

const Drawer = createDrawerNavigator()

export function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={ButtonTabNew} />
      {/* Agrega más Drawer.Screen aquí para otros componentes */}
    </Drawer.Navigator>
  )
}
