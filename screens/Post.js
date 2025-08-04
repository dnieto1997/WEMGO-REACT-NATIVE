import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import {getHttps, postHttps} from '../api/axios';
import {SocketContext} from '../context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommentItem from '../components/CommentItem';
import ImageViewerModal from '../components/ModalImage';
import Likes from '../components/Likes';
import Tab from '../components/Tab';
import {useFocusEffect} from '@react-navigation/native';
import {COLORS, SIZES} from '../constants';
import MediaCarouselPost from '../components/MediaCarouselPost';
import {useIsFocused} from '@react-navigation/native';

const Post = ({navigation, route}) => {
  const {id} = route.params;
  const [feeds, setFeeds] = useState([]);
  const [DataUser, setDataUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [visibleFeedId, setVisibleFeedId] = useState(null);
  const [likeLoading, setLikeLoading] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [commentFeedId, setCommentFeedId] = useState(null);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [currentFeedId, setCurrentFeedId] = useState(null);
  const [userFeedId, setUserFeedId] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [focusCommentId, setFocusCommentId] = useState(null);
  const [pendingFeeds, setPendingFeeds] = useState(null);
  const flatListRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const isScreenFocused = useIsFocused();

  const {listenForReactions, sendReactionNotification} =
    useContext(SocketContext);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) setDataUser(JSON.parse(data));
    };
    loadUserData();
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [id]);

  useEffect(() => {
    const unsubscribe = listenForReactions(() => fetchFeed());
    return () => unsubscribe && unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) fetchFeed();
    }, [route.params?.refresh]),
  );

  const fetchFeed = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsReady(false); // 👈 reiniciar antes de nueva carga

    try {
      const response = await getHttps(`feed/${id}`);
      const {feeds: data, selectedIndex} = response.data;

      setFeeds(data);
      setSelectedIndex(selectedIndex);
      setIsReady(true); // ✅ listo para renderizar
    } catch (error) {
      if (error?.status === 401) navigation.navigate('Login');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleCloseModal = () => {
    setModalVisible(false);
    if (pendingFeeds) {
      setFeeds(pendingFeeds);
      setPendingFeeds(null);
    }
  };

  const handleClick = useCallback(
    async idFeed => {
      if (likeLoading[idFeed]) return;

      const index = feeds.findIndex(f => f.feed_id === idFeed);
      if (index === -1) return;

      const updated = [...feeds];
      const currentFeed = updated[index];
      const wasLiked = currentFeed.userLiked;
      const likeCountNumber = parseInt(currentFeed.likeCount || '0', 10);

      updated[index] = {
        ...currentFeed,
        userLiked: !wasLiked,
        likeCount: wasLiked
          ? Math.max(0, likeCountNumber - 1)
          : likeCountNumber + 1,
      };
      setFeeds(updated);
      setLikeLoading(prev => ({...prev, [idFeed]: true}));

      try {
        await postHttps('like', {id_feed: idFeed, type: 'FEED'});
        if (!wasLiked) {
          sendReactionNotification({
            feedId: idFeed,
            reactorId: DataUser.id,
            reactionType: '❤️',
          });
        }
      } catch (err) {
        updated[index] = {
          ...currentFeed,
          userLiked: wasLiked,
          likeCount: likeCountNumber,
        };
        setFeeds(updated);
      } finally {
        setLikeLoading(prev => ({...prev, [idFeed]: false}));
      }
    },
    [feeds, likeLoading, DataUser.id],
  );

  const onViewRef = useRef(({viewableItems}) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0];
      if (firstVisibleItem?.item?.feed_id) {
        setVisibleFeedId(firstVisibleItem.item.feed_id);
      }
    }
  });

  const handleShareProfile = async id => {
    try {
      const {data} = await getHttps(`shortlink/generate?type=feed&id=${id}`);

      await Share.share({
        message: `Mira esta Publicacion en Wemgo:\n${data.url}`,
      });
    } catch (err) {
      console.error('Error compartir el feed:', err);
    }
  };

  const viewConfigRef = useRef({itemVisiblePercentThreshold: 70});

  const parsedUserPosts = useMemo(() => {
    if (!Array.isArray(feeds)) return [];
    return feeds.map(post => {
      let mediaList = [];
      try {
        mediaList = post.feed_img ? JSON.parse(post.feed_img) : [];
      } catch {}
      return {...post, mediaList};
    });
  }, [feeds]);

  const toggleDescription = feedId => {
    setExpandedDescriptions(prev => ({...prev, [feedId]: !prev[feedId]}));
  };

  const renderItem = ({item}) => (
    <View style={styles.postContainer}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            DataUser.id === item.userId ? 'Profile' : 'FriendTimeline',
            {id: item.userId},
          )
        }>
        <View style={styles.header}>
          <Image source={{uri: item.users_img}} style={styles.imgProfile} />
          <Text style={styles.profileName}>
            {item.users_first_name} {item.users_last_name}
          </Text>
        </View>
      </TouchableOpacity>

      {item.mediaList.length > 0 && (
        <MediaCarouselPost
          images={item.mediaList}
          thumbnails={(() => {
            try {
              return item.feed_thumbnail ? JSON.parse(item.feed_thumbnail) : [];
            } catch {
              return [];
            }
          })()}
          feedId={item.feed_id}
          visibleFeedId={visibleFeedId}
          isScreenFocused={isScreenFocused}
          isModalVisible={isModalVisible}
          setCurrentImages={setCurrentImages}
          setImageIndex={setImageIndex}
          setImageViewVisible={setImageViewVisible}
        />
      )}

      <View style={styles.interactionRow}>
        {/* Like */}
        <TouchableOpacity
          onPress={() => handleClick(item.feed_id)}
          disabled={likeLoading[item.feed_id]}
          style={styles.iconWithCount}>
          <MaterialCommunityIcons
            name="cards-heart-outline"
            size={26}
            color={item.userLiked ? 'red' : 'gray'}
          />
          <Text style={styles.iconCount}>{item.likeCount}</Text>
        </TouchableOpacity>

        {/* Comentarios */}
        <TouchableOpacity
          onPress={() => {
            setCommentFeedId(item.feed_id);
            setModalVisible(true);
          }}
          style={styles.iconWithCount}>
          <MaterialCommunityIcons name="comment" size={26} color="white" />
          <Text style={styles.iconCount}>{item.commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            handleShareProfile(item.feed_id);
          }}
          style={styles.commentContainer}>
          <Ionicons name="share-social-outline" size={30} color="white" />
        </TouchableOpacity>

        {/* Vistas */}
        {item.feed_isVideo === '1' && item.viewsCount !== undefined && (
          <View style={styles.iconWithCount}>
            <MaterialCommunityIcons name="eye" size={26} color="white" />
            <Text style={styles.iconCount}>{item.viewsCount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.profileName}>
        {item.users_first_name} {item.users_last_name}
      </Text>
      <Text
        numberOfLines={expandedDescriptions[item.feed_id] ? undefined : 2}
        style={styles.eventAddress}>
        {item.feed_description}
      </Text>

      {item.feed_description?.length > 50 && (
        <TouchableOpacity onPress={() => toggleDescription(item.feed_id)}>
          <Text style={{color: 'white', fontSize: 12}}>
            Ver {expandedDescriptions[item.feed_id] ? 'menos' : 'más'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.dateText}>
        {moment(item.feed_date_publication).format('D MMMM')}
      </Text>
    </View>
  );

  if (isLoading && !feeds.length) {
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
        <View style={{paddingTop: 20, paddingHorizontal: 10}}>
          <View style={styles.container2}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconContainer}>
              <Ionicons name="arrow-back" size={22} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Publicaciones</Text>
            <View style={{width: 30}} />
          </View>
        </View>
        {isReady && (
          <FlatList
            ref={flatListRef}
            data={parsedUserPosts}
            keyExtractor={item => `${item.feed_id}`}
            renderItem={renderItem}
            initialNumToRender={10}
            windowSize={5}
            initialScrollIndex={selectedIndex}
            getItemLayout={(data, index) => ({
              length: 600,
              offset: 600 * index,
              index,
            })}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            onScrollToIndexFailed={({index}) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  viewPosition: 0.5,
                  animated: false,
                });
              }, 300);
            }}
          />
        )}
      </View>

      {/*     <ImageViewerModal
        visible={isImageViewVisible}
        images={currentImages}
        index={imageIndex}
        onClose={() => setImageViewVisible(false)}
      /> */}

      <Likes
        feedId={currentFeedId}
        isVisible={isModalVisible2}
        feedOwnerId={userFeedId}
        onClose={() => setModalVisible2(false)}
      />

      {isModalVisible && commentFeedId && (
        <CommentItem
          feedId={commentFeedId}
          isVisible={isModalVisible}
          feedOwnerId={
            feeds.find(f => f.feed_id === commentFeedId)?.users_id || null
          }
          onClose={handleCloseModal}
          onCommentAdded={() => fetchFeed()}
          onCommentDeleted={() => fetchFeed()}
          focusCommentId={focusCommentId}
        />
      )}

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
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
  eventAddress: {fontSize: 14, color: 'white', fontFamily: 'Poppins-Regular'},
  dateText: {marginTop: 5, fontSize: 12, color: '#aaa'},
  interactionRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  likeText: {fontSize: 20, marginLeft: 8, color: 'white'},
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
  title: {fontSize: 22, fontFamily: 'Poppins-Bold', color: COLORS.white},
  iconWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 16,
  },
  iconCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Post;
