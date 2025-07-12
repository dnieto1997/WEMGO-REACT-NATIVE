import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {getHttps, postHttps, deleteHttps} from '../api/axios';
import {SocketContext} from '../context/SocketContext';
import HeaderHome from '../components/HeaderHome';
import StoriesList from '../components/StoriesList';
import CommentItem from '../components/CommentItem';
import Likes from '../components/Likes';
import FeedCard from '../components/FeedCard';
import {COLORS} from '../constants';
import EventCard from '../components/EventCard';
import UserGreetingCard from '../components/UserGreetingCard';
import Adds from '../components/Adds';
import ImageViewerModal from '../components/ModalImage';

const HomeV1 = ({navigation, route}) => {
  const [feeds, setFeeds] = useState([]);
  const [stories, setStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [currentFeedId, setCurrentFeedId] = useState(null);
  const [userFeedId, setUserFeedId] = useState(null);
  const [DataUser, setDataUser] = useState({});
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState(null);
  const [likeLoading, setLikeLoading] = useState({});
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFeeds, setHasMoreFeeds] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [visibleFeedId, setVisibleFeedId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followedIds, setFollowedIds] = useState([]);
  const flatListRef = useRef(null);
  const [ads, setAds] = useState(null);
  const {socket, sendReactionNotification, sendToggleNotification} =
    useContext(SocketContext);
  const [unreadCountNotifications, setUnreadCountNotifications] = useState(0);

  useEffect(() => {
    if (route?.params?.refresh) {
      fetchFeeds();
      fetchStories();
      if (flatListRef.current)
        flatListRef.current.scrollToOffset({offset: 0, animated: true});
      navigation.setParams({refresh: undefined});
    }
  }, [route?.params?.refresh]);

  const loadUserData = useCallback(async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) setDataUser(JSON.parse(data));
  }, []);

  const fetchFeeds = useCallback(
    async (newPage = 1) => {
      try {
        const {data: feedsData} = await getHttps(
          `feed?page=${newPage}&limit=5`,
        );

  
        const feedsArray = Array.isArray(feedsData) ? feedsData : [];

        let combined = [...feedsArray];

        if (feedsArray.length > 0) {
          const {data: adsData} = await getHttps(`event/publicidad`);
          if (Array.isArray(adsData) && adsData.length > 0) {
            const ad = {...adsData[0], isAd: true};
            try {
              const parsedImg = JSON.parse(ad.img || '[]');
              if (
                Array.isArray(parsedImg) &&
                parsedImg.length > 0 &&
                parsedImg[0]
              ) {
                combined.push(ad);
              }
            } catch (e) {
              console.warn('Publicidad inválida:', e);
            }
          }
        }

        if (newPage === 1) {
          setFeeds(combined);
        } else {
          setFeeds(prev => [...prev, ...combined]);
        }

        return feedsArray.length;
      } catch (err) {
        console.error('Error al cargar feeds o publicidad:', err);
        if (err?.response?.status === 401) navigation.navigate('Login');
        return 0;
      } finally {
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [navigation],
  );

  const fetchAds = useCallback(async () => {
    try {
      const {data: adsData} = await getHttps(`event/publicidad`);
      

      if (Array.isArray(adsData) && adsData.length > 0) {
        const ad = {...adsData[0], isAd: true};
        setAds(ad);
      } else {
        setAds(null);
      }
    } catch (err) {
      console.error('Error al cargar publicidad:', err);
    }
  }, []);

const fetchStories = useCallback(async () => {
  if (!DataUser.id) return;
  try {
    const response = await getHttps(`stories/findHome/${DataUser.id}`);
    const storiesData = Array.isArray(response.data) ? response.data : [];

    // 🔁 Ordenar: los no vistos primero (viewAllStories: false), luego los vistos
    const sortedStories = storiesData.sort((a, b) => {
      if (a.viewAllStories === b.viewAllStories) return 0;
      return a.viewAllStories ? 1 : -1;
    });

    // 👉 Mapear con estructura deseada
    const formattedStories = sortedStories.map(userItem => ({
      user: userItem.user,
      viewAllStories: userItem.viewAllStories,
      stories: userItem.stories.map(story => ({
        ...story,
        storyUrl: userItem.user?.img,
        isLoading: false,
      })),
    }));

    setStories(formattedStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}, [DataUser.id]);



  const handleFollow = async id => {
    try {
      const response = await getHttps(`followers/toggle/${id}`);
      if (response.data.siguiendo) {
        setFollowedIds(prev => [...prev, id]);
        sendToggleNotification?.({followerId: DataUser.id, followedId: id});
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleClick = async idFeed => {
    if (likeLoading[idFeed]) return;
    const index = feeds.findIndex(feed => feed.feed_id === idFeed);
    if (index === -1) return;
    const updatedFeeds = [...feeds];
    const currentFeed = updatedFeeds[index];
    const wasLiked = currentFeed.userLiked;
    updatedFeeds[index] = {
      ...currentFeed,
      userLiked: !wasLiked,
      likeCount: wasLiked
        ? Math.max(0, parseInt(currentFeed.likeCount || 0) - 1)
        : parseInt(currentFeed.likeCount || 0) + 1,
    };
    setFeeds(updatedFeeds);
    setLikeLoading(prev => ({...prev, [idFeed]: true}));

    try {
      const response = await postHttps('like', {id_feed: idFeed, type: 'FEED'});
      if (response?.data?.data.status === '1') {
        sendReactionNotification?.({
          feedId: idFeed,
          reactorId: DataUser.id,
          reactionType: '❤️',
        });
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    } finally {
      setLikeLoading(prev => ({...prev, [idFeed]: false}));
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

  const fetchUnreadNotifications = async () => {
    try {
      const {data} = await getHttps('notification/isRead');

      setUnreadCountNotifications(data);
    } catch (error) {
      console.error('Error fetching unread conversations:', error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const consumeNotificationApi = () => {
      fetchUnreadNotifications(); // ✅ esta es la importante
    };

    socket.on('newCommentEvent', consumeNotificationApi);
    socket.on('newComment', consumeNotificationApi);
    socket.on('newFollow', consumeNotificationApi);
    socket.on('sendInvitation', consumeNotificationApi);
    socket.on('newFeed', consumeNotificationApi);
    socket.on('newReactionStory', consumeNotificationApi);
    socket.on('newReaction', consumeNotificationApi);

    return () => {
      socket.off('newCommentEvent', consumeNotificationApi);
      socket.off('newComment', consumeNotificationApi);
      socket.off('newFollow', consumeNotificationApi);
      socket.off('sendInvitation', consumeNotificationApi);
      socket.off('newFeed', consumeNotificationApi);
      socket.off('newReactionStory', consumeNotificationApi);
      socket.off('newReaction', consumeNotificationApi);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = () => {
      fetchUnreadConversations();
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMoreFeeds(true);
    await fetchFeeds(1);
    await fetchStories();
    await fetchAds();
    await fetchUnreadConversations();
    await fetchUnreadNotifications();
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || refreshing || !hasMoreFeeds) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const count = await fetchFeeds(nextPage);
    if (count > 0) {
      setPage(nextPage);
    }
    if (count < 5) {
      setHasMoreFeeds(false);
    }
  };
  const handleDelete = async () => {
    if (!feedToDelete) return;
    try {
      await deleteHttps(`feed/${feedToDelete}`);
      setFeeds(feeds.filter(f => f.feed_id !== feedToDelete));
      setShowDeleteConfirm(false);
      setFeedToDelete(null);
      setShowOptionsId(null);
    } catch (error) {
      console.error('Error deleting feed:', error);
    }
  };

  const toggleOptions = feedId => {
    setShowOptionsId(prev => (prev === feedId ? null : feedId));
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

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setVisibleFeedId(viewableItems[0].item.feed_id);
    }
  }).current;

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchFeeds();
      fetchStories();
      fetchAds(); // ← siempre se actualiza la publicidad
      fetchUnreadConversations();
      fetchUnreadNotifications();
    }, [loadUserData, fetchFeeds, fetchStories, fetchAds]),
  );
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      <FlatList
        ref={flatListRef}
        data={feeds}
        keyExtractor={(item, index) => {
          const baseId = item.feed_id ?? item.id ?? `unknown-${index}`;
          const type = item.feed_id ? 'feed' : item.id ? 'event' : 'unknown';
          return `${type}-${baseId}-${index}`;
        }}
        renderItem={({item}) =>
          item.isAd ? (
            <EventCard event={item} navigation={navigation} />
          ) : (
            <FeedCard
              feed={item}
              DataUser={DataUser}
              followedIds={followedIds}
              navigation={navigation}
              handleFollow={handleFollow}
              handleClick={handleClick}
              toggleOptions={toggleOptions}
              showOptionsId={showOptionsId}
              setShowOptionsId={setShowOptionsId}
              setFeedToDelete={setFeedToDelete}
              setShowDeleteConfirm={setShowDeleteConfirm}
              feedToDelete={feedToDelete}
              showDeleteConfirm={showDeleteConfirm}
              likeLoading={likeLoading}
              setCurrentImages={setCurrentImages}
              setImageIndex={setImageIndex}
              setImageViewVisible={setImageViewVisible}
              setUserFeedId={setUserFeedId}
              setCurrentFeedId={setCurrentFeedId}
              setModalVisible={setModalVisible}
              setModalVisible2={setModalVisible2}
              timeAgo={timeAgo}
              showFullDescription={showFullDescription}
              setShowFullDescription={setShowFullDescription}
              visibleFeedId={visibleFeedId}
              isScreenFocused={true}
              isModalVisible={isImageViewVisible}
            />
          )
        }
        ListHeaderComponent={() => (
          <>
            <HeaderHome
              navigation={navigation}
              unreadCount={unreadCount}
              unreadCountNotifications={unreadCountNotifications}
              DataUser={DataUser}
            />

            <UserGreetingCard DataUser={DataUser} navigation={navigation} />
            <View style={styles.viewhistory}>
              <Text style={styles.history}>Historias</Text>
            </View>

            <StoriesList
              stories={stories}
              navigation={navigation}
              DataUser={DataUser}
              User={{}}
            />

            {ads && <Adds event={ads} navigation={navigation} />}

            <Text style={styles.viewhistory}>
              <Text style={styles.history}>Lo que está pasando hoy</Text>
            </Text>
          </>
        )}
        ListEmptyComponent={() =>
          !refreshing && (
            <View style={{padding: 20, alignItems: 'center'}}>
              <Text style={{color: '#888'}}>
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{itemVisiblePercentThreshold: 50}}
        ListFooterComponent={() =>
          isLoadingMore && (
            <View style={{padding: 20, alignItems: 'center'}}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          )
        }
      />

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

{/*     <ImageViewerModal
        visible={isImageViewVisible}
        images={currentImages}
        index={imageIndex}
        onClose={() => setImageViewVisible(false)}
      />  */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  history: {color: 'white', fontFamily: 'Poppins-Bold', fontSize: 20},
  viewhistory: {left: 30},
});

export default HomeV1;
