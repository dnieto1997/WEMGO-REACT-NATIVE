import React, {useEffect, useState, useContext, useCallback,useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import {getHttps, postHttps} from '../api/axios';
import {SocketContext} from '../context/SocketContext';
import CommentItem from '../components/CommentItem';

import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Video from 'react-native-video';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Tab from '../components/Tab';
import Header from '../components/Header';
import ImageViewerModal from '../components/ModalImage';
import {useFocusEffect} from '@react-navigation/native';
import VideoPost from '../components/VideoPost';
import { COLORS } from '../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Likes from '../components/Likes';

const Post = ({navigation, route}) => {
  const {id} = route.params;
  const [feed, setFeed] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [DataUser, setDataUser] = useState({});
  const [imageSizes, setImageSizes] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [commentFeedId, setCommentFeedId] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const ITEM_WIDTH = Dimensions.get('window').width - 40;
  const DEFAULT_VIDEO_RATIO = 1.0;
  const [visibleFeedId, setVisibleFeedId] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
     const [userFeedId, setUserFeedId] = useState(null);
       const [currentFeedId, setCurrentFeedId] = useState(null);
        const [isModalVisible2, setModalVisible2] = useState(false);

  const {listenForReactions, sendReactionNotification} =
    useContext(SocketContext);

  // Carga info del usuario desde AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) setDataUser(JSON.parse(data));
    };
    loadUserData();
  }, []);

  // Fetch inicial o cuando cambia el id
  useEffect(() => {
    fetchFeed(1);
  }, [id]);

  // Escuchar eventos socket para actualizar feed
  useEffect(() => {
    const unsubscribe = listenForReactions(() => {
      fetchFeed(1);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch de feeds, con paginación
  const fetchFeed = async (newPage = 1) => {
    if (isLoading || isLoadingMore || !hasMore) return;

    newPage === 1 ? setIsLoading(true) : setIsLoadingMore(true);
    try {
      const response = await getHttps(`feed/${id}?page=${newPage}&limit=5`);
      const data = response.data;

      if (data.length < 5) setHasMore(false);
      setPage(newPage);

      if (newPage === 1) {
        setFeed(data[0] || null);
        setFeeds(data);
      } else {
        setFeeds(prev => [...prev, ...data]);
      }
    } catch (error) {
      if (error.status === 401) navigation.navigate('Login');
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(page + 1);
    }
  };

  const handleClick = async idFeed => {
    if (likeLoading[idFeed]) return;

    const feedIndex = feeds.findIndex(feed => feed.feed_id === idFeed);
    if (feedIndex === -1) return;

    const currentFeed = feeds[feedIndex];
    const wasLiked = currentFeed.userLiked;

    const updatedFeeds = [...feeds];
    updatedFeeds[feedIndex] = {
      ...currentFeed,
      userLiked: !wasLiked,
      likeCount: wasLiked
        ? Number(currentFeed.likeCount) - 1
        : Number(currentFeed.likeCount) + 1,
    };
    setFeeds(updatedFeeds);

    setLikeLoading(prev => ({...prev, [idFeed]: true}));

    try {
      await postHttps('like', {
        id_feed: idFeed,
        type: 'FEED',
      });

      sendReactionNotification({
        feedId: idFeed,
        reactorId: DataUser.id,
        reactionType: '❤️',
      });

      // Opcional: si ya hiciste el optimistic update, puedes evitar recargar todo:
      // await fetchFeed(1); ❌ esto sobreescribe el estado con el de backend
    } catch (error) {
      // Revertir en caso de error
      const revertedFeeds = [...feeds];
      revertedFeeds[feedIndex] = {
        ...currentFeed,
        userLiked: wasLiked,
        likeCount: wasLiked
          ? Number(currentFeed.likeCount)
          : Number(currentFeed.likeCount) - 1,
      };
      setFeeds(revertedFeeds);

      console.error('Error al dar like:', error.response || error.message);
    } finally {
      setLikeLoading(prev => ({...prev, [idFeed]: false}));
    }
  };

  

  // Navegar al perfil según usuario
  const navigateToProfile = userId => {
    navigation.navigate(DataUser.id === userId ? 'Profile' : 'FriendTimeline', {
      id: userId,
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        fetchFeed(1);
      }
    }, [route.params?.refresh]),
  );

  const onViewRef = useRef(({ viewableItems }) => {
  if (viewableItems.length > 0) {
    const firstVisibleItem = viewableItems[0];
    setVisibleFeedId(firstVisibleItem.item.feed_id);
  }
});

const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // Obtener tamaño de imagen/video para ajustar altura

  // Abrir modal de comentarios

  // Validar si es video
  const isVideo = uri => /\.(mp4|mov|avi|webm)$/i.test(uri);

  const renderMedia = (images, feedId) => {
    const fetchImageSize = (uri, index) => {
      const key = `${feedId}-${index}`;

      if (uri.toLowerCase().endsWith('.mp4')) {
        const calculatedHeight = ITEM_WIDTH * DEFAULT_VIDEO_RATIO;
        setImageSizes(prev => ({
          ...prev,
          [key]: calculatedHeight,
        }));
        return;
      }

      Image.getSize(
        uri,
        (width, height) => {
          const ratio = height / width;
          const calculatedHeight = ITEM_WIDTH * ratio;
          setImageSizes(prev => ({
            ...prev,
            [key]: calculatedHeight,
          }));
        },
        error => {
          setImageSizes(prev => ({
            ...prev,
            [key]: ITEM_WIDTH * 0.75,
          }));
          console.warn('Error getSize image:', error);
        },
      );
    };
    const FIXED_IMAGE_HEIGHT = 422; // o 400
    const isMultiple = images.length > 1;

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
              const index = Math.round(
                event.nativeEvent.contentOffset.x / ITEM_WIDTH,
              );
              setActiveImageIndex(prev => ({
                ...prev,
                [feedId]: index,
              }));
            }}
            renderItem={({item, index}) => {
              const key = `${feedId}-${index}`;
              const height = imageSizes[key];

              if (!height) fetchImageSize(item, index);

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setCurrentImages(images);
                    setImageIndex(index);
                    setImageViewVisible(true);
                  }}>
                  <View
                    style={{
                      width: ITEM_WIDTH,
                      height: FIXED_IMAGE_HEIGHT || 400,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {!height ? (
                      <ActivityIndicator size="large" color="#888" />
                    ) : isVideo(item) ? (
                      <VideoPost
                        videoUrl={item}
                        isVisible={visibleFeedId === feedId}
                        style={{width: ITEM_WIDTH, height: FIXED_IMAGE_HEIGHT}} // 👈 estilos personalizados
                      />
                    ) : (
                      <Image
                        source={{uri: item}}
                        style={{width: ITEM_WIDTH, height: FIXED_IMAGE_HEIGHT}}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Contador de imágenes */}
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}>
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 12}}>
              {(activeImageIndex[feedId] || 0) + 1}/{images.length}
            </Text>
          </View>
        </View>
      );
    }

    // En renderMedia para imágenes individuales (no múltiples)
    return (
      <TouchableOpacity
        onPress={() => {
          setCurrentImages(images);
          setImageIndex(0);
          setImageViewVisible(true);
        }}>
        <View
          style={{
            width: ITEM_WIDTH,
            height: FIXED_IMAGE_HEIGHT, // aquí pones fijo el alto
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isVideo(images[0]) ? (
            <VideoPost
              videoUrl={images[0]}
               isVisible={visibleFeedId === feedId}
              style={{width: ITEM_WIDTH, height: FIXED_IMAGE_HEIGHT}} // 👈 estilos personalizados
            />
          ) : (
            <Image
              source={{uri: images[0]}}
              resizeMode="cover"
              style={{width: ITEM_WIDTH, height: FIXED_IMAGE_HEIGHT}}
            />
          )}
        </View>

        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}>
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 12}}>
            1/1
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Parsear feed_img JSON y agregar mediaList a cada post
  const parsedUserPosts = feeds.map(post => {
    let postMediaList = [];
    if (post.feed_img) {
      try {
        postMediaList = JSON.parse(post.feed_img);
      } catch (error) {
        console.error('Error parsing userPost feed_img:', error);
      }
    }
    return {
      ...post,
      mediaList: postMediaList,
    };
  });

  // Render individual de un post en FlatList
  const renderItem = ({item}) => {
    return (
      <View style={styles.postContainer}>
        <TouchableOpacity onPress={() => navigateToProfile(item.userId)}>
          <View style={styles.header}>
            <Image source={{uri: item.users_img}} style={styles.imgProfile} />
            <Text style={styles.profileName}>
              {`${item.users_first_name} ${item.users_last_name}`}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {item.mediaList.length > 0 &&
            renderMedia(item.mediaList, item.feed_id)}

          <CommentItem
            feedId={item.feed_id}
            isVisible={isModalVisible && commentFeedId === item.feed_id}
            feedOwnerId={item.users_id}
            onClose={() => setModalVisible(false)}
            onCommentAdded={() => fetchFeed(1)}
            onCommentDeleted={() => fetchFeed(1)}
          />
        </View>

    <View style={styles.interactionRow}>
  {/* Corazón + número de likes */}
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
    <TouchableOpacity
      onPress={() => handleClick(item.feed_id)}
      disabled={likeLoading[item.feed_id]}
      style={styles.likeContainer}
    >
      <MaterialCommunityIcons
        name="cards-heart-outline"
        size={30}
        color={item.userLiked ? 'red' : 'gray'}
      />
    </TouchableOpacity>

    <TouchableOpacity    onPress={() => {
                setUserFeedId(feed.userId);
                setCurrentFeedId(feed.feed_id);
                setModalVisible2(true);
              }}>
      <Text style={styles.likeText}>{item.likeCount}</Text>
    </TouchableOpacity>
  </View>

  {/* Comentarios */}
  <TouchableOpacity
    onPress={() => {
      setCommentFeedId(item.feed_id);
      setModalVisible(true);
    }}
    style={styles.commentContainer}
  >
    <MaterialCommunityIcons name="comment" size={30} color="white" />
    <Text style={styles.likeText}>{item.commentCount}</Text>
  </TouchableOpacity>
</View>


        <Text style={styles.profileName}>
          {`${item.users_first_name} ${item.users_last_name}`}
        </Text>

            <Text
                    style={[styles.eventAddress, {flexWrap: 'wrap'}]}
                    numberOfLines={showFullDescription ? undefined : 2}
                    ellipsizeMode={showFullDescription ? undefined : 'tail'}>
                    {item.feed_description}
                  </Text>
        
                  {item.feed_description && item.feed_description.length > 50 && (
                    <TouchableOpacity
                      onPress={() => setShowFullDescription(!showFullDescription)}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 12,
                          marginTop: 2,
                          fontFamily: 'Poppins-Bold',
                        }}>
                        {showFullDescription ? 'Ver menos' : 'Ver más'}
                      </Text>
                    </TouchableOpacity>
                  )}
        <Text style={styles.dateText}>
          {moment(item.feed_date_publication).format('D MMMM')}
        </Text>
      </View>
    );
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <FlatList
          data={parsedUserPosts}
          keyExtractor={item => `${item.feed_id}`}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          ListHeaderComponent={
            <View style={{top: 20, left: 10}}>
                <View style={styles.container2}>
                   <TouchableOpacity
                     onPress={() => {
                        navigation.navigate("Event");
                     }}
                     style={styles.iconContainer}>
                     <Ionicons name="arrow-back" size={22} color={COLORS.black} />
                   </TouchableOpacity>
                   <Text style={styles.title}>Publicaciones</Text>
                   <TouchableOpacity onPress={() => {}}></TouchableOpacity>
                 </View>
            </View>
          }
          ListFooterComponent={
            isLoadingMore && (
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  marginVertical: 10,
                  fontFamily: 'Poppins-Bold',
                  fontSize: 15,
                }}>
                Cargando más...
              </Text>
            )
          }
        />
      </View>

      <ImageViewerModal
        visible={isImageViewVisible}
        images={currentImages}
        index={imageIndex}
        onClose={() => setImageViewVisible(false)}
      />

          <Likes
              feedId={currentFeedId}
              isVisible={isModalVisible2}
              feedOwnerId={userFeedId}
              onClose={() => setModalVisible2(false)}
            />

      <Tab />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {flex: 1, backgroundColor: 'black'},
  container: {flex: 1, backgroundColor: 'black', marginBottom: 100},
  postContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    top: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // o el color de fondo que uses
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  imgProfile: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  profileName: {fontWeight: 'bold', fontSize: 16, color: 'white'},
  imageContainer: {borderRadius: 10, overflow: 'hidden'},
  imageWrapper: {position: 'relative'},
  caption: {marginTop: 5, fontSize: 14, color: 'white'},
  dateText: {marginTop: 5, fontSize: 12, color: '#aaa'},
interactionRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},
  likeContainer: {flexDirection: 'row', alignItems: 'center', padding: 4},
  likeText: {fontSize: 20, marginLeft: 8, color: 'white'},
  commentContainer: {flexDirection: 'row', alignItems: 'center'},
  commentText: {fontSize: 14, marginLeft: 8, color: 'white'},
  imageCount: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 11, 11, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
    eventAddress: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-Regular',
  },
  imageCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
   container2: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconContainer: {
      height: 30,
      width: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      backgroundColor: COLORS.white,
    },
    title: {
      fontSize: 22,
      fontFamily: 'Poppins-Bold',
      color: COLORS.white,
    },
    point: {
      position: 'absolute',
      top: 0,
      right: 8,
      height: 4,
      width: 4,
      borderRadius: 999,
      backgroundColor: COLORS.red,
      zIndex: 999,
    },
});

export default Post;
