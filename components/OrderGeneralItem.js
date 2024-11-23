// Dentro de OrderGeneralItem.js

import React from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'

const OrderGeneralItem = ({
    item,
    statusOptions,
    productStatus,
    handleStatusChange,
    pickerItemStyles,
  }) => {

    if (!item.imageUrl) {
      console.log('Item no tiene imageUrl:', item);
    }


  return (
    <View style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.quantity}>Cantidad: {item.quantity}</Text>
        <Text style={styles.unit}>Unidad: {item.unidad}</Text>
      </View>
      <View style={styles.pickerContainer}>
        {Platform.OS === 'android' ? ( // Mostrar Picker solo en Android
          <Picker
            selectedValue={productStatus[item.name] || item.status}
            onValueChange={(itemValue) =>
              handleStatusChange(itemValue, item.name)
            }
            style={styles.picker}
          >
            <Picker.Item label="Selecciona el estado" value="default" />
            {statusOptions.map((status, index) => (
              <Picker.Item
                key={index}
                label={status}
                value={status}
                style={pickerItemStyles[status.toLowerCase()]}
              />
            ))}
          </Picker>
        ) : ( // Mostrar solo texto en iOS
          <Text style={styles.statusText}>
            Estado: {productStatus[item.name] || item.status}
          </Text>
        )}
      </View>
    </View>
  )
}

// Estilos de OrderGeneralItem
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    margin: 5,
    marginHorizontal: 5,
  },
  productInfo: {
    width: '45%',
  },
  pickerContainer: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  picker: {
    width: '100%', // Cambiado a 100% para que ocupe todo el espacio del contenedor
    height: 50, // Ajusta la altura según tus necesidades
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',

  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  unit: {
    fontSize: 14,
    color: '#666',
  },
  productImage: {
    width: 40, // Ajusta el ancho según tus necesidades
    height: 70, // Ajusta la altura según tus necesidades
    marginRight: 5, // Añade un margen a la derecha para separar la imagen del texto
  },
})

export default OrderGeneralItem
