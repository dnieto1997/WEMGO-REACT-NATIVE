import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES, icons } from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducers';
import { postHttps } from '../api/axios';
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const initialState = {
  inputValues: { email: '' },
  inputValidities: { email: false },
  formIsValid: false,
};

const ForgetPassword = ({ navigation }) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [modalVisible, setModalVisible] = useState(false);

  const inputChangedHandler = useCallback((inputId, inputValue) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({ inputId, validationResult: result, inputValue });
  }, []);

  useEffect(() => {
    if (error) {
      alert('Ocurrió un error', error);
    }
  }, [error]);

  const sendResetEmail = async () => {
    const email = formState.inputValues.email;
    if (!formState.formIsValid) {
      alert('Correo inválido', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await postHttps('mail/send-mail', { to: email });
      if (response.status != 201) throw new Error('No se pudo enviar el correo. Intenta nuevamente.');
      setModalVisible(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Algo salió mal.');
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
              <Text style={styles.modalHeaderText}>¡Correo enviado!</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalBodyText}>
                Te hemos enviado un correo para que restablezcas tu contraseña.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('ForgetPasswordEmailCode', {
                    email: formState.inputValues.email,
                  });
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Continuar</Text>
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
        <Header title="Restablecer Contraseña" />
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            Enviaremos un correo electrónico a la dirección que registraste para recuperar tu contraseña.
          </Text>
          <Input
            id="email"
            value={formState.inputValues.email}
            onChangeText={(text) => inputChangedHandler('email', text)}
            errorText={
              !formState.inputValidities['email'] && 'Por favor, ingresa una dirección de correo válida.'
            }
            placeholder="example@gmail.com"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
             iconComponent={<MaterialIcons name="email" size={20} color="#ccc" />}
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
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#111',
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSubContainer: {
    height: 230,
    width: SIZES.width * 0.8,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  modalHeader: {
    height: 60,
    backgroundColor: '#944af5',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeaderText: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 18,
  },
  modalBodyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#ccc',
    textAlign: 'center',
    marginVertical: 20,
    marginHorizontal: 22,
  },
  modalButton: {
    height: 44,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#944af5',
    borderRadius: 25,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
});

export default ForgetPassword;
