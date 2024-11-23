import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import IconMamboSearchFooter from '../assets/icons/IconMamboSearchFooter.svg'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import IconMamboMenu from '../assets/icons/IconMamboMenu.svg'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';

export function MenuDrawerScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('ProfileStack', { screen: 'MenuScreen' })}> 
        <IconMamboMenu style={styles.headerMenu} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ProductStack', { screen: 'MainScreen' })}> 
        <IconMamboCenter style={styles.headerIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ProductStack', { screen: 'SearchProductScreen' })}> 
        <IconMamboSearchFooter style={styles.headerSearch} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    margin: 5,
    backgroundColor: '#fff',
  },
  itemContainer: {
    margin: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  columnWrapper: {
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
    margin: 5,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 40,
    height: 40,
    marginRight: 0,
    marginTop: 20,
    marginLeft: 5,
  },
  headerSearch: {
    width: 50,
    height: 50,
    marginRight: 0,
    marginTop: 35,
    marginRight: 0,
  },
  headerMenu: {
    width: 60,
    height: 60,
    marginRight: 0,
    marginTop: 40,
    marginLeft: 0,
  },
  
})
