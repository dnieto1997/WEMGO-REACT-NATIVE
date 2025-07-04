import React, { useState } from 'react';
import { View, FlatList, Text, Dimensions, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import VideoPost from './VideoPost';

const ITEM_WIDTH = Dimensions.get('window').width - 40;
const FIXED_HEIGHT = 450;

const MediaCarousel = ({ images, feedId, visibleFeedId, isScreenFocused, setCurrentImages, setImageIndex, setImageViewVisible }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const isVideo = url => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isMultiple = images.length > 1;
  const isVisible = visibleFeedId === feedId;

  if (isMultiple) {
    return (
      <View>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={ITEM_WIDTH}
          snapToAlignment="start"
          keyExtractor={(item, idx) => `${feedId}-${idx}`}
          onMomentumScrollEnd={event => {
            const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
            setActiveImageIndex(index);
          }}
          renderItem={({ item, index }) => {
            const shouldShowVideo = isVisible && activeImageIndex === index;
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setCurrentImages(images);
                  setImageIndex(index);
                  setImageViewVisible(true);
                }}>
                <View style={styles.mediaWrapper}>
                  {isVideo(item) && shouldShowVideo ? (
                    <VideoPost
                      key={`${feedId}-${index}`}
                      videoUrl={item}
                      isVisible={true}
                      style={{ width: ITEM_WIDTH, height: FIXED_HEIGHT }}
                      shouldPause={!isVisible || !isScreenFocused}
                    />
                  ) : (
                    <FastImage
                      source={{ uri: item }}
                      style={{ width: ITEM_WIDTH, height: FIXED_HEIGHT }}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
        />

        <View style={styles.counter}>
          <Text style={styles.counterText}>{`${activeImageIndex + 1}/${images.length}`}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => {
        setCurrentImages(images);
        setImageIndex(0);
        setImageViewVisible(true);
      }}>
      <View style={styles.mediaWrapper}>
        {isVideo(images[0]) && isVisible ? (
          <VideoPost
            key={`${feedId}-0`}
            videoUrl={images[0]}
            isVisible={true}
            style={{ width: '100%', height: FIXED_HEIGHT }}
            shouldPause={!isVisible || !isScreenFocused}
          />
        ) : (
          <>
            {loading && <ActivityIndicator size="large" color="#ffffff" style={StyleSheet.absoluteFill} />}
            <FastImage
              source={{ uri: images[0] }}
              style={{ width: Dimensions.get('window').width * 0.95, aspectRatio: 0.8 }}
              resizeMode={FastImage.resizeMode.contain}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </>
        )}
      </View>
      <View style={styles.counter}>
        <Text style={styles.counterText}>1/1</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediaWrapper: {
    width: ITEM_WIDTH,
    height: FIXED_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MediaCarousel;
