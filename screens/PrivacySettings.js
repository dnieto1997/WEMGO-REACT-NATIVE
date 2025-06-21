import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { getHttps, patchHttps } from '../api/axios'; // PATCH para actualizar
import { COLORS } from '../constants';

const PrivacySettings = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [dataUser, setDataUser] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde AsyncStorage y luego desde backend
  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setDataUser(parsedData);
        fetchUserData(parsedData.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Obtener usuario desde la API
  const fetchUserData = async id => {
    try {
      const response = await getHttps(`users/${id}`);
      const userData = response.data;
      setIsPrivate(userData.privacity === "1");
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar privacidad (actualiza UI primero, luego API)
  const togglePrivacy = async () => {
    if (!dataUser) return;

    const previousPrivacy = isPrivate;
    const newPrivacyValue = previousPrivacy ? 0 : 1;

    // Actualiza UI inmediatamente
    setIsPrivate(!previousPrivacy);

    try {
      setLoading(true);

      // PATCH a backend
      await patchHttps(`users/privacity/${dataUser.id}`, {
        privacity: newPrivacyValue,
      });

      // Confirmar estado desde backend
      await fetchUserData(dataUser.id);
    } catch (error) {
      console.error('Error changing privacy:', error);

      // Revertir UI en caso de error
      setIsPrivate(previousPrivacy);

      // Alerta opcional
      Alert.alert('Error', 'No se pudo cambiar la privacidad. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio del Switch
  const onToggleSwitch = () => {
    togglePrivacy();
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'white' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.header}>
        <Header title="Privacidad de la cuenta" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.settingRow}>
          <Text style={[styles.title, { color: 'white' }]}>Cuenta privada</Text>
          <Switch
            value={isPrivate}
            onValueChange={onToggleSwitch}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={isPrivate ? COLORS.primary : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.description, { color: 'white' }]}>
          Si tu cuenta es pública, cualquier persona dentro y fuera de Wemgo podrá ver tu perfil y tus publicaciones, incluso quienes no tengan una cuenta de Wemgo.
        </Text>

        <Text style={[styles.description, { color: 'white' }]}>
          Si tu cuenta es privada, solo los seguidores que apruebes podrán ver el contenido que compartas, como tus fotos o videos, tus listas de seguidores y seguidos. Cierta información de tu perfil, como la foto y el nombre de usuario, es visible para todas las personas dentro y fuera de Wemgo.{' '}
          <Text style={{ color: COLORS.primary }}>Más información</Text>
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    top: 25,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
    marginBottom: 15,
  },
  header: {
    left: 14,
    top: 15,
  },
});

export default PrivacySettings;
