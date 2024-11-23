import React, { useState } from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Picker } from '@react-native-picker/picker'
import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker'
import { database } from '../database/firebase'
import { app } from '../database/firebase' // Asegúrate de que la ruta sea correcta según la ubicación de tu archivo firebase.js
import { ref as storageRef } from 'firebase/storage'
import { push, ref as rtdbRef } from 'firebase/database'
import { set } from 'firebase/database'
import { serverTimestamp } from 'firebase/database' // Import serverTimestamp
import IconMamboCenter from '../assets/icons/IconMamboCenter.svg'
import { RadioButton, Checkbox } from 'react-native-paper'

const initialOptions = {
  Maduro: false,
  'Bien verde': false,
  'No muy maduro': false,
  Pequeño: false,
  'Bolsa de 2 kilos': false,
  Grande: false,
  Mediano: false,
  'En oferta': false,
  'Oferta granel': false,
  'Oferta caja': false,
  'No tan grande': false,
  'No blandos': false,
  'No duros': false,
  'Sin pepas': false,
}

const initialCategories = {
  Frutas: false,
  Verduras: false,
  Hortalizas: false,
  Legumbres: false,
  Cereales: false,
  Tropical: false,
  Exóticos: false,
  'Frutos Secos': false,
  'Hierbas Aromáticas': false,
  Tubérculos: false,
  Cítricos: false,
  Especias: false,
  Setas: false,
  Promociones: false,
}

