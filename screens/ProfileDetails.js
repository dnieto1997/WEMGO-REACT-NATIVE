import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator, PermissionsAndroid,useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, images } from '../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getHttps,patchHttps, patchHttpsStories} from '../api/axios';
import Header from '../components/Header';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Config from 'react-native-config';


const ProfileDetails = ({ navigation }) => {
  const [DataUser, setDataUser] = useState({});
  const [User, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';
  const [imagenfile, setSelectedImageFile] = useState({})

  useEffect(() => {
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

    loadUserData();
  }, []);
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso para usar la cámara',
          message: 'La app necesita acceso a tu cámara para tomar fotos.',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  
  const selectImage = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
              Alert.alert('Permiso denegado', 'No se puede acceder a la cámara.');
              return;
            }
  
            launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
              if (response.didCancel || !response.assets) return;
              const photo = response.assets[0];
              setUser(prev => ({ ...prev, img: photo.uri }));
              setSelectedImageFile(photo);
            });
          },
        },
        {
          text: 'Galería',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
              if (response.didCancel || !response.assets) return;
              const photo = response.assets[0];
              setUser(prev => ({ ...prev, img: photo.uri }));
              setSelectedImageFile(photo);
            });
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };
  const fetchUserData = async (id) => {
    try {
      const response = await getHttps(`users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
  
      // Agregar los datos del usuario
      formData.append('first_name', User.first_name);
      formData.append('last_name', User.last_name);
      formData.append('phone', User.phone);
      formData.append('email', User.email);
      formData.append('country', User.country);
      formData.append('description', User.description?User.description:"");
  
      // Agregar imagen si fue seleccionada
      if (imagenfile?.uri) {
        formData.append('users', {
          uri: imagenfile.uri,
          type: imagenfile.type || 'image/jpeg', // tipo MIME
          name: imagenfile.fileName || 'profile.jpg',
        });
      }

     
  
      const response = await patchHttpsStories(`users/${User.id}`, formData,true);
      console.log(response.data)
      
  
      const updatedUser = response.data;
  
      // Actualizar AsyncStorage
      const storedUserData = await AsyncStorage.getItem('userData');
      const parsedStoredUserData = storedUserData ? JSON.parse(storedUserData) : {};
  
      const userData = {
        authToken: parsedStoredUserData.authToken || updatedUser.token,
        id: updatedUser.id,
        user: updatedUser.user || parsedStoredUserData.user,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        status: updatedUser.status,
        country: updatedUser.country,
      };
  
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setDataUser(userData);
  
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.navigate('Profile');
    } catch (error) {
      console.log(JSON.stringify(error))
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    } finally {
      setUpdating(false);
    }
  };
  
  

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Detalles" />
        <View style={{ alignItems: 'center' }}>
          {/* Imagen del usuario */}
          <View style={{ position: 'relative', alignItems: 'center' }}>
  <Image
    source={User.img ? { uri: User.img } : images.avatar2}
    resizeMode="cover"
    style={styles.avatar}
  />
  <TouchableOpacity
    style={styles.editAvatarButton}
    onPress={selectImage}
  >
    <MaterialIcons name="camera-alt" size={22} color="white" />
  </TouchableOpacity>
</View>
          <Text style={styles.avatarName}>{User.first_name + ' ' + User.last_name}</Text>

          {/* Campos Editables */}
          <View style={styles.editInputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#fff',              // Fondo blanco siempre
                  color: isDarkMode ? '#000' : '#000',  // Texto negro en ambos modos
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins-Bold',
                  flex: 1,
                },
              ]}
              value={User.first_name}
              onChangeText={(text) => setUser({ ...User, first_name: text })}
            />
            <TouchableOpacity>
              <MaterialIcons name="mode-edit" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.editInputContainer}>
            <TextInput
             style={[
              styles.input,
              {
                backgroundColor: '#fff',              // Fondo blanco siempre
                color: isDarkMode ? '#000' : '#000',  // Texto negro en ambos modos
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
                flex: 1,
              },
            ]}
              value={User.last_name}
              onChangeText={(text) => setUser({ ...User, last_name: text })}
            />
            <TouchableOpacity>
              <MaterialIcons name="mode-edit" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.editInputContainer}>
            <TextInput
           style={[
            styles.input,
            {
              backgroundColor: '#fff',              // Fondo blanco siempre
              color: isDarkMode ? '#000' : '#000',  // Texto negro en ambos modos
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Poppins-Bold',
              flex: 1,
            },
          ]}
              value={User.phone}
              onChangeText={(text) => setUser({ ...User, phone: text })}
              keyboardType="phone-pad"
            />
            <TouchableOpacity>
              <MaterialIcons name="mode-edit" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.editInputContainer}>
            <TextInput
             style={[
              styles.input,
              {
                backgroundColor: '#fff',              // Fondo blanco siempre
                color: isDarkMode ? '#000' : '#000',  // Texto negro en ambos modos
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
                flex: 1,
              },
            ]}
              value={User.email}
              editable={false} // No permitir edición del correo
            />
          </View>

          <View style={styles.editInputContainer}>
            <TextInput
             style={[
              styles.input,
              {
                backgroundColor: '#fff',              // Fondo blanco siempre
                color: isDarkMode ? '#000' : '#000',  // Texto negro en ambos modos
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
                flex: 1,
              },
            ]}
              value={User.country}
              onChangeText={(text) => setUser({ ...User, country: text })}
            />
            <TouchableOpacity>
              <MaterialIcons name="mode-edit" size={20} color="gray" />
            </TouchableOpacity>
          </View>


          <View style={styles.editInputContainerDes}>
 <TextInput
  style={[
    {
      backgroundColor: '#fff',
      color: isDarkMode ? '#000' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Poppins-Bold',
      flex: 1,
      height: 100,
      textAlignVertical: 'top',
      padding: 10,
    },
  ]}
  value={User.description}
  onChangeText={(text) => {
    if (text.length <= 150) {
      setUser({ ...User, description: text });
    }
  }}
  multiline={true}
  numberOfLines={5}
  placeholder="Escribe una descripción..."
/>
<Text style={{ alignSelf: 'flex-end', color: 'gray', marginRight: 10 }}>
  {User.description?.length || 0}/150
</Text>
  <TouchableOpacity>
    <MaterialIcons name="mode-edit" size={20} color="gray" />
  </TouchableOpacity>
</View>


          {/* Botón para guardar */}
          <Button
            title={updating ? 'Saving...' : 'Save Now'}
            filled
            onPress={handleUpdateProfile}
            disabled={updating}
            style={{
              width: SIZES.width - 32,
              marginVertical: 16,
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// 🔹 **Estilos**
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.black,
  },
  avatar: {
    height: 120,
    width: 120,
    borderRadius: 999,
    marginVertical: 22,
  },
  avatarName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  editInputContainer: {
    height: 50,
    width: SIZES.width - 32,
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
    editInputContainerDes: {
    height: 100,
    width: SIZES.width - 32,
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 6,
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#00000088',
    borderRadius: 20,
    padding: 6,
  },
});

export default ProfileDetails;
