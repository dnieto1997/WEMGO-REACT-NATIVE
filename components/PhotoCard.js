import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation } from '@react-navigation/native';
import { createThumbnail } from 'react-native-create-thumbnail';

const isVideo = (url) => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
  return videoExtensions.some(ext => url?.toLowerCase().endsWith(ext));
};

const PhotoCard = ({ image, id, idUser }) => {
  const navigation = useNavigation();
  const isMediaVideo = isVideo(image?.uri || image);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState(null);

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
          console.error("Error creando thumbnail:", err);
          setError(true);
          setLoading(false);
        }
      } else {
        setLoading(false); // Para imágenes normales
      }
    };

    generateThumbnail();
  }, [image]);

  const showPlaceholder = !image || error;

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Post", { id, idUser })}>
      <View style={styles.container}>
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
                    : (typeof image === 'string' ? { uri: image } : image)
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
    backgroundColor: '#f0f0f0',
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
    top: '40%',
    left: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 4,
    zIndex: 3,
  },
});

export default PhotoCard;