const CreateProductScreen = ({ navigation }) => {
  const [productOptions, setProductOptions] = useState(initialOptions)
  const [showOptions, setShowOptions] = useState(false)
  const [categorySelect, setCategorySelect] = useState(initialCategories)

  const [state, setState] = useState({
    photo: null,
    name: '',
    reference: '',
    brand: '',
    price: '',
    tare: '',
    country: '',
    variety: '',
    availability: 'En Stock',
    quality: 'I',
    category: 'Frutas',
    maduracion: 'si',
    units: selectedUnits,
    kilosAvailable: '', // La cantidad de kilos disponibles del producto
    sacosAvailable: '', // La cantidad de sacos disponibles del producto
    sacosPreAvailable: '', // La presentación en kilos de los sacos
    boxesAvailable: '', // La cantidad de cajas disponibles del producto
    unitsBoxesAvailable: '', // La cantidad de unidades por caja
    boxesPreKilos: '', // La cantidad de kilos por caja
    boxesCalibre: '', // El calibre de las cajas
    manojosAvailable: '',
    manojosKilos: '',
    manojosGramos: '',
    paletAvailable: '',
    paletPorBox: '',
    paletBoxesPeso: '',
    paletPeso: '',
  })

  const [sacos, setSacos] = useState(false)
  const [kilos, setKilos] = useState(false)
  const [cajas, setCajas] = useState(false)
  const [manojos, setManojos] = useState(false)
  const [palet, setPalet] = useState(false)

  const [saving, setSaving] = useState(false)

  const [checked, setChecked] = React.useState(false)

  const [selectedUnits, setSelectedUnits] = useState({
    Kilos: false,
    Sacos: false,
    Cajas: false,
    Palet: false,
  })

  const handleCheckboxChange = (unit, isChecked) => {
    setSelectedUnits((prevUnits) => ({
      ...prevUnits,
      [unit]: isChecked,
    }))
  }

  const [selectedCategory, setSelectedCategory] = useState('Frutas')

  const handleCategoryChange = (newCategory) => {
    setState((prevState) => {
      return { ...prevState, category: newCategory }
    })

    // Actualiza categorySelect con la nueva categoría
    setCategorySelect((prevCategories) => {
      // Reinicia todas las categorías a false
      const resetCategories = Object.keys(prevCategories).reduce((acc, key) => {
        acc[key] = false
        return acc
      }, {})
      // Establece la nueva categoría a true
      return { ...resetCategories, [newCategory]: true }
    })
  }

  const handleOptionChange = (option) => {
    setProductOptions({ ...productOptions, [option]: !productOptions[option] })
  }

  const savePhoto = async (uri) => {
    try {
      console.log('URI original:', uri)

      const directory = `${FileSystem.documentDirectory}photos/`
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true })

      const filename = `${Date.now()}.jpg`
      const localUri = `${directory}${filename}`

      console.log('Directorio de destino:', directory)
      console.log('Nombre del archivo:', filename)
      console.log('URI local generada:', localUri)

      console.log('Resultado antes de la manipulación de la imagen:', uri)

      const manipulatorResult = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      )

      console.log(
        'Resultado de la manipulación de la imagen:',
        manipulatorResult
      )

      if (!manipulatorResult || !manipulatorResult.uri) {
        throw new Error(
          'La manipulación de la imagen no devolvió una URI válida.'
        )
      }

      console.log('URI de la imagen manipulada:', manipulatorResult.uri)

      await FileSystem.copyAsync({ from: manipulatorResult.uri, to: localUri })

      console.log('Foto guardada exitosamente en:', localUri)

      return localUri
    } catch (error) {
      console.error('Error al guardar la foto:', error)
      throw new Error('Error al guardar la foto: ' + error.message)
    }
  }

  const pickImageFromGallery = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0]
        setState({ ...state, photo: selectedImage.uri })
      } else {
        Alert.alert('Por favor, selecciona una imagen')
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error)
      Alert.alert('Error al seleccionar imagen')
    }
  }

  const takePhoto = async () => {
    try {
      const result = await launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      console.log('Resultado de launchCameraAsync:', result)

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri
        const localUri = await savePhoto(uri)
        setState({ ...state, photo: localUri })
      } else {
        console.log('No se capturó ninguna imagen o se canceló la operación.')
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error)
      const message = getErrorMessage(error)
      Alert.alert('Error al tomar la foto', message)
    }
  }

  const saveProduct = async () => {
    if (state.name === '') {
      Alert.alert('Por favor, proporciona un nombre')
      return
    }

    try {
      if (!state.photo) {
        Alert.alert('Por favor, selecciona una imagen')
        return
      }

      setSaving(true)

      const storageInstance = getStorage(app)
      const storageReference = storageRef(
        storageInstance,
        `images/${Date.now()}`
      )

      const response = await fetch(state.photo)

      if (!response.ok) {
        throw new Error('Error al cargar la imagen')
      }

      const blob = await response.blob()

      if (!blob) {
        throw new Error('Error al obtener el blob de la imagen')
      }

      await uploadBytes(storageReference, blob)

      const imageUrl = await getDownloadURL(storageReference)

      const productsRef = rtdbRef(database, 'product-items')
      const newProductRef = push(productsRef)
      const productKey = newProductRef.key

      const productData = {
        id: productKey,
        name: state.name,
        reference: state.reference,
        price: state.price,
        tare: state.tare,
        country: state.country,
        brand: state.brand,
        variety: state.variety,
        availability: state.availability,
        imageUrl: imageUrl,
        units: selectedUnits,
        quality: state.quality,
        category: state.category,
        maduracion: state.maduracion,
        'category-select': categorySelect,
        kilosAvailable: state.kilosAvailable,
        sacosAvailable: state.sacosAvailable,
        sacosPreAvailable: state.sacosPreAvailable,
        boxesAvailable: state.boxesAvailable,
        boxesPreKilos: state.boxesPreKilos,
        unitsBoxesAvailable: state.unitsBoxesAvailable,
        boxesCalibre: state.boxesCalibre,
        manojosAvailable: state.manojosAvailable,
        manojosKilos: state.manojosKilos,
        manojosGramos: state.manojosGramos,
        paletAvailable: state.paletAvailable,
        paletPorBox: state.paletPorBox,
        paletBoxesPeso: state.paletBoxesPeso,
        paletPeso: state.paletPeso,
        createdAt: serverTimestamp(), // Add timestamp for creation date
        options: productOptions,
      }

      await set(newProductRef, productData)

      console.log('Producto guardado exitosamente en la base de datos')

      Alert.alert('Producto guardado exitosamente')
      setState({
        photo: null,
        name: '',
        reference: '',
        price: '',
        tare: '',
        country: '',
        brand: '',
        variety: '',
        availability: 'En Stock',
        quality: 'I',
        category: 'Frutas',
        'category-select': selectedCategory,
        maduracion: 'si',
        units: selectedUnits,
        kilosAvailable: '', // La cantidad de kilos disponibles del producto
        sacosAvailable: '', // La cantidad de sacos disponibles del producto
        sacosPreAvailable: '', // La presentación en kilos de los sacos
        boxesAvailable: '', // La cantidad de cajas disponibles del producto
        boxesPreKilos: '', // La cantidad de kilos por caja
        unitsBoxesAvailable: '',
        boxesCalibre: '', // El calibre de las cajas
        manojosAvailable: '',
        manojosKilos: '',
        manojosGramos: '',
        paletAvailable: '',
        paletPorBox: '',
        paletBoxesPeso: '',
        paletPeso: '',
        options: productOptions,
      })
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      Alert.alert('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeText = (name, value) => {
    setState({ ...state, [name]: value })
  }

  const categories = Object.keys(initialCategories)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {state.photo && (
          <Image source={{ uri: state.photo }} style={styles.image} />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImageFromGallery}
          disabled={saving}
        >
          <Ionicons name="images" size={24} color="#F2E8D1" />
          <Text style={styles.buttonText}>Subir de la galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={takePhoto}
          disabled={saving}
        >
          <Ionicons name="camera" size={24} color="#F2E8D1" />
          <Text style={styles.buttonText}>Tomar foto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Producto"
          value={state.name}
          onChangeText={(value) => handleChangeText('name', value)}
          editable={!saving}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Ref o código del Producto"
          value={state.reference}
          onChangeText={(value) => handleChangeText('reference', value)}
          editable={!saving}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Precio"
          value={state.price}
          onChangeText={(value) => handleChangeText('price', value)}
          editable={!saving}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Tara"
          value={state.tare}
          onChangeText={(value) => handleChangeText('tare', value)}
          editable={!saving}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="País de Origen"
          value={state.country}
          onChangeText={(value) => handleChangeText('country', value)}
          editable={!saving}
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Marca"
          value={state.brand}
          onChangeText={(value) => handleChangeText('brand', value)}
          editable={!saving}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Variedad del Producto"
          value={state.variety}
          onChangeText={(value) => handleChangeText('variety', value)}
          editable={!saving}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría:</Text>
        <Picker
          selectedValue={state.category}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            handleCategoryChange(itemValue)
          }
          enabled={!saving}
        >
          {categories.map((category) => (
            <Picker.Item label={category} value={category} key={category} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Disponibilidad:</Text>
        <Picker
          selectedValue={state.availability}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            handleChangeText('availability', itemValue)
          }
          enabled={!saving}
        >
          <Picker.Item label="En Stock" value="En Stock" />
          <Picker.Item label="Por confirmar" value="Por confirmar" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Calidad:</Text>
        <Picker
          selectedValue={state.quality}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            handleChangeText('quality', itemValue)
          }
          enabled={!saving}
        >
          <Picker.Item label="Primera" value="I" />
          <Picker.Item label="Segunda" value="II" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Puntos de maduración:</Text>
        <Picker
          selectedValue={state.maduracion}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            handleChangeText('maduracion', itemValue)
          }
          enabled={!saving}
        >
          <Picker.Item label="Si" value="si" />
          <Picker.Item label="No" value="no" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Unidades:</Text>

        <View>
          <Text>Kilos</Text>
          <Checkbox
            status={kilos ? 'checked' : 'unchecked'}
            onPress={() => {
              const newKilos = !kilos
              setKilos(newKilos)
              handleCheckboxChange('Kilos', newKilos)
            }}
          />
          {kilos && (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Kilos Disponibles"
                value={state.kilosAvailable}
                onChangeText={(value) =>
                  handleChangeText('kilosAvailable', value)
                }
                editable={!saving}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        <View>
          <Text>Sacos</Text>
          <Checkbox
            status={sacos ? 'checked' : 'unchecked'}
            onPress={() => {
              const newSacos = !sacos
              setSacos(newSacos)
              handleCheckboxChange('Sacos', newSacos)
            }}
          />
          {sacos && (
            <View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Sacos Disponibles"
                  value={state.sacosAvailable}
                  onChangeText={(value) =>
                    handleChangeText('sacosAvailable', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Presentación x kilos"
                  value={state.sacosPreAvailable}
                  onChangeText={(value) =>
                    handleChangeText('sacosPreAvailable', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>

        <View>
          <Text>Cajas</Text>
          <Checkbox style={styles.checkboxstile}
            status={cajas ? 'checked' : 'unchecked'}
            onPress={() => {
              const newCajas = !cajas
              setCajas(newCajas)
              handleCheckboxChange('Cajas', newCajas)
            }}
          />
          {cajas && (
            <View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Cajas Disponibles"
                  value={state.boxesAvailable}
                  onChangeText={(value) =>
                    handleChangeText('boxesAvailable', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Kilos por caja"
                  value={state.boxesPreKilos}
                  onChangeText={(value) =>
                    handleChangeText('boxesPreKilos', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Unidades por caja"
                  value={state.unitsBoxesAvailable}
                  onChangeText={(value) =>
                    handleChangeText('unitsBoxesAvailable', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Calibre"
                  value={state.boxesCalibre}
                  onChangeText={(value) =>
                    handleChangeText('boxesCalibre', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>

        <View>
          <Text>Manojos</Text>
          <Checkbox
            status={manojos ? 'checked' : 'unchecked'}
            onPress={() => {
              const newManojos = !manojos
              setManojos(newManojos)
              handleCheckboxChange('Manojos', newManojos)
            }}
          />
          {manojos && (
            <View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Manojos Disponibles"
                  value={state.manojosAvailable}
                  onChangeText={(value) =>
                    handleChangeText('manojosAvailable', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Presentación kilos"
                  value={state.manojosKilos}
                  onChangeText={(value) =>
                    handleChangeText('manojosKilos', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Presentación gramos"
                  value={state.manojosGramos}
                  onChangeText={(value) =>
                    handleChangeText('manojosGramos', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>

        <View>
          <Text>Palet</Text>
          <Checkbox
            status={palet ? 'checked' : 'unchecked'}
            onPress={() => {
              const newPalet = !palet
              setPalet(newPalet)
              handleCheckboxChange('Palet', newPalet)
            }}
          />
          {palet && (
            <View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Palet Disponibles"
                  value={state.paletAvailable}
                  onChangeText={(value) =>
                    handleChangeText('paletAvailable', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Cajas por palet"
                  value={state.paletPorBox}
                  onChangeText={(value) =>
                    handleChangeText('paletPorBox', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Peso por caja"
                  value={state.paletBoxesPeso}
                  onChangeText={(value) =>
                    handleChangeText('paletBoxesPeso', value)
                  }
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input2}
                  placeholder="Peso palet"
                  value={state.paletPeso}
                  onChangeText={(value) => handleChangeText('paletPeso', value)}
                  editable={!saving}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <View>
        <Text>Maduración y opciones de producto</Text>
        <Checkbox
          status={showOptions ? 'checked' : 'unchecked'}
          onPress={() => setShowOptions(!showOptions)}
        />
        {showOptions &&
          Object.keys(productOptions).map((option) => (
            <View
              key={option}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text>{option}</Text>
              <Checkbox
                status={productOptions[option] ? 'checked' : 'unchecked'}
                onPress={() => handleOptionChange(option)}
              />
            </View>
          ))}
        {/* Otros campos del formulario de producto */}
        {/* ... */}
      </View>

      <View style={styles.buttonContainer2}>
        <TouchableOpacity style={styles.button2} onPress={saveProduct}>
          <Text style={styles.buttonText}>Guardar Producto</Text>
          <Ionicons
            name="checkmark-done"
            size={24}
            color="white"
            marginLeft={10}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  unitSection: {
    width: '50%',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#c0c0c0',
  },
  input2: {
    height: 40,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#c0c0c0',
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    height: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#c0c0c0',
  },
  buttonContainer: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#f5f5f5',
  },
  checkboxstile: {
    flexDirection: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#f5f5f5',
  },
  headerIcon: {
    width: 65,
    height: 65,
    marginRight: 0,
    marginTop: 5,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  buttonContainer2: {
    width: '100%',

    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },

  button2: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 5,
    backgroundColor: '#ED7400', // Adjust button color if desired
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '50%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    backgroundColor: '#ED7400',
    borderRadius: 5,
  },

  buttonText: {
    marginLeft: 10,
    color: 'white',
  },
})

export default CreateProductScreen
