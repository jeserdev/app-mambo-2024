// FooterMenu.js
import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons' // Assuming you're using MaterialCommunityIcons for the built-in icon
import IconMamboApp from '../assets/icons/IconMamboApp.svg' // Assuming your SVG is imported correctly
import IconPlusMamboFooter from '../assets/icons/IconPlusMamboFooter.svg'

const FooterMenu = ({ navigation }) => {
  // Pass navigation prop for routing

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('UserList')}
      >
        {' '}
        {/* Handle navigation to UserList screen */}
        <IconMamboApp style={styles.footerIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('CreateUserScreen')}
      >
        {' '}
        {/* Handle navigation to CreateUserScreen screen */}
        <IconPlusMamboFooter style={styles.footerIcon} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70, // Adjust height as needed
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
  },
  footerIcon: {
    width: 30,
    height: 30,
  },
})

export default FooterMenu
