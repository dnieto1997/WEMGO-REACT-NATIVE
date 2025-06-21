import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  Platform,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import VideoPost from './VideoPost';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';

const ImageViewerModal = ({ visible, onClose, images, index }) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isZooming, setIsZooming] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); // ✅ loader para imagen

  const pan = useRef(new Animated.ValueXY()).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    let timeout;
    if (flatListRef.current && visible) {
      timeout = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      }, 100);
    }
    return () => timeout && clearTimeout(timeout);
  }, [index, visible]);

  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      pan.setValue({ x: 0, y: 0 });
      onClose();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [visible]);

  const isVideo = (uri) => {
    const extension = uri?.split('.').pop()?.toLowerCase();
    return ['mp4', 'mov', 'webm'].includes(extension);
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate(event => {
      if (!isZooming) {
        pan.setValue({ x: 0, y: event.translationY });
      }
    })
    .onEnd(event => {
      if (!isZooming) {
        if (event.translationY > 150) {
          Animated.timing(pan, {
            toValue: { x: 0, y: screenHeight },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onClose();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      }
    });

  const renderItem = ({ item }) => (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View
        style={{
          width: screenWidth,
          height: screenHeight,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{
            translateY: pan.y.interpolate({
              inputRange: [-screenHeight, screenHeight],
              outputRange: [-screenHeight, screenHeight],
              extrapolate: 'clamp',
            })
          }],
          backgroundColor: '#000',
        }}
      >
        <View
          style={{
            width: screenWidth * 0.95,
            height: screenHeight * 0.9,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          {isVideo(item) ? (
            <VideoPost
              videoUrl={item}
              isVisible={true}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <>
              {imageLoading && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                  }}
                >
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}

              <ImageZoom
                uri={item}
                style={{ width: '100%', height: '100%' }}
                minScale={1}
                maxScale={4}
                doubleTapScale={3}
                isSingleTapEnabled={true}
                isDoubleTapEnabled={true}
                isPanEnabled={true}
                isPinchEnabled={true}
                onLoadStart={() => setImageLoading(true)}   // ✅ empieza a cargar
                onLoadEnd={() => setImageLoading(false)}    // ✅ carga terminada
                onInteractionStart={() => {
                  setIsZooming(true);
                  setScrollEnabled(false);
                }}
                onInteractionEnd={() => {
                  setIsZooming(false);
                  setScrollEnabled(true);
                }}
              />
            </>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        pan.setValue({ x: 0, y: 0 });
        onClose();
      }}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          scrollEnabled={scrollEnabled}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          getItemLayout={(_, i) => ({
            length: screenWidth,
            offset: screenWidth * i,
            index: i,
          })}
          initialScrollIndex={index}
          windowSize={3}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            flatListRef.current?.scrollToOffset({
              offset: index * averageItemLength,
              animated: false,
            });
          }}
        />

        <TouchableOpacity
          onPress={() => {
            pan.setValue({ x: 0, y: 0 });
            onClose();
          }}
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 40,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 10,
            borderRadius: 20,
            zIndex: 10,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageViewerModal;
