// components/FeedGallery.js
import React, { useCallback } from 'react';
import { View, FlatList } from 'react-native';
import PhotoCard from './PhotoCard';

const FeedGallery = ({ feed = [], userId }) => {
  const renderPhotoCard = useCallback(({ item }) => {
    let imageUrl = null;
    try {
      const parsedThumbnails = JSON.parse(item.thumbnail || '[]');
      const parsedImages = JSON.parse(item.feed_img || '[]');
      const isVideo = url => ['.mp4', '.mov', '.avi', '.webm'].some(ext => url.toLowerCase().endsWith(ext));

      if (parsedImages?.[0]) {
        const originalUrl = parsedImages[0];
        imageUrl = isVideo(originalUrl)
          ? { uri: originalUrl }
          : { uri: parsedThumbnails?.[0] || originalUrl };
      }
    } catch (error) {
      console.log('Error parsing feed_img or thumbnail:', error);
    }

    return (
      <PhotoCard
        image={imageUrl}
        comments={item.commentCount}
        likes={item.likeCount}
        id={item.feed_id}
        idUser={userId}
      />
    );
  }, [userId]);

  return (
    <FlatList
      data={feed}
      numColumns={3}
      keyExtractor={(item, index) => `${item.feed_id}-${index}`}
      renderItem={renderPhotoCard}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};

export default FeedGallery;