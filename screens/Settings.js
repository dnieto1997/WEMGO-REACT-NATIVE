import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import React, {useState, useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES, icons} from '../constants';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import {SocketContext} from '../context/SocketContext';

const Settings = ({navigation}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const {socket} = useContext(SocketContext);

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      if (socket) {
        socket.disconnect();
      }
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Configuración" />
        <View style={{margin: 20}} />

        <View style={styles.settingsContainer}>
          <View style={styles.settingHeaderContainer}>
            <Text style={styles.settingHeaderText}>Cuenta</Text>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: '#ccc',
              marginVertical: 8,
              width: '95%',
            }}
          />
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacySettings')}
              style={styles.settingItemContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialIcons name="security" size={24} color={COLORS.white} />
                <Text style={[styles.settingItemTitle, {marginLeft: 10}]}>
                  Privacidad de la Cuenta
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>

            <View
              style={{
                height: 1,
                backgroundColor: '#ccc',
                marginVertical: 8,
                width: '95%',
              }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ChangePassword')}
              style={styles.settingItemContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialIcons name="lock" size={24} color={COLORS.white} />
                <Text style={[styles.settingItemTitle, {marginLeft: 10}]}>
                  Cambio de Contraseña
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>

            <View
              style={{
                height: 1,
                backgroundColor: '#ccc',
                marginVertical: 8,
                width: '95%',
              }}
            />

            <TouchableOpacity
              style={styles.settingItemContainer}
              onPress={() => setShowLogoutModal(true)}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialCommunityIcons
                  name="logout-variant"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.settingItemTitle}>Cerrar Sesion</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal transparent={true} visible={showLogoutModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
           <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalMessage}>
              Estás a punto de cerrar sesión de tu cuenta. ¿Deseas continuar?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sí, salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  profileCardContainer: {
    height: 90,
    width: SIZES.width - 32,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginVertical: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 999,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Roboto Bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  menbership: {
    fontSize: 13,
    fontFamily: 'Roboto Regular',
    color: COLORS.primary,
  },
  settingsContainer: {
    width: SIZES.width - 32,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    backgroundColor: 'black',
  },
  settingHeaderContainer: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingHorizontal: 16,
  },
  settingHeaderText: {
    fontSize: 26,
    fontFamily: 'Roboto Bold',
    color: COLORS.white,
  },
  settingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingIcon: {
    height: 20,
    width: 20,
    tintColor: COLORS.white,
  },
  settingItemTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  viewContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.tansparentPrimary,
    marginTop: 8,
  },
  viewText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  rightText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
  },
  modalIcon: {
    width: 50,
    height: 50,
    tintColor: '#fff',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  modalMessage: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#944af5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
export default Settings;
