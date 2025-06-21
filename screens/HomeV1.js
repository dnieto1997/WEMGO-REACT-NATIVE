import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS} from '../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {getHttps, postHttps, deleteHttps} from '../api/axios';
import CommentItem from '../components/CommentItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {SocketContext} from '../context/SocketContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageViewerModal from '../components/ModalImage';
import VideoPost from '../components/VideoPost';
import Likes from '../components/Likes';
import HeaderHome from '../components/HeaderHome';
import StoriesList from '../components/StoriesList';
import FastImage from 'react-native-fast-image';
const {width} = Dimensions.get('window');

const ITEM_WIDTH = Dimensions.get('window').width - 40;

const HomeV1 = ({navigation, route}) => {
  const [feeds, setFeeds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [currentFeedId, setCurrentFeedId] = useState(null);
  const [stories, setStories] = useState([]);
  const [userFeedId, setUserFeedId] = useState(null);
  const [DataUser, setDataUser] = useState({});
  const {sendReactionNotification} = useContext(SocketContext);
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [likeLoading, setLikeLoading] = useState({});
  const [User, setUser] = useState({});
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFeeds, setHasMoreFeeds] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const flatListRef = useRef(null);
  const FIXED_HEIGHT = 450;
    const [loading, setLoading] = useState(true);

  const [visibleFeedId, setVisibleFeedId] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const isVideo = url => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  useEffect(() => {
    if (route?.params?.refresh) {
      fetchFeeds && fetchFeeds();
      fetchStories && fetchStories();
      // Hacer scroll al principio
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({offset: 0, animated: true});
      }
      navigation.setParams({refresh: undefined});
    }
  }, [route?.params?.refresh]);

  // Cargar datos de usuario
  const loadUserData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setDataUser(parsedData);
        fetchUserData(parsedData.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const fetchUserData = async id => {
    try {
      const response = await getHttps(`users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUnreadConversations = async () => {
    try {
      const {data} = await getHttps('chat/conversation');
      setUnreadCount(data);
    } catch (error) {
      console.error('Error fetching unread conversations:', error);
    }
  };

  // Cargar feeds
  const fetchFeeds = useCallback(
    async (newPage = 1) => {
      setIsLoading(true);
      try {
        const {data} = await getHttps(`feed?page=${newPage}&limit=5`);
        if (Array.isArray(data)) {
          if (newPage === 1) setFeeds(data);
          else setFeeds(prev => [...prev, ...data]);
          return data.length;
        } else {
          setFeeds([]);
          return 0;
        }
      } catch (err) {
        if (err?.response?.status === 401) navigation.navigate('Login');
        else console.error('Error fetching feeds:', err);
        setFeeds([]);
        return 0;
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [navigation],
  );

  const fetchStories = useCallback(async () => {
    if (!DataUser.id) return;

    try {
      const response = await getHttps(`stories/find/${DataUser.id}`);
      const storiesData = Array.isArray(response.data) ? response.data : [];

      const formattedStories = storiesData.map(userItem => {
        const userImage = userItem.user?.img;

        // Mapear cada historia del usuario
        const mappedStories = userItem.stories.map(story => ({
          ...story,
          storyUrl: userImage, // Fallback si storyUrl no está
          isLoading: false,
        }));

        return {
          user: userItem.user,
          stories: mappedStories,
        };
      });

      setStories(formattedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    }
  }, [DataUser.id]);

  // Refrescar todo
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMoreFeeds(true);
    await fetchFeeds(1);
    await fetchStories();
    setRefreshing(false);
  };

  // Cargar más feeds (paginación)
  const handleLoadMore = async () => {
    if (isLoadingMore || refreshing || !hasMoreFeeds) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const count = await fetchFeeds(nextPage);
    if (count > 0) setPage(nextPage);
    if (count < 5) setHasMoreFeeds(false);
    setIsLoadingMore(false);
  };

  // Eliminar feed
  const handleDelete = async () => {
    if (!feedToDelete) return;
    try {
      await deleteHttps(`feed/${feedToDelete}`);
      setShowDeleteConfirm(false);
      setShowOptionsId(null);
      setFeedToDelete(null);
      setFeeds(curr => curr.filter(f => f.feed_id !== feedToDelete));
    } catch (err) {
      console.error('Error deleting feed:', err);
    }
  };

  // Like
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
      await postHttps('like', {id_feed: idFeed, type: 'FEED'});
      sendReactionNotification?.({
        feedId: idFeed,
        reactorId: DataUser.id,
        reactionType: '❤️',
      });
    } catch (error) {
      // Revertir en caso de error
      setFeeds(feeds);
      console.error('Error al dar like:', error?.response || error?.message);
    } finally {
      setLikeLoading(prev => ({...prev, [idFeed]: false}));
    }
  };

  // Opciones de feed
  const toggleOptions = feedId => {
    setShowOptionsId(feedId === showOptionsId ? null : feedId);
  };

  const timeAgo = dateString => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'hace unos segundos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days} día${days > 1 ? 's' : ''}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
    const years = Math.floor(months / 12);
    return `hace ${years} año${years > 1 ? 's' : ''}`;
  };

  // Renderizar opciones de feed
  const renderFeedOptions = feed => {
    if (feed.userId === DataUser.id) {
      return (
        <View>
          <TouchableOpacity
            style={styles.feedOptionsButton}
            onPress={() => toggleOptions(feed.feed_id)}>
            <Entypo name="dots-three-vertical" size={22} color="gray" />
          </TouchableOpacity>
          {showOptionsId === feed.feed_id && !showDeleteConfirm && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  setShowOptionsId(null);
                  navigation.navigate('EditFeed', {id: feed.feed_id});
                }}>
                <MaterialIcons name="edit" size={24} color="black" />
                <Text style={styles.optionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  setFeedToDelete(feed.feed_id);
                  setShowDeleteConfirm(true);
                }}>
                <MaterialIcons name="delete" size={24} color="black" />
                <Text style={styles.optionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  const renderMedia = (images, feedId) => {
    const isMultiple = images.length > 1;
    const isVisible = visibleFeedId === feedId;
    const activeIndex = activeImageIndex[feedId] || 0;

    if (isMultiple) {
      const flatListExtraData = `${visibleFeedId}-${activeIndex}`;

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
            removeClippedSubviews={true}
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / ITEM_WIDTH,
              );
              if (activeImageIndex[feedId] !== index) {
                setActiveImageIndex(prev => ({
                  ...prev,
                  [feedId]: index,
                }));
              }
            }}
            renderItem={({item, index}) => {
              const shouldShowVideo = isVisible && activeIndex === index;

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
                      height: FIXED_HEIGHT,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 12,
                      backgroundColor: '#000',
                      overflow: 'hidden',
                    }}>
                    {isVideo(item) && shouldShowVideo ? (
                      <VideoPost
                        key={`${feedId}-${index}`}
                        videoUrl={item}
                        isVisible={true}
                        style={{width: ITEM_WIDTH, height: FIXED_HEIGHT}}
                        shouldPause={
                          visibleFeedId !== feedId || !isScreenFocused
                        }
                      />
                    ) : (

  <FastImage
    source={{ uri: item }}
     style={{width: ITEM_WIDTH, height: FIXED_HEIGHT}}
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
            extraData={flatListExtraData}
          />

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
              {`${activeIndex + 1}/${images.length}`}
            </Text>
          </View>
        </View>
      );
    }

    // ✅ Solo una imagen o video
    return (
      <TouchableOpacity
        onPress={() => {
          setCurrentImages(images);
          setImageIndex(0);
          setImageViewVisible(true);
        }}>
        {isVideo(images[0]) && isVisible ? (
          <VideoPost
            key={`${feedId}-0`}
            videoUrl={images[0]}
            isVisible={true}
            style={{
              width: '100%',
              height: FIXED_HEIGHT,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
            shouldPause={visibleFeedId !== feedId || !isScreenFocused}
          />
        ) : (
    <View
      style={{
        width: '100%',
        maxHeight: 500,
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: '#000',
        justifyContent: 'center',
      }}>
      
      {loading && (
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={StyleSheet.absoluteFill}
        />
      )}

      <FastImage
        source={{ uri: images[0] }}
        style={{
          width: Dimensions.get('window').width * 0.95,
          height: undefined,
          aspectRatio: 0.8,
        }}
        resizeMode={FastImage.resizeMode.contain}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </View>
        )}

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

  // Renderizar cada feed
  const renderFeedItem = (feed, index) => {
    let images = [];
    if (feed.feed_img) {
      try {
        images = Array.isArray(feed.feed_img)
          ? feed.feed_img
          : JSON.parse(feed.feed_img);
      } catch (error) {
        images = [];
      }
    }
    return (
      <View key={index} style={postStyles.feedContainer}>
        {/* Perfil */}
        <View style={postStyles.profileContainer}>
          <TouchableOpacity
            onPress={() => {
              if (DataUser.id == feed.userId) navigation.navigate('Profile');
              else navigation.navigate('FriendTimeline', {id: feed.userId});
            }}
            style={{flexDirection: 'row'}}>
            <FastImage
              source={{
                uri:
                  feed.users_img ||
                  'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
              }}
              style={postStyles.imgProfile}
            />
            <View style={{left: 10, top: 7}}>
              <Text style={postStyles.profileName}>
                {feed.users_first_name
                  ? `${feed.users_first_name} ${feed.users_last_name}`
                  : 'Anónimo'}
              </Text>
            </View>
          </TouchableOpacity>
          {renderFeedOptions(feed)}
          {feedToDelete === feed.feed_id && showDeleteConfirm && (
            <View style={styles.overlay}>
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>
                  ¿Eliminar esta publicación?
                </Text>
                <Text style={styles.confirmMessage}>
                  Esta acción no se puede deshacer.
                </Text>
                <View style={styles.confirmActions}>
                  <TouchableOpacity
                    onPress={() => setShowDeleteConfirm(false)}
                    style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
        <View style={{flexDirection: 'row'}}>
          <View style={postStyles.contentRow}></View>
          <View style={postStyles.imageContainer}>
            {images.length > 0 &&
              images[0] &&
              renderMedia(images, feed.feed_id)}
          </View>
        </View>
        <View style={postStyles.interactionContainer}>
          <TouchableOpacity
            onPress={() => handleClick(feed.feed_id)}
            disabled={likeLoading[feed.feed_id]}
            style={postStyles.likeContainer}>
            <MaterialCommunityIcons
              name="cards-heart-outline"
              size={30}
              color={feed.userLiked ? 'red' : 'white'}
            />
            <TouchableOpacity
              onPress={() => {
                setUserFeedId(feed.userId);
                setCurrentFeedId(feed.feed_id);
                setModalVisible2(true);
              }}>
              <Text style={postStyles.likeText}>{feed.likeCount} </Text>
            </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setUserFeedId(feed.userId);
              setCurrentFeedId(feed.feed_id);
              setModalVisible(true);
            }}
            style={postStyles.commentContainer}>
            <MaterialCommunityIcons name="comment" size={30} color="white" />
            <Text style={postStyles.commentText}>{feed.commentCount}</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            postStyles.descriptionContainer,
            feed.feed_description &&
              feed.feed_description.length > 50 && {marginTop: 35},
          ]}>
          <TouchableOpacity
            onPress={() => {
              if (DataUser.id === feed.userId) {
                navigation.navigate('Profile');
              } else {
                navigation.navigate('FriendTimeline', {id: feed.userId});
              }
            }}>
            <Text
              style={[postStyles.profileName, {flexWrap: 'wrap'}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {feed.users_first_name
                ? `${feed.users_first_name} ${feed.users_last_name}`
                : 'Anónimo'}
            </Text>
          </TouchableOpacity>

          <Text
            style={[postStyles.eventAddress, {flexWrap: 'wrap'}]}
            numberOfLines={showFullDescription ? undefined : 2}
            ellipsizeMode={showFullDescription ? undefined : 'tail'}>
            {feed.feed_description}
          </Text>

          {feed.feed_description && feed.feed_description.length > 50 && (
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

          <Text style={{color: '#aaa', fontSize: 12, marginTop: 2}}>
            {feed.feed_date_publication
              ? timeAgo(feed.feed_date_publication)
              : ''}
          </Text>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: '#ccc',
            marginTop: 10,
            width: '100%',
            top: 10,
          }}
        />
      </View>
    );
  };

  // FlatList: para saber cuál feed está visible (para pausar videos)
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setVisibleFeedId(viewableItems[0].item.feed_id);
    }
  }).current;

  // Cargar datos al enfocar pantalla
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true); // ✅ pantalla visible

      loadUserData();
      fetchFeeds();
      fetchStories();
      fetchUnreadConversations();

      return () => {
        setIsScreenFocused(false); // ✅ pantalla dejó de estar visible
      };
    }, [loadUserData, fetchFeeds, fetchStories]),
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.containerfeed}>
        <FlatList
          ref={flatListRef}
          data={feeds}
          keyExtractor={item => `${item.feed_id}`}
          renderItem={({item, index}) => renderFeedItem(item, index)}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{itemVisiblePercentThreshold: 50}}
          ListHeaderComponent={() => (
            <>
              <HeaderHome
                navigation={navigation}
                unreadCount={unreadCount}
                DataUser={DataUser}
              />
              <StoriesList
                stories={stories}
                navigation={navigation}
                DataUser={DataUser}
                User={User}
              />
            </>
          )}
          ListEmptyComponent={
            !refreshing && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No hay publicaciones que mostrar
                </Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>
                  Cargando más publicaciones...
                </Text>
              </View>
            ) : null
          }
        />
        <View style={{margin: 30}} />
      </View>
      <CommentItem
        feedId={currentFeedId}
        isVisible={isModalVisible}
        feedOwnerId={userFeedId}
        onClose={() => setModalVisible(false)}
        onCommentAdded={fetchFeeds}
        onCommentDeleted={fetchFeeds}
      />
      <Likes
        feedId={currentFeedId}
        isVisible={isModalVisible2}
        feedOwnerId={userFeedId}
        onClose={() => setModalVisible2(false)}
      />
      <ImageViewerModal
        visible={isImageViewVisible}
        images={currentImages}
        index={imageIndex}
        onClose={() => setImageViewVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  eventTitle: {fontSize: 16, fontWeight: 'bold'},

  containerfeed: {
    flex: 1,
    backgroundColor: 'black',
    paddingBottom: 50, // Extra padding to ensure last comment is visible
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 50, // Ensures the last item is not cut off
  },

  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },

  area: {
    flex: 1,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 20,
  },
  loaderText: {
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },

  storiesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },

  storyImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: 'white', // Simula borde tipo IG
  },
  storyText: {
    fontSize: 12,
    color: '#fff',
    width: 70,
    textAlign: 'center',
    marginTop: 4,
  },
  plusIconContainer: {position: 'relative'},
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: 10,
    backgroundColor: 'black',
    width: 23,
    height: 23,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  feedOptionsButton: {
    padding: 8,
    zIndex: 2,
    left: (120 / 360) * width,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  optionsContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 12,
    width: 150,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'black',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    zIndex: 100,
  },
  confirmBox: {
    width: '90%',
    padding: 20,
    top: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    height: 150,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  cancelText: {
    color: '#333',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    fontSize: 18,
    fontFamily: 'Roboto Medium',
    color: 'gray',
  },
});

const postStyles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  likeText: {
    fontSize: 17,
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  noPostsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    textAlign: 'center',
  },
  feedContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 12,
    marginBottom: 40,
    marginHorizontal: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    gap: 10,
  },
  imgProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeText: {
    fontSize: 12,
    color: '#aaa',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: '50%',
    top: '10%',
  },
  sidebar: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight: 10,
  },
  sidebarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  eventImage: {
    width: '100%',
    height: 500,
  },
  imageCount: {
    position: 'absolute',
    top: 10,
    right: 7,
    backgroundColor: '#000a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  interactionContainer: {
    top: 10,
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    gap: 20,
  },
  likeContainer: {flexDirection: 'row', alignItems: 'center', color: 'white'},

  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 17,
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },

  descriptionContainer: {
    width: '100%', // que ocupe todo el ancho posible
    flexDirection: 'column', // por defecto, pero aseguramos que sea vertical
    paddingHorizontal: 10,
    top: 13,
  },

  profileName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white', // azul claro para indicar que es tocable
    fontFamily: 'Poppins-Bold',
  },

  eventAddress: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-Regular',
  },
});

export default HomeV1;
