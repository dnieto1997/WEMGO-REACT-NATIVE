import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const MIN_HEIGHT = 250;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6; // ✅ altura máxima del video para que no se salga de la pantalla

const VideoPost = ({videoUrl, thumbnails, isVisible, style, shouldPause}) => {

  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(shouldPause);
  const [videoError, setVideoError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [videoSize, setVideoSize] = useState({width: 9, height: 16});
  const [showPauseIcon, setShowPauseIcon] = useState(false);

  useEffect(() => {
    setPaused(!isVisible || shouldPause);
  }, [isVisible, shouldPause]);

  useEffect(() => {
    setPaused(shouldPause);
  }, [shouldPause]);

  const handleVideoLoad = data => {
    setDuration(data.duration);
    const {width, height} = data.naturalSize || {};
    if (width && height) {
      setVideoSize({width, height});
    }
  };

  const handleProgress = ({currentTime}) => {
    setCurrentTime(currentTime);
  };

  const handleVideoError = err => {
    console.log('❌ Error al cargar el video:', err);
    setVideoError(true);
  };

  const handleRetry = () => {
    setVideoError(false);
    setRetry(r => r + 1);
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (!isVisible) {
    return (
      <View style={[styles.container, style, styles.centered]}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  const ratio = videoSize.width / videoSize.height;
  const rawHeight = ratio > 0 ? SCREEN_WIDTH / ratio : SCREEN_WIDTH * (16 / 9);
  const videoHeight = Math.min(Math.max(rawHeight, MIN_HEIGHT), MAX_HEIGHT); // ✅ tamaño controlado

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.container, style, {height: videoHeight}]}>
      {videoError ? (
        <View style={[styles.container, styles.centered]}>
          <Icon name="alert-circle" size={40} color="red" />
          <Text style={styles.errorText}>No se pudo cargar el video</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={{color: '#fff'}}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.videoWrapper}>
          {!isReadyToPlay && thumbnails && (
            <Image
              source={{uri: thumbnails}}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}

          <TouchableWithoutFeedback
            onPressIn={() => {
              setPaused(true);
              setShowPauseIcon(true);
            }}
            onPressOut={() => {
              setPaused(false);
              setShowPauseIcon(false);
            }}>
            <View style={StyleSheet.absoluteFill}>
              <Video
                key={videoUrl + retry}
                source={{
                  uri: videoUrl,
                  bufferConfig: {
                    minBufferMs: 1000,
                    maxBufferMs: 5000,
                    bufferForPlaybackMs: 500,
                    bufferForPlaybackAfterRebufferMs: 1000,
                  },
                }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                repeat
                muted={muted}
                paused={paused}
                maxBitRate={250000}
                onLoad={handleVideoLoad}
                onProgress={handleProgress}
                onError={handleVideoError}
                onReadyForDisplay={() => setIsReadyToPlay(true)}
              />
            </View>
          </TouchableWithoutFeedback>

          {!isReadyToPlay && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {showPauseIcon && (
            <View style={styles.pauseIcon}>
              <MaterialIcons name="pause-circle" size={70} color="#fff" />
            </View>
          )}

          {/* ✅ Mute encima del video */}
          <TouchableOpacity
            style={styles.muteButton}
            onPress={() => setMuted(m => !m)}>
            <Icon
              name={muted ? 'volume-mute' : 'volume-high'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {/* ✅ Barra de progreso */}
          <View style={styles.progressBar}>
            <View
              style={{
                height: 2,
                backgroundColor: '#fff',
                width: `${progressPercent}%`,
              }}
            />
          </View>

          {/* ✅ Tiempo */}
          <View style={styles.timeCounter}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    width: '100%',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
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
    padding: 8,
    zIndex: 10,
  },
  timeCounter: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
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
    bottom: 12, // ⬆️ subimos la barra un poco
    left: 0,
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 9,
  },
  pauseIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -35}, {translateY: -35}],
    zIndex: 10,
  },
});

export default React.memo(VideoPost, (prev, next) => {
  return (
    prev.videoUrl === next.videoUrl &&
    prev.isVisible === next.isVisible &&
    prev.shouldPause === next.shouldPause
  );
});
