import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  FlatList
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { postHttpsStories } from '../api/axios';
import { useNavigation } from '@react-navigation/native';
import { SocketContext } from '../context/SocketContext';
import Ionicons from 'react-native-vector-icons/Ionicons';


const CreateEventV2 = () => {
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [hasSentFeed, setHasSentFeed] = useState(false);


  

  const navigation = useNavigation();
  const { socket, sendNewFeed } = useContext(SocketContext);

  const openImagePicker = () => {
    const options = { mediaType: 'mixed', selectionLimit: 10 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Selección cancelada');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo acceder a la galería.');
      } else {
        setSelectedMedia(prev => [...prev, ...(response.assets || [])]);
      }
    });
  };

  const openCameraForPhoto = () => {
    const options = { mediaType: 'photo', saveToPhotos: true };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Captura de foto cancelada');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo abrir la cámara para foto.');
      } else {
        setSelectedMedia(prev => [...prev, ...(response.assets || [])]);
      }
    });
  };

  const openCameraForVideo = () => {
    const options = { mediaType: 'video', saveToPhotos: true };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Captura de video cancelada');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo abrir la cámara para video.');
      } else {
        setSelectedMedia(prev => [...prev, ...(response.assets || [])]);
      }
    });
  };

  const removeMedia = (index) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };


const handleUpload = async () => {
  if (loading) return;

  if (selectedMedia.length === 0) {
    Alert.alert('Error', 'Debe seleccionar al menos una imagen o video.');
    return;
  }

  setLoading(true);
  let alreadySent = false; // ✅ Local y confiable

  try {
    const formData = new FormData();

    selectedMedia.forEach((media, index) => {
      formData.append('feed', {
        uri: media.uri,
        type: media.type,
        name: media.fileName || `media_${Date.now()}_${index}`,
      });
    });

    formData.append('description', caption);

    const response = await postHttpsStories('feed', formData, true);

    if (socket && !alreadySent) {
       console.log('🟢 Enviando newFeed (primer intento)');
      sendNewFeed({
        id: response.data.result.id,
        user: response.data.result.user,
        description: caption,
      });
      alreadySent = true;
    }

    Alert.alert('Éxito', 'Publicación subida correctamente.');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Event', params: { refresh: true } }],
    });

  } catch (error) {
    console.log('Error en primer intento:', error);

    if (error?.message?.includes('Network')) {
      console.log('Reintentando subida...');
      setTimeout(async () => {
        try {
          const retryFormData = new FormData();
          selectedMedia.forEach((media, index) => {
            retryFormData.append('feed', {
              uri: media.uri,
              type: media.type,
              name: media.fileName || `media_${Date.now()}_${index}`,
            });
          });
          retryFormData.append('description', caption);

          const retryResponse = await postHttpsStories('feed', retryFormData, true);

          if (socket && !alreadySent) {
             console.log('🟠 Enviando newFeed (segundo intento)');
            sendNewFeed({
              id: retryResponse.data.result.id,
              user: retryResponse.data.result.user,
              description: caption,
            });
            alreadySent = true;
          }

          Alert.alert('Éxito', 'Publicación subida en segundo intento.');

          navigation.reset({
            index: 0,
            routes: [{ name: 'Event', params: { refresh: true } }],
          });

        } catch (retryError) {
          console.error('Fallo en segundo intento:', retryError);
          Alert.alert('Error', 'No se pudo subir la publicación después de dos intentos.');
        } finally {
          setLoading(false);
        }
      }, 1000);
    } else {
      Alert.alert('Error', 'No se pudo subir la publicación.');
      setLoading(false);
    }
  }
};



  return (
    <Modal animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Publicación</Text>
        </View>

        <TouchableOpacity style={styles.galleryButton} onPress={openImagePicker}>
          <Ionicons name="images" size={20} color="#fff" />
          <Text style={styles.buttonText}>  Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.galleryButton, { backgroundColor: '#4caf50' }]}
          onPress={() => setCameraModalVisible(true)}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.buttonText}>  Cámara</Text>
        </TouchableOpacity>

        <FlatList
          data={selectedMedia}
          horizontal
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ marginTop: 16 }}
          renderItem={({ item, index }) => (
            <View>
              {item.type?.startsWith('video') ? (
                <View style={[styles.media, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="videocam" size={24} color="#fff" />
                </View>
              ) : (
                <Image source={{ uri: item.uri }} style={styles.media} />
              )}
              <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(index)}>
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />

        {selectedMedia.length > 0 && (
          <View style={styles.captionContainer}>
            <Text style={styles.label}>Descripción:</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe una descripción..."
              placeholderTextColor="white"
              value={caption}
              onChangeText={setCaption}
            />

            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text style={styles.buttonText}>  Subir</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={cameraModalVisible}
          animationType="slide"
          onRequestClose={() => setCameraModalVisible(false)}
        >
          <SafeAreaView style={styles.cameraModal}>
            <Text style={styles.label}>Captura de contenido</Text>

            <TouchableOpacity style={styles.cameraButton} onPress={openCameraForPhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.buttonText}>  Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton} onPress={openCameraForVideo}>
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.buttonText}>  Grabar video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: '#e53935' }]}
              onPress={() => setCameraModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.buttonText}>  Cerrar</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  galleryButton: {
    flexDirection: 'row',
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
    elevation: 3,
    alignItems: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    width: 100,
    height: 100,
    borderRadius: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  captionContainer: {
    padding: 16,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 16,
    color: 'white',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#8e44ad',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraModal: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    justifyContent: 'center',
  },
});

export default CreateEventV2;
