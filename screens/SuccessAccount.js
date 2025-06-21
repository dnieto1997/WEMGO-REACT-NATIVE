import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { COLORS, images } from '../constants';
import { postHttps } from '../api/axios';

const SuccessAccount = ({ navigation, route }) => {
  const { email } = route.params;

  const sendEmailOTP = async () => {
    try {
      const response = await postHttps('mail/send-mail', {
        to: email, 
      });
       
     
      if (response.status === 201) {
        Alert.alert(
          'Éxito',
          'Se ha enviado un código de verificación a tu correo electrónico.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OTPVerification2', { email }),
            },
          ]
        );
      } else {
        throw new Error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    }
  };
  

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginVertical: 22 }}>
          <Image
            source={images.success}
            resizeMode="contain"
            style={styles.success}
          />
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.bigTitle}>Cuenta Creada</Text>
          <Text style={styles.title}>
        El código OTP será enviado al correo electrónico para verificación
          </Text>
          <Text style={styles.boldTitle}>{email}</Text>
          <Text style={styles.title}>
           Por favor, revisa tu bandeja de entrada para verificar tu cuenta.
          </Text>
          <Button
            title="Enviar Codigo OTP"
            filled
            onPress={sendEmailOTP}
            style={{
              marginTop: 16,
            }}
          />

        </View>
      </View>
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
    backgroundColor: "black",
    padding: 16,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
  },
  boldTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
      color: "#944af5",
    textAlign: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Light',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 16,
  },
  bigTitle: {
    fontSize: 22,
    fontFamily: 'Roboto Bold',
    color: "#944af5",
    textAlign: 'center',
  },
  success: {
    width: 232,
    height: 184,
  },
});

export default SuccessAccount;
