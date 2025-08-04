import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import { postHttps } from '../api/axios';
import { useNavigation } from '@react-navigation/native';


const ciudadesColombia = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Bucaramanga', 'Pereira', 'Santa Marta', 'Manizales', 'Cúcuta',
];

const PublicPatchScreen = ({route}) => {

  const {id}=route.params;
  const [edadMinima, setEdadMinima] = useState('');
  const [edadMaxima, setEdadMaxima] = useState('');
  const [genero, setGenero] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation=useNavigation();

  const crearSala = async () => {
    const filtrosEdad = [edadMinima, edadMaxima];

    const payload = {
      edad: JSON.stringify(filtrosEdad),
      genero,
      ciudad,
      type: "PUBLIC",
      event_id:id
    };

    try {
      setLoading(true);
      console.log(payload)
      await postHttps('parches', payload);
       navigation.navigate('Parches', { selectedTab: 'PUBLIC' });
    } catch (error) {
      alert('Error al crear la sala.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Crear Parche Público" />
      <View style={{ top: 20 }}>
        <Text style={styles.label}>Edad mínima</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={edadMinima}
          onChangeText={setEdadMinima}
          placeholder="Edad mínima"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Edad máxima</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={edadMaxima}
          onChangeText={setEdadMaxima}
          placeholder="Edad máxima"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Género</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={genero}
            onValueChange={setGenero}
            style={Platform.OS === 'android' ? styles.androidPicker : styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Seleccionar género" value="" />
            <Picker.Item label="Masculino" value="masculino" />
            <Picker.Item label="Femenino" value="femenino" />
            <Picker.Item label="Todos" value="todos" />
            <Picker.Item label="Otro" value="otro" />
          </Picker>
        </View>

        <Text style={styles.label}>Ciudad</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={ciudad}
            onValueChange={setCiudad}
            style={Platform.OS === 'android' ? styles.androidPicker : styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Seleccionar ciudad" value="" />
            {ciudadesColombia.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={crearSala}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Parche</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PublicPatchScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#000',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
    color: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#fff',
    borderColor: '#333',
    backgroundColor: '#111',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  androidPicker: {
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
