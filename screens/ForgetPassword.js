import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, icons } from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducers';
import { postHttps } from '../api/axios'; // Asegúrate de tener configurada esta función para solicitudes HTTP.
import Header from '../components/Header';

const isTestMode = false; // Cambia esto a `true` solo para pruebas

const initialState = {
  inputValues: {
    email: '', 
  },
  inputValidities: {
    email: false,
  },
  formIsValid: false,
};



const ForgetPassword = ({ navigation }) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [modalVisible, setModalVisible] = useState(false);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue); // Validar el valor ingresado
      dispatchFormState({ inputId, validationResult: result, inputValue });
  
    },
    [dispatchFormState]

 
  );

  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred', error);
    }
  }, [error]);

  const sendResetEmail = async () => {
    const email = formState.inputValues.email;

    if (!formState.formIsValid) {
      Alert.alert('Invalid Input', 'Please provide a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await postHttps('mail/send-mail', { to: email });


      if (response.status!=201) {
        throw new Error('Failed to send reset email. Please try again.');
      }

      setModalVisible(true); // Mostrar modal de éxito
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuccessModal = () => (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalSubContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Password Reset Email Sent</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalBodyText}>
                An email has been sent to you. Follow the directions in the email to reset your password.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('ForgetPasswordEmailCode', {
                    email:formState.inputValues.email, // Pasa el email como parámetro
                  });
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        
          <Header title={"Restablecer Contraseña"}/>
       
        <View style={styles.formContainer}>
          <Text style={styles.title}>
           Enviaremos un correo electrónico a la dirección que registraste para recuperar tu contraseña
          </Text>
          <Input
            id="email"
            value={formState.inputValues.email} // Asegurarte de pasar el valor actual
            onChangeText={(text) => inputChangedHandler('email', text)} // Actualiza el valor cuando cambia
            errorText={
              !formState.inputValidities['email'] && 'Por favor, ingresa una dirección de correo válida.'
            }
            placeholder="example@gmail.com"
            placeholderTextColor={"white"}
            keyboardType="email-address"
            icon={icons.email}
          />
        </View>
        <Button title="Enviar" filled onPress={sendResetEmail} loading={isLoading} />
      </View>
      {renderSuccessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    backgroundColor:  "black",
    padding: 16,
  },
 
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    height: 16,
    width: 16,
    tintColor: COLORS.black,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Roboto Black',
    position: 'absolute',
    right: (SIZES.width - 32) / 2 - 64,
    color: 'black',
  },
  formContainer: {
    backgroundColor: "black",
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: "white",
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalSubContainer: {
    height: 220,
    width: SIZES.width * 0.8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  modalHeader: {
    height: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    fontSize: 20,
  },
  modalBodyText: {
    ...FONTS.body3,
    textAlign: 'center',
    marginVertical: 22,
    marginHorizontal: 22,
  },
  modalButton: {
    height: 42,
    width: 188,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto Medium',
    color: COLORS.white,
  },
});

export default ForgetPassword;
