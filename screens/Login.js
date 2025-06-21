import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Platform,
  ImageBackground,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CheckBox from '@react-native-community/checkbox';
import {COLORS, SIZES, FONTS, icons, images} from '../constants';
import Input from '../components/Input';

import {loginHttps} from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const Login = ({navigation}) => {
  const [isChecked, setChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const consumirApi = async () => {
    if (email === '' || password === '') {
      setShowModal(true);
      return;
    }
    try {
      const response = await loginHttps({email, password});
   

      if (response.data.status === 'ACTIVE') {
        const fcmToken = await messaging().getToken();
        const userData = {
          authToken: response.data.token,
          id: response.data.id,
          user: response.data.user,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          role: response.data.role,
          status: response.data.status,
          country: response.data.country,
        };

        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('fcmToken', fcmToken);

        if (response.data.interest == 1) {
          navigation.navigate('Main');
        } else {
          navigation.navigate('Interests');
        }
      } else if (response.data.status === 'ACTIVATING') {
        navigation.navigate('SuccessAccount',{email:response.data.email});
      } else {
        setShowModal(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setShowModal(true);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/Fondo1.png')}
      style={styles.background}
      resizeMode="cover" // puedes usar "cover", "contain", "stretch"
    >
      <SafeAreaView style={styles.area}>
        <View style={styles.centeredContainer}>
          <View style={styles.card}>
            {/* Logo en el centro */}
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
            />

            <Input
              id="email"
              placeholder="Correo"
              placeholderTextColor={COLORS.white}
              keyboardType="email-address"
              icon={icons.email}
              value={email}
              onChangeText={setEmail}
            />

            {/* 🔹 Contenedor del campo de contraseña con icono de ojo */}
            <View style={styles.passwordContainer}>
              <Input
                autoCapitalize="none"
                id="password"
                placeholder="Contraseña"
                placeholderTextColor={COLORS.white}
                secureTextEntry={!showPassword}
                icon={icons.lock}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}>
                <Image
                  source={showPassword ? icons.eye : icons.eyeOff}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.checkBoxContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  style={styles.checkbox}
                  value={isChecked}
                  tintColor={isChecked ? COLORS.primary : 'gray'}
                  onValueChange={setChecked}
                  boxType="square"
                  onTintColor={COLORS.primary}
                  onFillColor={COLORS.primary}
                  onCheckColor={COLORS.white}
                />
                <Text style={{...FONTS.body5, color: 'white'}}>Recordar</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgetPassword')}>
                <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* 🔹 Botón "Sign In" más grande */}
            <TouchableOpacity style={styles.signInButton} onPress={consumirApi}>
              <Text style={styles.signInButtonText}>Ingresar</Text>
            </TouchableOpacity>

            <View style={styles.bottomContainer}>
              <Text style={styles.bottomLeft}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.bottomRight}> Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal transparent={true} visible={showModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={icons.fallo} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Error al iniciar sesión</Text>
              <Text style={styles.modalMessage}>
                No se pudo iniciar sesión. Revisa tu correo y contraseña.
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
  area: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  linkText: {
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    width: '100%',
  },
  checkbox: {
    marginRight: Platform.OS === 'ios' ? 8 : 16,
    height: 16,
    width: 16,
  },
  signInButton: {
    backgroundColor: '#944af5',
    paddingVertical: 18,
    width: '100%',
    borderRadius: 30, // Más redondeado como en la imagen
    alignItems: 'center',
    marginTop: 20,
  },
  signInButtonText: {
    fontSize: 18, // Texto más grande
    fontWeight: 'bold',
    color: COLORS.white,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  bottomLeft: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    color: 'white',
  },
  bottomRight: {
    fontSize: 16,
    color: '#944af5',
    fontFamily: 'Poppins-Bold',
    top: 2,
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
  },
});

export default Login;
