// components/FeedGallery.js
import React, { useCallback } from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import PhotoCard from './PhotoCard';

const FeedGallery = ({ feed = [], userId }) => {
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const itemSize = screenWidth / numColumns;

  const renderPhotoCard = useCallback(({ item, index }) => {
    let imageUrl = null;
    let mainImageUrl = null;
    const isVideo = url => {
      if (!url || typeof url !== 'string') return false;
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
      return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };
    try {
      const parsedThumbnails = JSON.parse(item.thumbnail || '[]');
      const parsedImages = JSON.parse(item.feed_img || '[]');
      if (
        Array.isArray(parsedImages) &&
        parsedImages.length > 0 &&
        parsedImages[0]
      ) {
        mainImageUrl = parsedImages[0];
        const originalUrl = parsedImages[0];
        if (isVideo(originalUrl)) {
          imageUrl = { uri: originalUrl };
        } else if (Array.isArray(parsedThumbnails) && parsedThumbnails[0]) {
          imageUrl = { uri: parsedThumbnails[0] };
        } else {
          imageUrl = { uri: originalUrl };
        }
      }
    } catch (error) {
      console.log('Error parsing img/thumbnail:', error);
    }
    return (
      <View
        style={{
          aspectRatio: 1,
          width: itemSize,
          height: itemSize,
          margin: 1,
          borderRadius: 10,
          overflow: 'hidden',
          // backgroundColor: '#222', // Fondo negro quitado
          // borderColor: 'white', // Borde blanco quitado
          //border: 0, // Borde quitado
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mainImageUrl && !isVideo(mainImageUrl) ? (
          <PhotoCard
            image={{ uri: mainImageUrl }}
            comments={item.commentCount}
            likes={item.likeCount}
            id={item.feed_id}
            idUser={userId}
          />
        ) : (
          <PhotoCard
            image={mainImageUrl ? { uri: mainImageUrl } : null}
            comments={item.commentCount}
            likes={item.likeCount}
            id={item.feed_id}
            idUser={userId}
          />
        )}
      </View>
    );
  }, [userId, itemSize]);

  return (
    <FlatList
      data={feed}
      numColumns={numColumns}
      keyExtractor={(item, index) => `${item.feed_id}-${index}`}
      renderItem={renderPhotoCard}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};

export default FeedGallery;