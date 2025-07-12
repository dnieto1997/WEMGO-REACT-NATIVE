import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import React, { useState,useEffect,useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import OTPTextInput from 'react-native-otp-textinput';
import { COLORS, SIZES, icons } from '../constants';
import { postHttps } from '../api/axios'; // Asegúrate de que esta función esté correctamente configurada.
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OTPVerification2 = ({ navigation, route }) => {
  const { email } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
    const [timer, setTimer] = useState(120); // 2 minutos = 120 segundos
  const intervalRef = useRef(null);

  
  useEffect(() => {
    // Inicia el contador
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(intervalRef.current);
  }, []);

  // Función para formatear segundos a MM:SS
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec} Min restantes`;
  };

  const verifyOTP = async () => {
    try {
      if (otpCode.length !== 4) {
        Alert.alert('Error', 'El código debe tener 4 dígitos.');
        return;
      }

      const response = await postHttps('mail/validatechange', {
        email,
        otp: otpCode,
      });

        if(response.status===201){
          Alert.alert('Exito', '¡Tu cuenta ha sido verificada! ', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'), // Redirige al Login
            },
          ]); 
        }


    } catch (error) {
      
      Alert.alert('Error', "Codigo Incorrecto"|| 'Verification failed. Please try again.');
    }
  };

  const renderResendCodeModal = () => {
    return (
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalSubContainer}>
              <Text style={styles.modalTitle}>¿No has recibido el código de verificación?</Text>
              <View style={styles.modalMiddleContainer}>
                <Text style={styles.modalMiddleTitle}>Código de verificación enviado a</Text>
                <Text style={styles.modalMiddleTitleBold}>{email}</Text>
              </View>
              <View style={styles.modalBottomContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                  }}
                  style={styles.btnCancel}
                >
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('Info', 'Se ha enviado un nuevo código de verificación a tu correo electrónico');
                  }}
                  style={styles.btnOkay}
                >
                  <Text style={styles.btnOkayText}>Reenviar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconContainer}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verificación OTP</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Código de verificación enviado a....</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={{ marginVertical: 22 }}>
            <OTPTextInput
              textInputStyle={styles.OTPStyle}
              inputCount={4}
              tintColor={"#944af5"}
              handleTextChange={(text) => setOtpCode(text)}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.title}>No recibí el código</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={{left:10,top:3}}>
              <Text style={styles.boldTitle}> Reenviar código </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.time}>{formatTime(timer)}</Text>
        </View>
        <Button title="Verificar Codigo" filled onPress={verifyOTP} />
      </View>
      {renderResendCodeModal()}
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
    fontFamily: 'Poppins-Bold',
    position: 'absolute',
    right: (SIZES.width - 32) / 2 - 100,
    color: 'white',
  },
  formContainer: {
    backgroundColor: "black",
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
  },
  boldTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: "#944af5",
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto Regular',
    color: "white",
    textAlign: 'center',
  },
    email: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color:"#944af5",
    textAlign: 'center',
    marginTop:10
  },
  OTPStyle: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
    borderRadius: 9999,
    height: 58,
    width: 58,
    backgroundColor: COLORS.secondaryWhite,
    borderBottomColor: 'transparent',
  },
  time: {
    fontSize: 16,
    fontFamily: 'Roboto Medium',
    color: "#944af5",
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalSubContainer: {
    height: 220,
    width: SIZES.width * 0.86,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Roboto Bold',
    color: "#944af5",
    textAlign: 'center',
  },
  modalMiddleContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  modalMiddleTitle: {
    fontSize: 16,
    fontFamily: 'Roboto Regular',
    color: COLORS.black,
  },
  modalMiddleTitleBold: {
    fontSize: 16,
    fontFamily: 'Roboto Bold',
    color: COLORS.black,
  },
  modalBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  btnCancel: {
    height: 40,
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor:  "#944af5",
    borderWidth: 1,
    borderRadius: 20,
  },
  btnCancelText: {
    fontSize: 16,
    fontFamily: 'Roboto Medium',
    color: COLORS.black,
  },
  btnOkay: {
    height: 40,
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:  "#944af5",
    borderRadius: 20,
  },
  btnOkayText: {
    fontSize: 16,
    fontFamily: 'Roboto Medium',
    color: COLORS.white,
  },
});

export default OTPVerification2;
