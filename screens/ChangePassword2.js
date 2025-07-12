import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons } from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducers';
import { patchHttps } from '../api/axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const initialState = {
  inputValues: {
    newPassword: '',
    confirmNewPassword: '',
  },
  inputValidities: {
    newPassword: false,
    confirmNewPassword: false,
  },
  formIsValid: false,
};

const ChangePassword2 = ({ navigation, route }) => {
  const { email } = route.params;
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const validationResult = validateInput(inputId, inputValue); // Validate input
      dispatchFormState({
        inputId,
        validationResult,
        inputValue, // Ensure the input value is being passed correctly
      });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
          Alert.alert('Ocurrió un error', error);
    }
  }, [error]);

  const changePasswordHandler = async () => {
    const { newPassword, confirmNewPassword } = formState.inputValues;

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden. Inténtalo de nuevo.');
      return;
    }

    if (!formState.formIsValid) {
       Alert.alert('Campos inválidos', 'Por favor, asegúrate de que todos los campos sean válidos.');
      return;
    }

    setIsLoading(true);

  

    try {
      const response = await patchHttps('mail/change-password', {
        email,
        password: formState.inputValues.newPassword,
      });



      if (response.status !== 200) {
        throw new Error('No se pudo actualizar la contraseña. Inténtalo nuevamente.');
      }

            Alert.alert('Éxito', 'Tu contraseña ha sido actualizada correctamente.');
      navigation.navigate('Login');
    } catch (err) {
      console.log(err)
      console.error(err.message);
      setError(err.message || 'Algo salió mal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconContainer}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
        </View>
        <View style={styles.formContainer}>
        <Input
  id="newPassword"
  onChangeText={(text) => inputChangedHandler('newPassword', text)}
  value={formState.inputValues.newPassword}
  errorText={'Por favor, ingresa una contraseña válida.'}
  autoCapitalize="none"
  placeholder="Nueva contraseña"
  placeholderTextColor={COLORS.black}
  secureTextEntry={true}
  iconComponent={<MaterialIcons name="lock" size={20} color={COLORS.black} />}
/>
     <Input
  id="confirmNewPassword"
  onChangeText={(text) => inputChangedHandler('confirmNewPassword', text)}
  value={formState.inputValues.confirmNewPassword}
  errorText={
    !formState.inputValidities['confirmNewPassword']
      ? 'Las contraseñas deben coincidir.'
      : null
  }
  autoCapitalize="none"
  placeholder="Confirmar nueva contraseña"
  placeholderTextColor={COLORS.black}
  secureTextEntry={true}
  iconComponent={<MaterialIcons name="lock" size={20} color={COLORS.black} />}
/>
        </View>
        <Button
          title="Save Now!"
          filled
          onPress={changePasswordHandler}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: SIZES.width - 32,
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
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
  },
});

export default ChangePassword2;
