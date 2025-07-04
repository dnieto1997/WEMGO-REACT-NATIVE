import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { createThumbnail } from 'react-native-create-thumbnail';
import { deleteHttps } from '../api/axios';

const isVideo = (url) => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
  return videoExtensions.some((ext) => url?.toLowerCase().endsWith(ext));
};

const PhotoCardEliminate = ({ image, id, idUser,reloadFeeds   }) => {
  const navigation = useNavigation();
  const isMediaVideo = isVideo(image?.uri || image);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (isMediaVideo) {
        try {
          setLoading(true);
          const result = await createThumbnail({
            url: image?.uri || image,
          });
          setThumbnailUri(result.path);
          setLoading(false);
        } catch (err) {
          console.error('Error creando thumbnail:', err);
          setError(true);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [image]);

  const showPlaceholder = !image || error;

const handleDelete = async () => {
  try {
    await deleteHttps(`feed/${id}`);
    setShowConfirm(false);
    setShowOptions(false);
    if (reloadFeeds) reloadFeeds(); // 🔁 Ejecuta la recarga desde Profile
  } catch (err) {
    console.error('Error deleting feed:', err);
  }
};

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Post', { id, idUser })}>
      <View style={styles.container}>
        {/* Botón de tres puntos */}
        <TouchableOpacity
          onPress={() => setShowOptions(!showOptions)}
          style={styles.optionsButton}
        >
          <AntDesign name="ellipsis1" size={16} color="#333" />
        </TouchableOpacity>

        {/* Imagen o video */}
        <View style={styles.imageWrapper}>
          {showPlaceholder ? (
            <View style={[styles.image, styles.placeholder]}>
              <AntDesign name="picture" size={32} color="#888" />
            </View>
          ) : (
            <>
              <Image
                source={
                  isMediaVideo
                    ? { uri: thumbnailUri }
                    : typeof image === 'string'
                    ? { uri: image }
                    : image
                }
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setError(true);
                  setLoading(false);
                }}
              />
              {loading && (
                <View style={styles.loader}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              {isMediaVideo && !loading && !error && (
                <View style={styles.playIcon}>
                  <AntDesign name="playcircleo" size={30} color="#fff" />
                </View>
              )}
            </>
          )}
        </View>

        {/* Menú de opciones */}
        {showOptions && (
          <View style={styles.optionsMenu}>
            <TouchableOpacity
              onPress={() => {
                setShowOptions(false);
                setShowConfirm(true);
              }}
            >
              <Text style={{ color: 'red', fontSize: 14 }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Confirmación de eliminación */}
        {showConfirm && (
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmBox}>
              <TouchableOpacity onPress={handleDelete}>
                <AntDesign name="checkcircleo" size={22} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <AntDesign name="closecircleo" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    padding: 1,
    margin: 1,
    
    borderRadius: 6,
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  playIcon: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 4,
    zIndex: 3,
  },
  optionsButton: {
    position: 'absolute',
    top: 5,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 12,
  },
  optionsMenu: {
    position: 'absolute',
    top: 26,
    right: 6,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 4,
    zIndex: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  confirmBox: {
    flexDirection: 'row',
    gap: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default PhotoCardEliminate;
