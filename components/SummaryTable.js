import React from 'react'
import { View, Text } from 'react-native'

const SummaryTable = ({ data }) => {
  return (
    <View>
      {/* Renderiza los datos de resumen aquí */}
      {data.map((item, index) => (
        <Text key={index}>{item}</Text>
      ))}
    </View>
  )
}

export default SummaryTable
