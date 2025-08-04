import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {postHttpsStories} from '../api/axios';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import Video from 'react-native-video';
import MediaPreviewModal from '../components/MediaPreviewModal';

const CreateEventV2 = () => {
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraPosition, setCameraPosition] = useState('back');
  const devices = useCameraDevices();
  const availableDevices = Array.isArray(devices) ? devices : [];
  const device = availableDevices.find(d => d.position === cameraPosition);
  const [mediaUri, setMediaUri] = useState(null); // Puede ser foto o video
  const [mediaType, setMediaType] = useState(null); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [zoom, setZoom] = useState(0);
  const startYRef = useRef(null);
  const startZoomRef = useRef(0);
  const [permissionStatus, setPermissionStatus] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const wemgoLogo = require('../assets/icons/logo.png');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const currentStatus = Camera.getCameraPermissionStatus();
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
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const openImagePicker = () => {
    const options = {mediaType: 'mixed', selectionLimit: 10};
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Selección cancelada');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo acceder a la galería.');
      } else {
        setSelectedMedia(prev => [...prev, ...(response.assets || [])]);
      }
    });
  };

  const openCameraForPhoto = async () => {
    if (cameraRef.current == null) return;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });
      setSelectedMedia(prev => [
        ...prev,
        {
          uri: `file://${photo.path}`,
          type: 'image/jpeg',
          fileName: `photo_${Date.now()}.jpg`,
        },
      ]);
    } catch (error) {
      console.log('❌ Error al tomar la foto:', error);
    }
  };

  const openCameraForVideo = async () => {
    if (cameraRef.current == null) return;
    try {
      setIsRecording(true);
      await cameraRef.current.startRecording({
        flash: 'off',
        audio: true,
        onRecordingFinished: video => {
          setSelectedMedia(prev => [
            ...prev,
            {
              uri: `file://${video.path}`,
              type: 'video/mp4',
              fileName: `video_${Date.now()}.mp4`,
            },
          ]);
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
       
      console.log('❌ Error al grabar video:', error);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: evt => {
      if (!isRecording) return;
      startYRef.current = evt.nativeEvent.pageY;
      startZoomRef.current = zoom;
    },
    onPanResponderMove: evt => {
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
      console.log('❌ Error al detener grabación:', error);
    }
  };

  const handleUpload = async () => {
    if (loading || selectedMedia.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      selectedMedia.forEach((media, index) => {
        formData.append('feed', {
          uri: media.uri,
          type: media.type,
          name: media.fileName || `media_${index}`,
        });
      });
      formData.append('description', caption);

      await postHttpsStories('feed', formData, true);

      // 🔁 Reset y cerrar modal
      setSelectedMedia([]);
      setCaption('');
      setShowPreviewModal(false);
      setShowSuccess(true); // Mostrar animación de éxito

     
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('Profile', { shouldRefresh: true });
      }, 1000);
    } catch (err) {
      Alert.alert('Error', 'No se pudo subir la publicación');
    } finally {
      setLoading(false);
    }
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
      <View style={{flex: 1, backgroundColor: '#000'}}>
        {/* Botón X para repetir */}
        <View
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 30,
            right: 20,
            zIndex: 10,
          }}>
          <Text
            onPress={() => {
              setMediaUri(null);
              setMediaType(null);
            }}
            style={{
              color: '#fff',
              fontSize: 32,
              fontWeight: 'bold',
              padding: 8,
            }}>
            ✕
          </Text>
        </View>
        {/* Media preview */}
        {mediaType === 'photo' ? (
          <Image
            source={{uri: mediaUri}}
            style={{width: '100%', height: '100%', resizeMode: 'contain'}}
          />
        ) : (
          <Video
            source={{uri: mediaUri}}
            style={{width: '100%', height: '100%'}}
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
        <View
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
          }}>
          <TouchableOpacity onPress={handleUpload} disabled={loading}>
            <Image
              source={wemgoLogo}
              style={{
                width: 70,
                height: 70,
                resizeMode: 'contain',
                borderRadius: 40,
              }}
            />
            {loading && (
              <ActivityIndicator color="#fff" style={{position: 'absolute'}} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
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

      {selectedMedia.length > 0 && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 120,
            alignSelf: 'center',
            backgroundColor: '#6200ee',
            padding: 10,
            borderRadius: 20,
          }}
          onPress={() => setShowPreviewModal(true)}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Previsualizar</Text>
        </TouchableOpacity>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={openImagePicker} style={styles.iconButton}>
          <Ionicons name="images" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Botón de captura con PanResponder para zoom y grabación */}
    <TouchableOpacity
  style={[styles.captureButton, isRecording ? { borderColor: '#e74c3c' } : {}]}
  onPress={openCameraForPhoto}
  onLongPress={openCameraForVideo}
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
        isUploading={loading}
      />

      {showSuccess && (
        <View style={styles.successModal}>
          <Text style={styles.successText}>✅ ¡Publicación subida!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text: { color: '#fff', fontSize: 16 },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  successModal: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 20,
    borderRadius: 12,
    zIndex: 999,
  },
  successText: {
    color: '#0f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
export default CreateEventV2;
