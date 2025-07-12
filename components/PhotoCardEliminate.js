import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { deleteHttps } from '../api/axios';



const PhotoCardEliminate = ({ image, id, idUser, reloadFeeds }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mediaUri = image?.uri || image;
  const thumbUri = image?.thumbnail || null;
  const videoPost = thumbUri !== null;
  const displayUri = videoPost ? thumbUri : mediaUri;

  const showPlaceholder = !displayUri || error;

  const handleDelete = async () => {
    try {
     response=  await deleteHttps(`feed/${id}`);

      reloadFeeds?.();
    } catch (err) {
      console.error('Error deleting feed:', err);
    } finally {
      setShowConfirm(false);
      setShowOptions(false);
    }
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Post', { id, idUser })}>
      <View style={styles.container}>
        {/* Botón de opciones */}
        <TouchableOpacity
          onPress={() => setShowOptions(prev => !prev)}
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
              <FastImage
                source={{ uri: displayUri }}
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
              {videoPost && !loading && !error && (
                <View style={styles.playIcon}>
                  <AntDesign name="playcircleo" size={30} color="#fff" />
                </View>
              )}
            </>
          )}
        </View>

        {/* Menú de eliminación */}
        {showOptions && (
          <View style={styles.optionsMenuIcons}>
            <TouchableOpacity
              onPress={() => setShowConfirm(true)}
              style={styles.iconButton}
            >
              <AntDesign name="delete" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}

        {/* Confirmación */}
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
    top: 13,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 12,
  },
  optionsMenuIcons: {
    position: 'absolute',
    top: 30,
    right: 6,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 6,
    padding: 6,
    zIndex: 20,
  },
  iconButton: {
    marginHorizontal: 6,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
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
