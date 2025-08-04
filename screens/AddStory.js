import React, { useEffect, useRef, useState, useRef as useReactRef } from 'react';
import { PanResponder, TouchableOpacity } from 'react-native';
import {
  View, Text, StyleSheet, Alert, Platform, Image
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import { postHttpsStories } from '../api/axios';
import MediaPreviewModal from '../components/MediaPreviewModal';

const AddStory = () => {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraPosition, setCameraPosition] = useState('back');
  const devices = useCameraDevices();
  const availableDevices = Array.isArray(devices) ? devices : [];
  const device = availableDevices.find(d => d.position === cameraPosition);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUri, setMediaUri] = useState(null); // Puede ser foto o video
  const [mediaType, setMediaType] = useState(null); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [zoom, setZoom] = useState(0);
  const startYRef = useReactRef(null);
  const startZoomRef = useRef(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
const [selectedMedia, setSelectedMedia] = useState([]); // Aunque sea uno, usaremos un array
const [caption, setCaption] = useState('');
const wemgoLogo = require('../assets/icons/logo.png'); 

  const [permissionStatus, setPermissionStatus] = useState('');
useEffect(() => {
  (async () => {
    const cameraStatus = await Camera.getCameraPermissionStatus();
    const micStatus = await Camera.getMicrophonePermissionStatus();

    if (cameraStatus !== 'authorized') {
      const newCameraStatus = await Camera.requestCameraPermission();
      console.log('📷 Permiso cámara:', newCameraStatus);
    }

    if (micStatus !== 'authorized') {
      const newMicStatus = await Camera.requestMicrophonePermission();
      console.log('🎙️ Permiso micrófono:', newMicStatus);
    }

    const finalCamera = await Camera.getCameraPermissionStatus();
    const finalMic = await Camera.getMicrophonePermissionStatus();
    const granted = finalCamera === 'authorized' && finalMic === 'authorized';

    setHasPermission(granted);
    setPermissionStatus(granted ? 'authorized' : 'denied');
  })();
}, []);


  const toggleCamera = () => {
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (cameraRef.current == null) return;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });
      setSelectedMedia([
  {
    uri: `file://${photo.path}`,
    type: 'image/jpeg',
    fileName: `photo_${Date.now()}.jpg`,
  },
]);
setShowPreviewModal(true);
      setMediaType('photo');
    } catch (error) {
      console.error('❌ Error al tomar la foto:', error);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current == null) return;
    try {
      setIsRecording(true);
      await cameraRef.current.startRecording({
        flash: 'off',
        audio: true,
        onRecordingFinished: (video) => {
          setSelectedMedia([
  {
    uri: `file://${video.path}`,
    type: 'video/mp4',
    fileName: `video_${Date.now()}.mp4`,
  },
]);
setShowPreviewModal(true);
          setMediaType('video');
          setIsRecording(false);
          setZoom(0);
        },
        onRecordingError: (error) => {
          console.log(error)
          setIsRecording(false);
          setZoom(0);
          Alert.alert('Error', 'No se pudo grabar el video');
        },
      });
    } catch (error) {
      setIsRecording(false);
      setZoom(0);
      console.error('❌ Error al grabar video:', error);
    }
  };
  // PanResponder para zoom durante grabación
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (!isRecording) return;
      startYRef.current = evt.nativeEvent.pageY;
      startZoomRef.current = zoom;
    },
    onPanResponderMove: (evt) => {
      if (!isRecording) return;
      const currentY = evt.nativeEvent.pageY;
      const deltaY = startYRef.current - currentY;
      let newZoom = startZoomRef.current + deltaY / 400;
      newZoom = Math.max(0, Math.min(1, newZoom));
      setZoom(newZoom);
    },
    onPanResponderRelease: () => {
      startYRef.current = null;
      startZoomRef.current = 0;
    },
    onPanResponderTerminate: () => {
      startYRef.current = null;
      startZoomRef.current = 0;
    },
  });

  const stopRecording = async () => {
    if (cameraRef.current == null) return;
    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      setIsRecording(false);
      console.error('❌ Error al detener grabación:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedMedia || selectedMedia.length === 0) return;
    try {
      setIsUploading(true);
       const media = selectedMedia[0];
      const formData = new FormData();
     formData.append('story', {
      uri: media.uri,
      type: media.type,
      name: media.fileName || (media.type?.startsWith('image') ? 'image.jpg' : 'video.mp4'),
    });
    formData.append('caption', caption);
      await postHttpsStories('stories', formData, true); 
      
    
      Alert.alert('Listo', 'Historia subida correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error al subir:', error);
      Alert.alert('Error', 'No se pudo subir la historia');
    } finally {
      setIsUploading(false);
    }
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'mixed' }, (response) => {
      if (response.assets?.[0]) {
        setSelectedMedia([response.assets[0]]);
       setShowPreviewModal(true);
        const type = response.assets[0].type;
        if (type && type.startsWith('video')) {
          setMediaType('video');
        } else if (type && type.startsWith('image')) {
          setMediaType('photo');
        } else {
          setMediaType(response.assets[0].fileName?.endsWith('.mp4') ? 'video' : 'photo');
        }
      }
    });
  };



  if (!Array.isArray(devices) || devices.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando dispositivos de cámara...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No se encontró la cámara seleccionada.</Text>
      </View>
    );
  }

 

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
    
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        ref={cameraRef}
        photo={true}
        video={true}
        audio={true}
        zoom={zoom}
      />

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={openGallery} style={styles.iconButton}>
          <Ionicons name="images" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Botón de captura con PanResponder para zoom y grabación */}
  <TouchableOpacity
  style={[styles.captureButton, isRecording ? { borderColor: '#e74c3c' } : {}]}
  onPress={takePhoto}
  onLongPress={startRecording}
  onPressOut={isRecording ? stopRecording : undefined}
  delayLongPress={300}
  activeOpacity={0.8}
  {...panResponder.panHandlers}
>
 <Image
     source={wemgoLogo}
     style={{
       width: 50,
       height: 50,
       borderRadius: 25,
       resizeMode: 'contain',
       tintColor: isRecording ? '#e74c3c' : undefined,
     }}
   />
</TouchableOpacity>

        <TouchableOpacity onPress={toggleCamera} style={styles.iconButton}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <MediaPreviewModal
  visible={showPreviewModal}
  onClose={() => setShowPreviewModal(false)}
  selectedMedia={selectedMedia}
  setSelectedMedia={setSelectedMedia}
  caption={caption}
  setCaption={setCaption}
  onUpload={handleUpload}
  isUploading={isUploading}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000',
  },
  text: {
    color: '#fff', fontSize: 16, textAlign: 'center',
  },
  controls: {
    position: 'absolute', bottom: 40, width: '100%',
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#333', padding: 14, borderRadius: 50,
  },
  captureButton: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  innerCircle: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff',
  },
  uploadButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    backgroundColor: '#8e44ad',
    padding: 10,
    borderRadius: 10,
  },
});

export default AddStory;
