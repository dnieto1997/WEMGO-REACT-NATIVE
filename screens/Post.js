// Archivo: PostOptimized.js
import React, { useEffect, useState, useContext, useCallback, useRef, useMemo } from 'react';
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
import { getHttps, postHttps } from '../api/axios';
import { SocketContext } from '../context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommentItem from '../components/CommentItem';
import Header from '../components/Header';
import ImageViewerModal from '../components/ModalImage';
import Likes from '../components/Likes';
import Tab from '../components/Tab';
import MediaCarousel from '../components/MediaCarousel';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants';

const ITEM_WIDTH = Dimensions.get('window').width - 40;
const FIXED_IMAGE_HEIGHT = 422;

const Post = ({ navigation, route }) => {
  const { id } = route.params;
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [DataUser, setDataUser] = useState({});
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

  const { listenForReactions, sendReactionNotification } = useContext(SocketContext);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) setDataUser(JSON.parse(data));
    };
    loadUserData();
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [id]);

  useEffect(() => {
    const unsubscribe = listenForReactions(() => fetchFeed(1));
    return () => unsubscribe && unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) fetchFeed(1);
    }, [route.params?.refresh])
  );

const fetchFeed = async (newPage = 1, silent = false) => {
  if ((isLoading || isLoadingMore || !hasMore) && !silent) return;

  if (!silent) {
    newPage === 1 ? setIsLoading(true) : setIsLoadingMore(true);
  }

  try {
    const response = await getHttps(`feed/${id}?page=${newPage}&limit=5`);
    const data = response.data;

    setHasMore(data.length >= 5);
    setPage(newPage);

    if (isModalVisible) {
      // Espera para actualizar hasta que el modal se cierre
      setPendingFeeds(newPage === 1 ? data : [...feeds, ...data]);
    } else {
      // Actualiza directamente si no hay modal
      setFeeds(prev => (newPage === 1 ? data : [...prev, ...data]));
    }
  } catch (error) {
    if (error.status === 401) navigation.navigate('Login');
  } finally {
    if (!silent) {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }
};

const handleCloseModal = () => {
  setModalVisible(false);
  if (pendingFeeds) {
    setFeeds(pendingFeeds);
    setPendingFeeds(null);
  }
};

const handleClick = useCallback(async idFeed => {
  if (likeLoading[idFeed]) return;

  const index = feeds.findIndex(f => f.feed_id === idFeed);
  if (index === -1) return;

  const updated = [...feeds];
  const currentFeed = updated[index];
  const wasLiked = currentFeed.userLiked;

  // 🔢 Asegurarse de que likeCount es un número
  const likeCountNumber = parseInt(currentFeed.likeCount || '0', 10);

  // ✅ Aplicar cambio optimista con suma segura
  updated[index] = {
    ...currentFeed,
    userLiked: !wasLiked,
    likeCount: wasLiked
      ? Math.max(0, likeCountNumber - 1)
      : likeCountNumber + 1,
  };
  setFeeds(updated);
  setLikeLoading(prev => ({ ...prev, [idFeed]: true }));

  try {
    await postHttps('like', { id_feed: idFeed, type: 'FEED' });

    // Solo enviar notificación si fue un "like"
    if (!wasLiked) {
      sendReactionNotification({
        feedId: idFeed,
        reactorId: DataUser.id,
        reactionType: '❤️',
      });
    }
  } catch (err) {
    // ❌ Revertir en caso de error
    updated[index] = {
      ...currentFeed,
      userLiked: wasLiked,
      likeCount: likeCountNumber,
    };
    setFeeds(updated);
    console.error('Error al dar like:', err);
  } finally {
    setLikeLoading(prev => ({ ...prev, [idFeed]: false }));
  }
}, [feeds, likeLoading, DataUser.id]);


  const parsedUserPosts = useMemo(() => {
    return feeds.map(post => {
      let mediaList = [];
      try {
        mediaList = post.feed_img ? JSON.parse(post.feed_img) : [];
      } catch {}
      return { ...post, mediaList };
    });
  }, [feeds]);

  const toggleDescription = feedId => {
    setExpandedDescriptions(prev => ({ ...prev, [feedId]: !prev[feedId] }));
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0];
      setVisibleFeedId(firstVisibleItem.item.feed_id);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity onPress={() => navigation.navigate(DataUser.id === item.userId ? 'Profile' : 'FriendTimeline', { id: item.userId })}>
        <View style={styles.header}>
          <Image source={{ uri: item.users_img }} style={styles.imgProfile} />
          <Text style={styles.profileName}>{item.users_first_name} {item.users_last_name}</Text>
        </View>
      </TouchableOpacity>

      {item.mediaList.length > 0 && (
        <MediaCarousel
          images={item.mediaList}
          feedId={item.feed_id}
          visibleFeedId={visibleFeedId}
          isScreenFocused={true}
          setCurrentImages={setCurrentImages}
          setImageIndex={setImageIndex}
          setImageViewVisible={setImageViewVisible}
        />
      )}

   

      <View style={styles.interactionRow}>
        <TouchableOpacity onPress={() => handleClick(item.feed_id)} disabled={likeLoading[item.feed_id]}>
          <MaterialCommunityIcons name="cards-heart-outline" size={30} color={item.userLiked ? 'red' : 'gray'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setUserFeedId(item.userId);
          setCurrentFeedId(item.feed_id);
          setModalVisible2(true);
        }}>
          <Text style={styles.likeText}>{item.likeCount}</Text>
        </TouchableOpacity>
  <TouchableOpacity
  onPress={() => {
    setCommentFeedId(item.feed_id);
    setModalVisible(true);
  }}
  style={styles.iconWithCount}>
  <MaterialCommunityIcons name="comment" size={26} color="white" />
  <Text style={styles.iconCount}>{item.commentCount}</Text>
