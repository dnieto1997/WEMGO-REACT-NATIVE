import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES, FONTS, icons} from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import {validateInput} from '../utils/actions/formActions';
import {reducer} from '../utils/reducers/formReducers';
import Feather from 'react-native-vector-icons/Feather';

const isTestMode = true;

const initialState = {
  inputValues: {
    password: isTestMode ? '' : '',
    confirmPassword: isTestMode ? '' : '',
  },
  inputValidities: {
    password: false,
    confirmPassword: false,
  },
  formIsValid: false,
};

const CreatePassword = ({navigation}) => {
  const [isChecked, setChecked] = useState(false);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [hasEightCharacters, setHasEightCharacters] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({inputId, validationResult: result, inputValue});
    },
    [dispatchFormState],
  );

  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error);
    }
  }, [error]);

  useEffect(() => {
    // Check for at least 8 characters
    setHasEightCharacters(formState.inputValues.password.length >= 8);

    // Check for at least one uppercase letter
    setHasUppercase(/[A-Z]/.test(formState.inputValues.password));

    // Check for at least one symbol (you can customize the regex as needed)
    setHasSymbol(
      /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(formState.inputValues.password),
    );

    // Check for at least one number
    setHasNumber(/\d/.test(formState.inputValues.password));
  }, [formState.inputValues.password]);

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}>
            <Image source={icons.back} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Password</Text>
        </View>
        <View style={styles.formContainer}>
          <Text
            style={{
              ...FONTS.body4,
              textAlign: 'center',
              marginVertical: 12,
            }}>
            Choose a secure password that will be easy for you to remember.
          </Text>
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['password']}
            autoCapitalize="none"
            id="password"
            placeholder="*************"
            placeholderTextColor={COLORS.black}
            secureTextEntry={true}
            icon={icons.lock}
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['confirmPassword']}
            autoCapitalize="none"
            id="confirmPassword"
            placeholder="*************"
            placeholderTextColor={COLORS.black}
            secureTextEntry={true}
            icon={icons.lock}
          />
          <View>
            <View style={styles.viewContainer}>
              <Feather
                name="check"
                size={20}
                color={hasEightCharacters ? COLORS.primary : COLORS.black}
              />
              <Text
                style={{
                  ...FONTS.body4,
                  marginLeft: 12,
                  fontFamily: 'Roboto Regular',
                  color: hasEightCharacters ? COLORS.primary : COLORS.black,
                }}>
                Has at least 8 characters
              </Text>
            </View>
            <View style={styles.viewContainer}>
              <Feather
                name="check"
                size={20}
                color={
                  hasUppercase || hasSymbol ? COLORS.primary : COLORS.black
                }
              />
              <Text
                style={{
                  ...FONTS.body4,
                  marginLeft: 12,
                  fontFamily: 'Roboto Regular',
                  color:
                    hasUppercase || hasSymbol ? COLORS.primary : COLORS.black,
                }}>
                Has an uppercase letter or symbol
              </Text>
            </View>
            <View style={styles.viewContainer}>
              <Feather
                name="check"
                size={20}
                color={hasNumber ? COLORS.primary : COLORS.black}
              />
              <Text
                style={{
                  ...FONTS.body4,
                  marginLeft: 12,
                  fontFamily: 'Roboto Regular',
                  color: hasNumber ? COLORS.primary : COLORS.black,
                }}>
                Has a number
              </Text>
            </View>
          </View>
        </View>
        <Button
          title="Continue"
          filled
          onPress={() => navigation.navigate('Gender')}
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
  inputHeader: {
    textTransform: 'uppercase',
    ...FONTS.body4,
    marginVertical: 4,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
  },
  checkbox: {
    marginRight: 8,
    height: 16,
    width: 16,
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
  viewContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    marginVertical: 8,
  },
});
export default CreatePassword;
