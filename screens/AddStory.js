import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { showEditor } from 'react-native-video-trim';
import { postHttpsStories } from '../api/axios';


const AddStory = ({ isVisible, navigation }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [trimmedVideo, setTrimmedVideo] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  const requestPermission = async (type) => {
    let permission;
    if (type === 'camera') {
      permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });
    } else {
      permission = Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android:
          Platform.Version >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      });
    }
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  };

  const trimVideoWithEditor = async (videoUri) => {
    try {
      showEditor(
        videoUri,
        {
          maxDuration: 30,
          saveToPhoto: false,
          openShareSheetOnFinish: false,
          openDocumentsOnFinish: false,
          closeWhenFinish: true,
        },
        (eventName, payload) => {
          if (eventName === 'onFinishTrimming' && payload?.output) {
            console.log('🎞️ Video recortado:', payload.output);
            setTrimmedVideo({ uri: payload.output, type: 'video/mp4' });
          }
          if (eventName === 'onCancelTrimming') {
            console.log('⛔ Recorte cancelado');
          }
          if (eventName === 'onError') {
            console.log('❌ Error al recortar:', payload);
            Alert.alert('Error', 'No se pudo recortar el video.');
          }
        }
      );
    } catch (error) {
      console.error('❌ Error al abrir el editor:', error);
      Alert.alert('Error', 'No se pudo abrir el editor de video.');
    }
  };

  const handleMediaSelection = async (fromCamera = false) => {
    const hasPermission = await requestPermission(fromCamera ? 'camera' : 'gallery');
    if (!hasPermission) {
      Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara o galería.');
      return;
    }

    const options = {
      mediaType: 'video',
      selectionLimit: 1,
      saveToPhotos: true,
    };

    const callback = async (response) => {
      if (response.didCancel || response.errorCode) return;
      const selected = response.assets[0];
      setSelectedMedia(selected);
      setTrimmedVideo(null);

      if (selected?.uri) {
        await trimVideoWithEditor(selected.uri);
      }
    };

    fromCamera ? launchCamera(options, callback) : launchImageLibrary(options, callback);
  };

  const handleUploadStory = async () => {
    const media = trimmedVideo || selectedMedia;
    if (!media && !audioUri) {
      Alert.alert('Error', 'Debe grabar o seleccionar un archivo.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    if (media) {
      formData.append('story', {
        uri: media.uri,
        type: media.type || 'video/mp4',
        name: 'story.mp4',
      });
    } else if (audioUri) {
      formData.append('story', {
        uri: audioUri,
        type: 'audio/mp4',
        name: 'story.m4a',
      });
    }

    console.log( audioUri)
    formData.append('caption', caption);

    try {
      await postHttpsStories('stories', formData);
      Alert.alert('Éxito', 'Historia subida correctamente.');
      setSelectedMedia(null);
      setTrimmedVideo(null);
      setAudioUri(null);
      setCaption('');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error subiendo historia:', error);
      Alert.alert('Error', 'No se pudo subir la historia.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Agregar Historia</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✖</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mediaButtonsRow}>
            <TouchableOpacity style={styles.mediaButton} onPress={() => handleMediaSelection(false)}>
              <Icon name="images-outline" size={20} color="white" />
              <Text style={styles.mediaButtonText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={() => handleMediaSelection(true)}>
              <Icon name="camera-outline" size={20} color="white" />
              <Text style={styles.mediaButtonText}>Cámara</Text>
            </TouchableOpacity>
          </View>



          {(selectedMedia || trimmedVideo || audioUri) && (
            <View style={styles.previewContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escribe un texto..."
                placeholderTextColor="#aaa"
                onChangeText={setCaption}
                value={caption}
              />
              <TouchableOpacity
                style={[styles.uploadButton, isUploading && { opacity: 0.6 }]}
                onPress={handleUploadStory}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Subir Historia</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#ff4d4d',
    fontSize: 20,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  mediaButtonText: {
    color: 'white',
    marginLeft: 6,
  },
  previewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    backgroundColor: '#333',
    color: 'white',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 150,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AddStory;
