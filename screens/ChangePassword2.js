import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, icons } from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducers';
import { patchHttps } from '../api/axios';

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
      Alert.alert('An error occurred', error);
    }
  }, [error]);

  const changePasswordHandler = async () => {
    const { newPassword, confirmNewPassword } = formState.inputValues;

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match. Please try again.');
      return;
    }

    if (!formState.formIsValid) {
      Alert.alert('Invalid Input', 'Please ensure all fields are valid.');
      return;
    }

    setIsLoading(true);

  

    try {
      const response = await patchHttps('mail/change-password', {
        email,
        password: formState.inputValues.newPassword,
      });



      if (response.status !== 200) {
        throw new Error('Failed to update password. Please try again.');
      }

      Alert.alert('Success', 'Your password has been updated successfully.');
      navigation.navigate('Login');
    } catch (err) {
      console.log(err)
      console.error(err.message);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconContainer}>
            <Image source={icons.back} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            id="newPassword"
            onChangeText={(text) => inputChangedHandler('newPassword', text)} // Pass value correctly
            value={formState.inputValues.newPassword} // Bind value to input
            errorText={'Please enter a valid password.'}
            autoCapitalize="none"
            placeholder="New Password"
            placeholderTextColor={COLORS.black}
            secureTextEntry={true}
            icon={icons.lock}
          />
          <Input
            id="confirmNewPassword"
            onChangeText={(text) => inputChangedHandler('confirmNewPassword', text)} // Pass value correctly
            value={formState.inputValues.confirmNewPassword} // Bind value to input
            errorText={
              !formState.inputValidities['confirmNewPassword'] ? 'Passwords must match.' : null
            }
            autoCapitalize="none"
            placeholder="Confirm New Password"
            placeholderTextColor={COLORS.black}
            secureTextEntry={true}
            icon={icons.lock}
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
