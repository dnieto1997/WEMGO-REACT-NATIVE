import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Platform,
  ImageBackground,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useReducer, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CheckBox from '@react-native-community/checkbox';
import {COLORS, SIZES, FONTS, icons} from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import {validateInput} from '../utils/actions/formActions';
import {reducer} from '../utils/reducers/formReducers';
import {launchImageLibrary} from 'react-native-image-picker';
import {postRegister} from '../api/axios';
import DatePickerModal from '../components/DatePickerModal';
import {Picker} from '@react-native-picker/picker';

const initialState = {
  inputValues: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birthdate: '',
    country: '',
    password: '',
    confirmPassword: '',
  },
  inputValidities: {
    first_name: false,
    last_name: false,
    email: false,
    phone: false,
    birthdate: false,
    country: false,
    password: false,
    confirmPassword: false,
  },
  formIsValid: false,
};
const countries = ['Barranquilla'];

const Signup = ({navigation}) => {
  const [isChecked, setChecked] = useState(false);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const validationResult = validateInput(inputId, inputValue);
      dispatchFormState({
        type: 'UPDATE_INPUT',
        inputId,
        inputValue,
        validationResult,
      });
    },
    [dispatchFormState],
  );

  const pickImageHandler = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        setSelectedImage(response.assets?.[0]?.uri);
      }
    });
  };

  const signupHandler = async () => {
    if (!formState.formIsValid || !isChecked) {
      Alert.alert(
        'Invalid Input',
        'Please fill in all fields and accept the terms.',
      );
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Debe seleccionar una imagen');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();

    formData.append('users', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    formData.append('first_name', formState.inputValues.first_name);
    formData.append('last_name', formState.inputValues.last_name);
    formData.append('email', formState.inputValues.email);
    formData.append('phone', formState.inputValues.phone);
    formData.append('birthdate', formState.inputValues.birthdate);
    formData.append('country', formState.inputValues.country);
    formData.append('password', formState.inputValues.password);

    try {
      const response = await postRegister('users', formData);

      if (response.status !== 201) {
        throw new Error(response.message || 'Something went wrong!');
      } else {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('SuccessAccount', {
          email: formState.inputValues.email,
        });
      }
    } catch (err) {
      if (err.status == 409) {
        setShowModal(true);
        setError(err);
      } else {
        Alert.alert('Error', err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = useCallback(
    date => {
      setShowDatePicker(false); // Cerrar el modal
      inputChangedHandler('birthdate', date); // Actualizar el valor y validar
    },
    [setShowDatePicker, inputChangedHandler],
  );

  return (
    <ImageBackground
      source={require('../assets/Fondo1.png')}
      style={styles.background}
      resizeMode="cover">
      <SafeAreaView>
        {isLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{color: '#fff', marginTop: 10}}>
              Creando cuenta...
            </Text>
          </View>
        )}
        <View>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerIconContainer}>
              <Image source={icons.back} style={styles.back} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign Up</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity
                  onPress={pickImageHandler}
                  style={styles.avatar}>
                  {selectedImage ? (
                    <Image
                      source={{uri: selectedImage}}
                      style={styles.avatar}
                    />
                  ) : (
                    <Image
                      source={icons.camera}
                      resizeMode="contain"
                      style={styles.camera}
                    />
                  )}
                </TouchableOpacity>
              </View>
              <Input
                id="first_name"
                placeholder="Nombre(s)"
                placeholderTextColor="white"
                value={formState.inputValues.first_name}
                onChangeText={text => inputChangedHandler('first_name', text)}
                errorText={
                  formState.inputValidities.first_name
                    ? null
                    : ['Nombre(s) Requeridos']
                }
              />
              <Input
                id="last_name"
                placeholder="Apellidos"
                placeholderTextColor="white"
                value={formState.inputValues.last_name}
                onChangeText={text => inputChangedHandler('last_name', text)}
                errorText={
                  formState.inputValidities.last_name
                    ? null
                    : ['Apellidos Requeridos.']
                }
              />
              <Input
                id="email"
                placeholder="Correo Electronico"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={formState.inputValues.email}
                onChangeText={text => inputChangedHandler('email', text)}
                errorText={
                  formState.inputValidities.email
                    ? null
                    : ['Correo es Invalido']
                }
              />
              <Input
                id="phone"
                placeholder="Celular"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formState.inputValues.phone}
                onChangeText={text => inputChangedHandler('phone', text)}
                errorText={
                  formState.inputValidities.phone
                    ? null
                    : ['Celular es Invalido']
                }
              />
              <View style={{margin: 5}} />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}>
                <Text
                  style={{
                    color: COLORS.black,
                  }}>
                  {formState.inputValues.birthdate || 'Fecha de Nacimiento'}
                </Text>
              </TouchableOpacity>

              <View style={{margin: 5}} />
              {showDatePicker && (
                <DatePickerModal
                  open={showDatePicker}
                  startDate="1900-01-01"
                  selectedDate={formState.inputValues.birthdate} // Fecha seleccionada actualmente
                  onClose={() => setShowDatePicker(false)} // Acción al cerrar
                  onChangeStartDate={onDateChange} // Acción al seleccionar una fecha
                />
              )}
              <View style={styles.selectContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formState.inputValues.country}
                    onValueChange={value =>
                      inputChangedHandler('country', value)
                    }
                    style={styles.picker}
                    dropdownIconColor={COLORS.black} // Dropdown arrow color
                  >
                    <Picker.Item
                      label="Seleccione Ciudad"
                      value=""
                      color="#999"
                      disabled={true}
                    />
                    {countries.map(country => (
                      <Picker.Item
                        key={country}
                        label={country}
                        value={country}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={{margin: 5}} />
              <Input
                id="password"
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry
                value={formState.inputValues.password}
                onChangeText={text => inputChangedHandler('password', text)}
                errorText={
                  formState.inputValues.password &&
                  formState.inputValues.confirmPassword &&
                  formState.inputValues.password !==
                    formState.inputValues.confirmPassword
                    ? 'Contraseñas no Coinciden'
                    : !formState.inputValidities.password
                    ? 'Contraseña Invalida'
                    : null
                }
              />

              <Input
                id="confirmPassword"
                placeholder="Confirma Contraseña"
                placeholderTextColor="#999"
                secureTextEntry
                value={formState.inputValues.confirmPassword}
                onChangeText={text =>
                  inputChangedHandler('confirmPassword', text)
                }
                errorText={
                  formState.inputValues.password &&
                  formState.inputValues.confirmPassword &&
                  formState.inputValues.password !==
                    formState.inputValues.confirmPassword
                    ? 'Contraseñas no Coinciden.'
                    : !formState.inputValidities.confirmPassword
                    ? 'Contraseña Invalida.'
                    : null
                }
              />
              <View style={styles.checkBoxContainer}>
                <CheckBox value={isChecked} onValueChange={setChecked} />
                <Text style={{color: 'white', textAlign: 'center'}}>
                  Al crear una cuenta, aceptas nuestros Términos y Política de
                  Privacidad
                </Text>
              </View>

              <TouchableOpacity
                onPress={signupHandler}
                disabled={!formState.formIsValid || isLoading}
                style={[
                  styles.button,
                  (!formState.formIsValid || isLoading) && styles.buttonDisabled,
                ]}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.text}> Crear Cuenta</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={{margin: 30}} />
            <View style={styles.bottomContainer}>
              <Text style={{color: 'white'}}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text> Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <Modal transparent={true} visible={showModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={icons.fallo} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>El Usuario ya Existe</Text>
              <Text style={styles.modalMessage}>
                Hubo un error al Crear Usuario. Por favor, intenta nuevamente.
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily:"Poppins-Bold"
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    left: 20,
  },
  back: {
    height: 16,
    width: 16,
    tintColor: COLORS.black,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // semi-transparente
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    height: 82,
    width: 82,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryWhite,
    borderRadius: 999,
    marginBottom: 8,
  },
  camera: {
    height: 36,
    width: 36,
    tintColor: '#363D4E',
  },
  inputField: {
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
  },
  inputHeader: {
    textTransform: 'uppercase',
    ...FONTS.body4,
    marginVertical: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  dateInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryWhite,
    marginBottom: 8,
  },
  selectContainer: {
    marginVertical: 8,
  },
  select: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryWhite,
  },
  label: {
    fontSize: 14,

    marginBottom: 4,
    color: COLORS.black,
    fontFamily: 'Poppins-Bold',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    marginRight: Platform.OS === 'ios' ? 8 : 16,
    height: 16,
    width: 16,
    marginTop: 4,
    backgroundColor: 'white',
  },
  button: {
   backgroundColor: '#944af5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  bottomLeft: {
    fontSize: 16,
    fontFamily: 'medium',
    color: 'black',
  },
  bottomRight: {
    fontSize: 16,
    fontFamily: 'medium',
    color: COLORS.primary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryWhite,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    fontSize: 16,
    color: COLORS.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#944af5',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.white,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#3b1e61',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold'
  },
});

export default Signup;
