import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

const {width, height} = Dimensions.get('window');

const StoryItem = ({
  item,
  index,
  scrollX,
  isVideo,
  currentIndex,
  isPaused,
  isAnimationPaused,
  progress,
  goToNextStory,
  navigation,
  setIsCurrentVideo,
  videoRef,
  onVideoLoad,
}) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const [DataUser, setDataUser] = useState({});
  const animationRef = useRef(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  const rotateY = scrollX.interpolate({
    inputRange,
    outputRange: ['50deg', '0deg', '-50deg'],
    extrapolate: 'clamp',
  });

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  // Detener la barra de progreso cuando se pausa
  useEffect(() => {
    if (isPaused && animationRef.current) {
      animationRef.current.stop();
    }
  }, [isPaused]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setDataUser(parsedData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    loadUserData();
  }, []);

  const navigateToProfile = userId => {
    if (DataUser?.id === userId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('FriendTimeline', {id: userId});
    }
  };

  return (
    <Animated.View
      style={[styles.storyContainer, {transform: [{rotateY}, {scale}]}]}>
      {!mediaLoaded && (
        <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
      )}
      {isVideo(item.storyUrl) && currentIndex === index ? (
        <Video
          ref={videoRef}
          source={{uri: item.storyUrl}}
          style={styles.storyImage}
          resizeMode="cover"
          repeat={false}
          paused={isPaused}
          muted={false}
          onLoad={meta => {
            setMediaLoaded(true);
            const durationMs = (meta.duration || 0) * 1000;
            if (onVideoLoad) {
              onVideoLoad(durationMs);
            }
          }}
          onEnd={() => {
            progress.setValue(1);
            goToNextStory();
          }}
          onError={error => {
            console.log('Error al reproducir el video:', error);
          }}
        />
      ) : (
        <FastImage
          source={{uri: item.storyUrl}}
          style={styles.storyImage}
          onLoadEnd={() => {
            setMediaLoaded(true);
          }}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateToProfile(item.user.id)}>
          <View style={styles.userInfo}>
            <FastImage
              source={{uri: item.user.img}}
              style={styles.profileImage}
            />
            <View style={styles.usernameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.username}>
                  {item.user.first_name.toLowerCase()}
                  {item.user.last_name.toLowerCase()}
                </Text>

                {item.user.checked === '1' && (
                  <MaterialIcons
                    name="verified"
                    size={14}
                    color="#fff"
                    style={styles.verifiedIcon}
                  />
                )}

                <Text style={styles.timeTextInline}>{item.time_label}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {item.caption ? (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    perspective: 1500,
  },
  spinner: {
    position: 'absolute',
    top: height / 2 - 20,
    left: width / 2 - 20,
    zIndex: 100,
  },
  storyImage: {
    width,
    height: height - 30,
    resizeMode: 'cover',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameContainer: {
    flexDirection: 'column',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  timeText: {
    color: '#ccc',
    fontSize: 11,
  },
  closeButton: {
    fontSize: 18,
    color: '#fff',
    padding: 6,
  },

  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },

  closeButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeTextInline: {
    color: 'white',
    fontSize: 15,
    marginLeft: 6,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF80',
  },
  captionText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'Poppins-Light',
  },
});

export default StoryItem;
