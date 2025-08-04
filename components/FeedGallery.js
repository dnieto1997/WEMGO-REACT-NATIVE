// components/FeedGallery.js
import React, {useCallback} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import PhotoCard from './PhotoCard';

const FeedGallery = ({feed = [], userId, activeTab}) => {
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const itemSize = screenWidth / numColumns;

  const renderPhotoCard = useCallback(
    ({item, index}) => {
      let mainImageUrl = null;
      const isVideo = url => {
        if (!url || typeof url !== 'string') return false;
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
        return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
      };

      try {
        const parsedThumbnails = JSON.parse(item.thumbnail || '[]');
        const parsedImages = JSON.parse(item.img || '[]');

        if (
          Array.isArray(parsedImages) &&
          parsedImages.length > 0 &&
          parsedImages[0]
        ) {
          mainImageUrl = parsedImages[0];
          const originalUrl = parsedImages[0];

          if (isVideo(originalUrl)) {
            if (Array.isArray(parsedThumbnails) && parsedThumbnails[0]) {
              imageUrl = {
                uri: parsedThumbnails[0],
                thumbnail: parsedThumbnails,
              };
            } else {
              imageUrl = {uri: originalUrl};
            }
          } else {
            imageUrl = {uri: originalUrl};
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
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {mainImageUrl && !isVideo(mainImageUrl) ? (
            <PhotoCard
              image={{uri: mainImageUrl}}
              id={item.id}
              idUser={userId}
            />
          ) : (
            <PhotoCard
              image={imageUrl || null}
              id={item.id}
              idUser={userId}
              views={item.viewsCount}
              video={true}
              isReel={item.isReel}
            />
          )}
        </View>
      );
    },
    [userId, itemSize],
  );

  const filteredFeed = feed.filter(item => {
    const isVideo = item.isVideo === '1';
    return activeTab === 'posts' ? !isVideo : isVideo;
  });
  return (
    <FlatList
      data={filteredFeed}
      numColumns={numColumns}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={renderPhotoCard}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 100}}
    />
  );
};

export default FeedGallery;
