// AddStory.js
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
  Image,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { showEditor } from 'react-native-video-trim';
import { postHttpsStories } from '../api/axios';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';

const AddStory = ({ isVisible}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [trimmedVideo, setTrimmedVideo] = useState(null);

  const navigation=useNavigation()

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
            ? [
                PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
              ]
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      });
    }

    if (Array.isArray(permission)) {
      const results = await Promise.all(permission.map(p => request(p)));
      return results.every(r => r === RESULTS.GRANTED);
    } else {
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    }
  };

  const trimVideoWithEditor = async (videoUri) => {
    try {
      showEditor(
        videoUri,
        {
          maxDuration: 30,
          saveToPhoto: false,
          openShareSheetOnFinish: false,
          closeWhenFinish: true,
        },
        (eventName, payload) => {
          if (eventName === 'onFinishTrimming' && payload?.output) {
            setTrimmedVideo({ uri: payload.output, type: 'video/mp4' });
          }
          if (eventName === 'onCancelTrimming') {
            setSelectedMedia(null);
          }
          if (eventName === 'onError') {
            Alert.alert('Error', 'No se pudo recortar el video.');
          }
        },
      );
    } catch (error) {
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
      mediaType: 'mixed',
      selectionLimit: 1,
      saveToPhotos: true,
    };

    const callback = async (response) => {
      if (response.didCancel || response.errorCode) return;
      const selected = response.assets[0];
      setSelectedMedia(selected);
      setTrimmedVideo(null);

      if (selected?.type?.startsWith('video')) {
        await trimVideoWithEditor(selected.uri);
      }
    };

    fromCamera ? launchCamera(options, callback) : launchImageLibrary(options, callback);
  };

  const handleUploadStory = async () => {
    const media = trimmedVideo || selectedMedia;
    if (!media) {
      Alert.alert('Error', 'Debe seleccionar un archivo.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    if (media?.type?.startsWith('image')) {
      formData.append('story', {
        uri: media.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
    } else {
      formData.append('story', {
        uri: media.uri,
        type: 'video/mp4',
        name: 'story.mp4',
      });
    }

    formData.append('caption', caption);

    try {
      await postHttpsStories('stories', formData);
      Alert.alert('Éxito', 'Historia subida correctamente.');
      setSelectedMedia(null);
      setTrimmedVideo(null);
      setCaption('');
      navigation.goBack()
    } catch (error) {
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

          {(selectedMedia || trimmedVideo) && (
            <View style={styles.previewContainer}>
              {selectedMedia?.type?.startsWith('image') && (
                <Image source={{ uri: selectedMedia.uri }} style={{ width: 200, height: 300, marginBottom: 10 }} />
              )}
              {selectedMedia?.type?.startsWith('video') && !trimmedVideo && (
                <Video source={{ uri: selectedMedia.uri }} style={{ width: 200, height: 300 }} resizeMode="cover" />
              )}
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
                disabled={isUploading}>
                {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Subir Historia</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', backgroundColor: '#222', borderRadius: 20, padding: 20, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { color: '#ff4d4d', fontSize: 20 },
  mediaButtonsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  mediaButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#444', padding: 10, borderRadius: 10 },
  mediaButtonText: { color: 'white', marginLeft: 6 },
  previewContainer: { alignItems: 'center', width: '100%' },
  input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#555', borderRadius: 10, backgroundColor: '#333', color: 'white', marginBottom: 10 },
  uploadButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 10, alignItems: 'center', minWidth: 150 },
  buttonText: { color: 'white', fontSize: 16, textAlign: 'center' },
});

export default AddStory;
