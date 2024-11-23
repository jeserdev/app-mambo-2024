import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native'
import { ref, onValue, update } from 'firebase/database'
import { database } from '../database/firebase'
import { Checkbox, TextInput } from 'react-native-paper'
import { Picker } from '@react-native-picker/picker'

const EditProductScreen = ({ route, navigation }) => {
  const [productOptions, setProductOptions] = useState({})
  const [showOptions, setShowOptions] = useState(false)
  const [category, setCategory] = useState('Frutas')
  const { productId } = route.params
  const [categories, setCategories] = useState([])

  const availabilityOptions = ['En Stock', 'Por confirmar']
  const qualityOptions = ['Primera', 'Segunda']
  const maduracionOptions = ['Si', 'No']

  const [product, setProduct] = useState({
    availability: '',
    boxesAvailable: '',
    boxesCalibre: '',
    boxesPreKilos: '',
    unitsBoxesAvailable:'',
    category: '',
    country: '',
    brand: '',
    imageUrl: '',
    kilosAvailable: '',
    maduracion: '',
    manojosAvailable: '',
    manojosGramos: '',
    manojosKilos: '',
    name: '',
    reference: '',
    paletAvailable: '',
    paletBoxesPeso: '',
    paletPeso: '',
    paletPorBox: '',
    price: '',
    quality: '',
    sacosAvailable: '',
    sacosPreAvailable: '',
    tare: '',
    units: {
      Cajas: false,
      Kilos: false,
      Manojos: false,
      Palet: false,
      Sacos: false,
    },
    variety: '',
    options: {},
    'category-select': {},
  })

  const [isCajasChecked, setIsCajasChecked] = useState(false)
  const [isKilosChecked, setIsKilosChecked] = useState(false)
  const [isManojosChecked, setIsManojosChecked] = useState(false)
  const [isPaletChecked, setIsPaletChecked] = useState(false)
  const [isSacosChecked, setIsSacosChecked] = useState(false)

  useEffect(() => {
    const productRef = ref(database, `product-items/${productId}`)
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val()
      console.log('Product data:', data) // Log del producto
      setProduct(data)
      setProductOptions(data.options)
      setCategory(data.category)

      // Configurar el estado inicial de los checkboxes
      setIsCajasChecked(!!data.units.Cajas)
      setIsKilosChecked(!!data.units.Kilos)
      setIsManojosChecked(!!data.units.Manojos)
      setIsPaletChecked(!!data.units.Palet)
      setIsSacosChecked(!!data.units.Sacos)

      // Extraer y establecer categorías desde 'category-select'
      if (data['category-select']) {
        setCategories(Object.keys(data['category-select']))
        console.log('Categories:', Object.keys(data['category-select'])) // Log de categorías
      }
    })

    return unsubscribe
  }, [productId])

  const handleChange = (name, value) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }))
  }

  const handleUnitChange = (unit, value) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      units: {
        ...prevProduct.units,
        [unit]: value,
      },
    }))
  }

  const handleOptionChange = (options) => {
    setProductOptions({
      ...productOptions,
      [options]: !productOptions[options],
      [category]: !productOptions[category],
    })
  }

  const handleCheckboxChange = (field) => {
    const isChecked = !product.units[field]

    setProduct((prevProduct) => ({
      ...prevProduct,
      units: {
        ...prevProduct.units,
        [field]: isChecked,
      },
    }))

    switch (field) {
      case 'Cajas':
        setIsCajasChecked(isChecked)
        break
      case 'Kilos':
        setIsKilosChecked(isChecked)
        break
      case 'Manojos':
        setIsManojosChecked(isChecked)
        break
      case 'Palet':
        setIsPaletChecked(isChecked)
        break
      case 'Sacos':
        setIsSacosChecked(isChecked)
        break
      default:
        break
    }
  }

  const saveProduct = () => {
    if (product.name === '') {
      Alert.alert('Por favor, proporciona un nombre')
      return
    }

    const productRef = ref(database, `product-items/${productId}`)

    const updatedProduct = {
      ...product,
      category,
      'category-select': {
        ...product['category-select'],
        [category]: true,
      },
      options: productOptions,
    }

    update(productRef, updatedProduct) // Guardar actualizaciones en la base de datos
      .then(() => {
        Alert.alert('Producto actualizado exitosamente')
        navigation.navigate('ProductDetailsScreen', { productId: productId })
      })
      .catch((error) => {
        Alert.alert('Error', 'Ocurrió un error al actualizar el producto.')
      })
  }

  const handlePickerChange = (name, value) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }))
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.imageUrl && (
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: '100%', height: 200 }}
        />
      )}

      <View style={styles.inputGroup}>
        {[
          { field: 'name', label: 'Nombre:' },
          { field: 'reference', label: 'Código ref:' },          
          { field: 'availability', label: 'Availability' },
          { field: 'category', label: 'Categoría' },
          { field: 'country', label: 'País de Origen' },
          { field: 'brand', label: 'Marca' },
          { field: 'maduracion', label: 'Maduración' },
          { field: 'price', label: 'Precio', keyboardType: 'numeric' },
          { field: 'quality', label: 'Calidad' },
          { field: 'tare', label: 'Tara %', keyboardType: 'numeric' },
          { field: 'variety', label: 'Variedad' },
        ].map(({ field, label, keyboardType = 'default' }) => (
          <View style={{ marginBottom: 10 }} key={field}>
            <TextInput
              label={label}
              mode="outlined"
              value={product[field]}
              onChangeText={(value) => handleChange(field, value)}
              keyboardType={keyboardType}
            />
          </View>
        ))}

        <Checkbox.Item
          label="Cajas"
          status={isCajasChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxChange('Cajas')}
        />

        {isCajasChecked && (
          <>
            <TextInput
              label="Cajas disponibles"
              mode="outlined"
              keyboardType="numeric"
              value={product.boxesAvailable}
              onChangeText={(value) => handleChange('boxesAvailable', value)}
            />
            <TextInput
              label="Calibre"
              mode="outlined"
              keyboardType="numeric"
              value={product.boxesCalibre}
              onChangeText={(value) => handleChange('boxesCalibre', value)}
            />
            <TextInput
              label="Presentación de caja x Kilos"
              mode="outlined"
              keyboardType="numeric"
              value={product.boxesPreKilos}
              onChangeText={(value) => handleChange('boxesPreKilos', value)}
            />
            

            <TextInput
              label="Unidades x caja "
              mode="outlined"
              keyboardType="numeric"
              value={product.unitsBoxesAvailable}
              onChangeText={(value) => handleChange('unitsBoxesAvailable', value)}
            />


          </>
        )}

        <Checkbox.Item
          label="Kilos"
          status={isKilosChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxChange('Kilos')}
        />

        {isKilosChecked && (
          <>
            <TextInput
              label="Kilos Disponibles"
              mode="outlined"
              keyboardType="numeric"
              value={product.kilosAvailable}
              onChangeText={(value) => handleChange('kilosAvailable', value)}
            />
          </>
        )}

        <Checkbox.Item
          label="Manojos"
          status={isManojosChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxChange('Manojos')}
        />

        {isManojosChecked && (
          <>
            <TextInput
              label="Manojos Disponibles"
              mode="outlined"
              keyboardType="numeric"
              value={product.manojosAvailable}
              onChangeText={(value) => handleChange('manojosAvailable', value)}
            />
            <TextInput
              label="Presentación en Gramos de:"
              mode="outlined"
              keyboardType="numeric"
              value={product.manojosGramos}
              onChangeText={(value) => handleChange('manojosGramos', value)}
            />
            <TextInput
              label="Presentación Kilos"
              mode="outlined"
              keyboardType="numeric"
              value={product.manojosKilos}
              onChangeText={(value) => handleChange('manojosKilos', value)}
            />
          </>
        )}

        <Checkbox.Item
          label="Palet"
          status={isPaletChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxChange('Palet')}
        />

        {isPaletChecked && (
          <>
            <TextInput
              label="Palets Disponibles"
              mode="outlined"
              keyboardType="numeric"
              value={product.paletAvailable}
              onChangeText={(value) => handleChange('paletAvailable', value)}
            />
            <TextInput
              label="Palet Peso por caja:"
              mode="outlined"
              keyboardType="numeric"
              value={product.paletBoxesPeso}
              onChangeText={(value) => handleChange('paletBoxesPeso', value)}
            />
            <TextInput
              label="Palet Peso Total"
              mode="outlined"
              keyboardType="numeric"
              value={product.paletPeso}
              onChangeText={(value) => handleChange('paletPeso', value)}
            />
          </>
        )}

        <Checkbox.Item
          label="Sacos"
          status={isSacosChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxChange('Sacos')}
        />

        {isSacosChecked && (
          <>
            <TextInput
              label="Sacos Disponibles"
              mode="outlined"
              keyboardType="numeric"
              value={product.sacosAvailable}
              onChangeText={(value) => handleChange('sacosAvailable', value)}
            />
            <TextInput
              label="Presentación del saco en Kilos"
              mode="outlined"
              keyboardType="numeric"
              value={product.sacosPreAvailable}
              onChangeText={(value) => handleChange('sacosPreAvailable', value)}
            />
          </>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría:</Text>
        <Picker
          selectedValue={category} // Valor seleccionado correcto
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Disponibilidad:</Text>
        <Picker
          selectedValue={product.availability}
          style={styles.picker}
          onValueChange={(itemValue) =>
            handlePickerChange('availability', itemValue)
          } // Usar handlePickerChange
        >
          {availabilityOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Calidad:</Text>
        <Picker
          selectedValue={product.quality}
          style={styles.picker}
          onValueChange={(itemValue) =>
            handlePickerChange('quality', itemValue)
          } // Usar handlePickerChange
        >
          {qualityOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Maduración:</Text>
        <Picker
          selectedValue={product.maduracion}
          style={styles.picker}
          onValueChange={(itemValue) =>
            handlePickerChange('maduracion', itemValue)
          } // Usar handlePickerChange
        >
          {maduracionOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
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
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={saveProduct}>
          <Text style={styles.buttonText}>Guardar</Text>
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
    marginBottom: 30,
    paddingBottom: 20,
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
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 60,
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
  headerIcon: {
    width: 65,
    height: 65,
    marginRight: 0,
    marginTop: 5,
  },
  button: {
    width: '100%',
    height: 40,
    borderRadius: 25,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default EditProductScreen
