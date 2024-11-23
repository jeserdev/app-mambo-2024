import React, { useEffect, useRef } from 'react'
import { Animated, Easing, View, StyleSheet } from 'react-native'
import IconMamboApp from '../assets/icons/IconMamboApp.svg'

const LogoScreen = () => {
  const spinValue = useRef(new Animated.Value(0)).current
  const scaleValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const scale = scaleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  })

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ transform: [{ rotate: spin }, { scale: scale }] }}
      >
        <IconMamboApp width={80} height={80} style={styles.logo} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default LogoScreen
