import React, {useEffect, useState} from 'react';
import {Image, View, ActivityIndicator} from 'react-native';
import CreateThumbnail from 'react-native-create-thumbnail';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const VideoThumbnail = ({uri}) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const result = await CreateThumbnail.create({url: uri});
        setThumbnail(result.path);
      } catch (error) {
        console.warn('Error generando thumbnail', error);
      } finally {
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [uri]);

  if (loading) {
    return (
      <View
        style={{
          width: 90,
          height: 130,
          borderRadius: 12,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={{width: 90, height: 130, borderRadius: 12, position: 'relative'}}>
      <Image
        source={{uri: thumbnail}}
        style={{width: 90, height: 130, borderRadius: 12}}
        resizeMode="cover"
      />
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [{translateX: -16}, {translateY: -16}],
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: 32,
          padding: 6,
          borderWidth: 1,
          borderColor: '#fff',
        }}>
        <MaterialIcons name="play-arrow" size={28} color="#fff" />
      </View>
    </View>
  );
};

export default VideoThumbnail;