</TouchableOpacity>
      </View>

      <Text style={styles.profileName}>{item.users_first_name} {item.users_last_name}</Text>
      <Text numberOfLines={expandedDescriptions[item.feed_id] ? undefined : 2} style={styles.eventAddress}>{item.feed_description}</Text>

      {item.feed_description?.length > 50 && (
        <TouchableOpacity onPress={() => toggleDescription(item.feed_id)}>
          <Text style={{ color: 'white', fontSize: 12 }}>Ver {expandedDescriptions[item.feed_id] ? 'menos' : 'más'}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.dateText}>{moment(item.feed_date_publication).format('D MMMM')}</Text>
    </View>
  );

if (isLoading && page === 1 && !isModalVisible) {
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
          onEndReached={() => fetchFeed(page + 1)}
          onEndReachedThreshold={0.5}
          windowSize={5}
          maxToRenderPerBatch={5}
          initialNumToRender={3}
          removeClippedSubviews
          updateCellsBatchingPeriod={50}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          ListHeaderComponent={
            <View style={{ top: 20, left: 10 }}>
              <View style={styles.container2}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Event')}
                  style={styles.iconContainer}>
                  <Ionicons name="arrow-back" size={22} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.title}>Publicaciones</Text>
                <TouchableOpacity onPress={() => {}} />
              </View>
            </View>
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
   {isModalVisible && commentFeedId && (
  <CommentItem
    feedId={commentFeedId}
    isVisible={isModalVisible}
    feedOwnerId={
      feeds.find(f => f.feed_id === commentFeedId)?.users_id || null
    }
    onClose={handleCloseModal}
    onCommentAdded={() => fetchFeed(1, true)}
    onCommentDeleted={() => fetchFeed(1, true)}
    focusCommentId={focusCommentId}
  />
)}

      <Tab />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: 'black' },
  container: { flex: 1, backgroundColor: 'black', marginBottom: 100 },
  postContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', top: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  loadingText: { marginTop: 12, fontSize: 16, color: 'white', textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  imgProfile: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  profileName: { fontWeight: 'bold', fontSize: 16, color: 'white' },
  eventAddress: { fontSize: 14, color: 'white', fontFamily: 'Poppins-Regular' },
  dateText: { marginTop: 5, fontSize: 12, color: '#aaa' },
  interactionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  likeText: { fontSize: 20, marginLeft: 8, color: 'white' },
  container2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconContainer: { height: 30, width: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: COLORS.white },
  title: { fontSize: 22, fontFamily: 'Poppins-Bold', color: COLORS.white },
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
