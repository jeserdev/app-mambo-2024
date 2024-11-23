import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'

const CustomHeader = () => {
  const [refreshing, setRefreshing] = useState(false)

  const onReload = () => {
    setRefreshing(true)
    // Implement logic to reload the screen (e.g., fetch new data)
    setTimeout(() => setRefreshing(false), 1000) // Simulate data fetching delay
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onReload}>
        <IconMamboCenter width={30} height={30} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#fff',
  },
})

export default CustomHeader
