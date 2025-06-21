import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
} from 'react-native';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES, FONTS, icons} from '../constants';
import Input from '../components/Input';
import Button from '../components/Button';
import {validateInput} from '../utils/actions/formActions';
import {reducer} from '../utils/reducers/formReducers';
import Header from '../components/Header';
import {patchHttps} from '../api/axios';


const ChangePassword = ({navigation}) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [pass, setPass] = useState('');
  const [newpass, setNewpass] = useState('');
  const [confirmpass, setConfirmPass] = useState('');
  const [showpass, setShowPass] = useState(false);
  const [shownewpass, setShownewPass] = useState(false);
  const [showconfirmpass, setShowconfirmPass] = useState(false);

  const handleChangePassword = async () => {
    if (newpass !== confirmpass) {
      Alert.alert(
        'Error',
        'La nueva contraseña y la confirmación no coinciden',
      );
      return;
    }

    try {
      setIsLoading(true);
      const body = {
        pass: pass,
        newpass: newpass,
      };
    
      const response = await patchHttps('users/changepass', body);

      if (response.status === 200) {
        setSuccessModal(true);
      } else {
        setShowModal(true);
      }
    } catch (err) {
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title={'Cambio de Contraseña'} />
        <View style={styles.formContainer}>
        <View style={styles.passwordContainer}>
  <Input
    autoCapitalize="none"
    id="pass"
    placeholder="Contraseña Actual"
    placeholderTextColor={COLORS.white}
    secureTextEntry={!showpass}
    icon={icons.lock}
    value={pass}
    onChangeText={setPass}
  />
  <TouchableOpacity
    onPress={() => setShowPass(!showpass)}
    style={styles.eyeButton}>
    <Image
      source={showpass ? icons.eye : icons.eyeOff}
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>

<View style={styles.passwordContainer}>
  <Input
    autoCapitalize="none"
    id="newpass"
    placeholder="Nueva Contraseña"
    placeholderTextColor={COLORS.white}
    secureTextEntry={!shownewpass}
    icon={icons.lock}
    value={newpass}
    onChangeText={setNewpass}
  />
  <TouchableOpacity
    onPress={() => setShownewPass(!shownewpass)}
    style={styles.eyeButton}>
    <Image
      source={shownewpass ? icons.eye : icons.eyeOff}
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>

<View style={styles.passwordContainer}>
  <Input
    autoCapitalize="none"
    id="password"
    placeholder="Confirma Nueva Contraseña"
    placeholderTextColor={COLORS.white}
    secureTextEntry={!showconfirmpass}
    icon={icons.lock}
    value={confirmpass}
    onChangeText={setConfirmPass}
  />
  <TouchableOpacity
    onPress={() => setShowconfirmPass(!showconfirmpass)}
    style={styles.eyeButton}>
    <Image
      source={showconfirmpass ? icons.eye : icons.eyeOff}
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>
        </View>
        <TouchableOpacity
  style={[styles.customButton, isLoading && { opacity: 0.7 }]}
  onPress={handleChangePassword}
  disabled={isLoading}
>
  <Text style={styles.customButtonText}>
    {isLoading ? 'Guardando...' : 'Guardar'}
  </Text>
</TouchableOpacity>


        {/* Modal de Error */}
        <Modal transparent={true} visible={showModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={icons.fallo} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Error al cambiar contraseña</Text>
              <Text style={styles.modalMessage}>
                No se pudo cambiar la contraseña. Verifica tu contraseña actual.
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de Éxito */}
        <Modal transparent={true} visible={successModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={icons.check} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>¡Contraseña cambiada!</Text>
              <Text style={styles.modalMessage}>
                Tu contraseña se ha actualizado correctamente.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSuccessModal(false);
                  navigation.goBack();
                }}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: 'black',
  },
    eyeIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    position: 'relative',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  formContainer: {
    backgroundColor: 'black',
    borderRadius: 20,
    marginVertical: 32,
    padding: 22,
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
  customButton: {
    backgroundColor: '#944af5',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 10,
    width: '100%',
  },
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold', // o cualquier fuente que uses
  },
});

export default ChangePassword;
