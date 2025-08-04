import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import {deleteHttps} from '../api/axios';

const PhotoCardEliminate = ({
  image,
  id,
  idUser,
  reloadFeeds,
  views,
  size,
  isReel,
}) => {
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
      const endpoint = isReel ? `reel/${id}` : `feed/${id}`;
      response = await deleteHttps(endpoint);

      reloadFeeds?.();
    } catch (err) {
      console.error('Error deleting feed:', err);
    } finally {
      setShowConfirm(false);
      setShowOptions(false);
    }
  };

  return (
    <TouchableOpacity
  onPress={() =>
    navigation.navigate(isReel ? 'Reels' : 'Post', isReel ? { id } : { id, idUser })
  }
>
      <View style={[styles.container, {width: size, height: size}]}>
        {/* Botón de opciones */}
        <TouchableOpacity
          onPress={() => setShowOptions(prev => !prev)}
          style={styles.optionsButton}>
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
                source={{uri: displayUri}}
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
              style={styles.iconButton}>
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
      {videoPost && views !== undefined && (
        <View style={styles.viewsContainer}>
          <AntDesign
            name="eye"
            size={14}
            color="#fff"
            style={{marginRight: 4}}
          />
          <Text style={styles.viewsText}>{views}</Text>
        </View>
      )}

      {isReel && views !== undefined && (
        <View style={styles.viewsContainer}>
          <AntDesign
            name="eye"
            size={14}
            color="#fff"
            style={{marginRight: 4}}
          />
          <Text style={styles.viewsText}>{views}</Text>
        </View>
      )}
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
    top: '50%',
    left: '50%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{translateX: -15}, {translateY: -15}],
    borderRadius: 20,
    padding: 4,
    zIndex: 3,
  },
  optionsButton: {
    position: 'absolute',
    top: 10,
    right: 8,
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
  viewsContainer: {
    position: 'absolute',
    bottom: 4,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 5,
  },
  viewsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PhotoCardEliminate;
