import React from 'react';
import { ScrollView, View, TouchableOpacity, Text, TextInput, Picker, Checkbox } from 'react-native';

const FormComponent = ({ fields, handleChangeText, handleCheckboxChange, saving, navigation, pickImageFromGallery, takePhoto, saveProduct }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainScreen')}>
          <IconMamboCenter style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {fields.photo && (
          <Image source={{ uri: fields.photo }} style={styles.image} />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImageFromGallery}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            Seleccionar imagen de la galería
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={takePhoto}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Tomar foto</Text>
        </TouchableOpacity>
      </View>
      {fields.map((field, index) => (
        <View key={index} style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            value={field.value}
            onChangeText={(value) => handleChangeText(field.name, value)}
            editable={!saving}
            keyboardType={field.keyboardType}
          />
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={saveProduct}>
          <Text style={styles.buttonText}>Guardar Producto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default FormComponent;