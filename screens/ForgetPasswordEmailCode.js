import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import OTPTextInput from 'react-native-otp-textinput';
import { COLORS, SIZES, icons } from '../constants';
import { postHttps } from '../api/axios'; // Asegúrate de tener esta función configurada

const ForgetPasswordEmailCode = ({ navigation, route }) => {
  const { email } = route.params;

  const [otpCode, setOtpCode] = useState(''); // Estado para almacenar el código OTP
  const [isLoading, setIsLoading] = useState(false);

  const validateOTP = async () => {
    if (!otpCode || otpCode.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter a valid 4-digit OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await postHttps('mail/validate', {
        email: email,
        otp: otpCode, // Enviar el código OTP ingresado
      });

      if (response.status === 201) {
        Alert.alert('Success', 'OTP validated successfully.');
        navigation.navigate('ChangePassword2',{email:email}); // Navegar a la pantalla de cambio de contraseña
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while validating the OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const response = await postHttps('mail/send-mail', { to: email });
      if (response.status === 201) {
        Alert.alert('Success', 'A new OTP has been sent to your email.');
      } else {
        throw new Error('Failed to resend OTP.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}
          >
            <Image source={icons.back} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forget Password</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            A verification code has been sent to your email:
          </Text>
          <Text style={styles.boldTitle}>{email}</Text>
          <View style={{ marginVertical: 22 }}>
            <OTPTextInput
              textInputStyle={styles.OTPStyle}
              inputCount={4}
              tintColor={COLORS.primary}
              handleTextChange={(text) => setOtpCode(text)} // Actualizar el estado con el código OTP
            />
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={styles.title}>I didn't receive code.</Text>
            <TouchableOpacity onPress={resendCode}>
              <Text style={styles.boldTitle}>{' '}Resend Code</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.time}>2:00 Sec left</Text>
        </View>
        <Button
          title="Validate OTP"
          filled
          onPress={validateOTP}
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
  boldTitle: {
    fontSize: 16,
    fontFamily: 'Roboto Medium',
    color: COLORS.primary,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto Regular',
    color: COLORS.black,
    textAlign: 'center',
  },
  OTPStyle: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
    borderRadius: 10,
    height: 58,
    width: 58,
    backgroundColor: COLORS.secondaryWhite,
    borderBottomWidth: 1,
  },
  time: {
    fontSize: 16,
    fontFamily: 'Roboto Medium',
    color: COLORS.tertiary,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ForgetPasswordEmailCode;
