import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useRef, useState,useEffect} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import OTPTextInput from 'react-native-otp-textinput';
import { SIZES, icons } from '../constants';
import { postHttps } from '../api/axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ForgetPasswordEmailCode = ({ navigation, route }) => {
  const { email } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   const [secondsLeft, setSecondsLeft] = useState(120); // 2:00 minutos
  const intervalRef = useRef(null);

   useEffect(() => {
    startCountdown();
    return () => clearInterval(intervalRef.current);
  }, []);

  const startCountdown = () => {
    clearInterval(intervalRef.current);
    setSecondsLeft(120);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(1, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs} minutos restantes`;
  };
  const validateOTP = async () => {
    if (!otpCode || otpCode.length !== 4) {
      Alert.alert('Código inválido', 'Por favor ingresa un código OTP de 4 dígitos.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await postHttps('mail/validate', {
        email: email,
        otp: otpCode,
      });

      if (response.status === 201) {
        Alert.alert('Éxito', 'Código validado correctamente.');
        navigation.navigate('ChangePassword2', { email: email });
      } else {
        Alert.alert('Error', 'Código inválido. Intenta nuevamente.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al validar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const response = await postHttps('mail/send-mail', { to: email });
      if (response.status === 201) {
        Alert.alert('Éxito', 'Se ha enviado un nuevo código a tu correo.');
      } else {
        throw new Error('No se pudo reenviar el código.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo reenviar el código. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconContainer}>
           <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Validar código</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Hemos enviado un código a tu correo:</Text>
          <Text style={styles.boldTitle}>{email}</Text>

          <View style={{ marginVertical: 22 }}>
            <OTPTextInput
              textInputStyle={styles.OTPStyle}
              inputCount={4}
              tintColor={styles.OTPStyle.borderColor}
              handleTextChange={(text) => setOtpCode(text)}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.title}>¿No recibiste el código?</Text>
            <TouchableOpacity onPress={resendCode}>
              <Text style={styles.boldTitle}> Reenviar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
        </View>

        <Button title="Validar código" filled onPress={validateOTP} loading={isLoading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    height: 16,
    width: 16,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    position: 'absolute',
    right: (SIZES.width - 32) / 2 - 64,
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
  },
  boldTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#944af5',
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  OTPStyle: {
    backgroundColor: '#222',
    borderColor: '#944af5',
    borderRadius: 10,
    height: 58,
    width: 58,
    borderBottomWidth: 1,
    color: '#fff',
  },
  time: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ForgetPasswordEmailCode;
