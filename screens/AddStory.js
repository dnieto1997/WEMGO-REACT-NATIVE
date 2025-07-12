import React, { useEffect, useRef, useState, useRef as useReactRef } from 'react';
import { PanResponder, TouchableOpacity } from 'react-native';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator, Platform, Image, Dimensions
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
const wemgoLogo = require('../assets/icons/logo.png'); // Ajusta la ruta si es necesario
import { useNavigation } from '@react-navigation/native';

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

  const [permissionStatus, setPermissionStatus] = useState('');
  useEffect(() => {
    (async () => {
      const currentStatus = await Camera.getCameraPermissionStatus();
      setPermissionStatus(currentStatus);
      console.log('Camera permission before request:', currentStatus);
      if (currentStatus !== 'authorized' && currentStatus !== 'granted') {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'authorized' || status === 'granted');
        setPermissionStatus(status);
        console.log('Camera permission after request:', status);
      } else {
        setHasPermission(true);
      }
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
      setMediaUri(`file://${photo.path}`);
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
          setMediaUri(`file://${video.path}`);
          setMediaType('video');
          setIsRecording(false);
          setZoom(0);
        },
        onRecordingError: (error) => {
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
    if (!mediaUri) return;
    try {
      setIsUploading(true);
      const authToken = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('story', {
        uri: mediaUri,
        type: mediaType === 'photo' ? 'image/jpeg' : 'video/mp4',
        name: mediaType === 'photo' ? 'image.jpg' : 'video.mp4',
      });
      const response = await fetch('https://wemgo.online/wemgo/stories', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const data = await response.json();
      console.log('✅ Subido:', data);
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
        setMediaUri(response.assets[0].uri);
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

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Solicitando permiso de cámara...</Text>
        <Text style={styles.text}>Estado: {permissionStatus}</Text>
      </View>
    );
  }

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

  // Preview de foto o video pantalla completa
  if (mediaUri) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Botón X para repetir */}
        <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 30, right: 20, zIndex: 10 }}>
          <Text
            onPress={() => { setMediaUri(null); setMediaType(null); }}
            style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', padding: 8 }}
          >✕</Text>
        </View>
        {/* Media preview */}
        {mediaType === 'photo' ? (
          <Image source={{ uri: mediaUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
        ) : (
          <Video
            source={{ uri: mediaUri }}
            style={{ width: '100%', height: '100%' }}
            controls
            resizeMode="contain"
            muted={false}
            volume={1}
            ignoreSilentSwitch="ignore"
            paused={false}
            playInBackground={false}
            playWhenInactive={false}
          />
        )}
        {/* Botón Wemgo para subir (morado, logo, central) */}
        <View style={{ position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
          <TouchableOpacity
            onPress={handleUpload}
            disabled={isUploading}

          >
            <Image source={wemgoLogo} style={{ width: 70, height: 70, resizeMode: 'contain', borderRadius: 40, }} />
            {isUploading && <ActivityIndicator color="#fff" style={{ position: 'absolute' }} />}
          </TouchableOpacity>
        </View>
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
  <View style={[styles.innerCircle, isRecording ? { backgroundColor: '#e74c3c' } : {}]} />
</TouchableOpacity>

        <TouchableOpacity onPress={toggleCamera} style={styles.iconButton}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
