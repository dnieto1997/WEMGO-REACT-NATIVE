import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import {createThumbnail} from 'react-native-create-thumbnail';

const VideoPost = ({videoUrl, isVisible, style, shouldPause}) => {
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbLoading, setThumbLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (isVisible && !videoError) {
      setHasStartedPlaying(false);
      setIsReadyToPlay(false);
      fadeAnim.setValue(0);
    }
  }, [shouldPause, isVisible, videoError]);

  useEffect(() => {
    let isMounted = true;
    setThumbnail(null);
    setThumbLoading(true);
    if (videoUrl) {
      createThumbnail({url: videoUrl})
        .then(res => {
          if (isMounted) setThumbnail(res.path);
        })
        .catch(() => {
          if (isMounted) setThumbnail(null);
        })
        .finally(() => {
          if (isMounted) setThumbLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  const handleVideoLoad = data => {
    setDuration(data.duration);
  };

  const handleProgress = ({currentTime}) => {
    setCurrentTime(currentTime);
    if (currentTime >= 0.2 && !hasStartedPlaying) {
      setHasStartedPlaying(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleVideoError = err => {
    console.log('❌ Error al cargar el video:', err);
    setVideoError(true);
  };

  const handleRetry = () => {
    setVideoError(false);
    setRetry(r => r + 1);
  };

  if (!isVisible) {
    return (
      <View style={[styles.container, style, styles.centered]}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      {videoError ? (
        <View style={[styles.container, style, styles.centered]}>
          <Icon name="alert-circle" size={40} color="red" />
          <Text style={styles.errorText}>No se pudo cargar el video</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={{color: '#fff'}}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {!hasStartedPlaying &&
            (thumbnail ? (
              <Image
                source={{uri: thumbnail}}
                style={[style, styles.absolute]}
                resizeMode="cover"
              />
            ) : (
              <View style={[style, styles.absoluteCenter]}>
                <ActivityIndicator size="large" color="#888" />
              </View>
            ))}

          <Animated.View style={[style, {opacity: fadeAnim}]}>
            <Video
              key={videoUrl + retry}
              source={{
                uri: videoUrl,
                bufferConfig: {
                  minBufferMs: 500,
                  maxBufferMs: 3000,
                  bufferForPlaybackMs: 300,
                  bufferForPlaybackAfterRebufferMs: 300,
                },
              }}
              maxBitRate={500000}
              style={style}
              resizeMode="cover"
              repeat
              muted={muted}
              paused={paused}
              useNativeControls={false}
              onLoad={handleVideoLoad}
              onProgress={handleProgress}
              onError={handleVideoError}
              onReadyForDisplay={() => setIsReadyToPlay(true)}
            />
          </Animated.View>

          {!isReadyToPlay && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          <View style={styles.progressBar}>
            <View
              style={{
                height: 2,
                backgroundColor: '#fff',
                width: `${progressPercent}%`,
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.muteButton}
            onPress={() => setMuted(m => !m)}>
            <Icon
              name={muted ? 'volume-mute' : 'volume-high'}
              size={16}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  muteButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 10,
    zIndex: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: '100%',
    backgroundColor: '#444',
    zIndex: 5,
  },
  absoluteCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
    width: '100%',
    height: '100%',
  },
  absolute: {
    position: 'absolute',
    zIndex: 2,
    width: '100%',
    height: '100%',
  },
});

export default React.memo(VideoPost);
