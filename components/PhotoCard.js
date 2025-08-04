import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';

const isVideo = url => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
  return videoExtensions.some(ext => url?.toLowerCase().endsWith(ext));
};

const PhotoCard = ({image, id, idUser, views, video, isReel}) => {
  const navigation = useNavigation();

  const uri = image?.uri || image;
  const isMediaVideo = isVideo(uri);
  let thumbnailUri = null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const dynamicSize =
    Dimensions.get('window').width /
      (Dimensions.get('window').width >= 768 ? 4 : 3) -
    12;

  const showPlaceholder = !image || error || (isMediaVideo && !thumbnailUri);

  console.log(showPlaceholder)

return (
  <TouchableOpacity
    onPress={() =>
      navigation.navigate(isReel ? 'Reels' : 'Post', isReel ? { id } : { id, idUser })
    }>
    <View style={{ ...styles.container, width: dynamicSize, height: dynamicSize }}>
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
                  ? { uri: thumbnailUri || uri }
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
            {video && (
              <View style={styles.playIcon}>
                <AntDesign name="playcircleo" size={30} color="#fff" />
              </View>
            )}
            {views != null && (
              <View style={styles.viewsContainer}>
                <AntDesign
                  name="eye"
                  size={14}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.viewsText}>
                  {typeof views === 'string' || typeof views === 'number'
                    ? views
                    : '0'}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 1,
    backgroundColor: 'transparent',
    borderRadius: 6,
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  viewsContainer: {
    position: 'absolute',
    bottom: 4,
    right: 6,
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

export default PhotoCard;
