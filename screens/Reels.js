// Reels.js corregido y mejorado visualmente
import React, {useCallback, useContext, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Alert,
  Image,
  StyleSheet,
  Share,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getHttps, postHttps} from '../api/axios';
import CommentItem from '../components/CommentItem';
import Likes from '../components/Likes';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../context/SocketContext';
import FastImage from 'react-native-fast-image';
import NeonFrame from '../components/NeonFrame';

const {height, width} = Dimensions.get('window');
const PAGE_SIZE = 5;

const COLORS = {
  primary: '#6c47ff',
  verified: '#3897f0',
  white: '#fff',
  like: '#ff4d6d',
  comment: '#00d9ff',
  background: '#111111',
};

const Reels = ({route, navigation}) => {
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [currentFeedId, setCurrentFeedId] = useState(null);
  const [userFeedId, setUserFeedId] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [videoDuration, setVideoDuration] = useState({});
  const [seekAction, setSeekAction] = useState(null);
  const [pausedVideo, setPausedVideo] = useState({});
  const [showSeekIcons, setShowSeekIcons] = useState({});
  const flatListRef = useRef(null);
  const videoRefs = useRef({});
  const [viewedVideos, setViewedVideos] = useState({});
  const [DataUser, setDataUser] = useState({});
  const [followedIds, setFollowedIds] = useState([]);
  const [isReelModal, setIsReelModal] = useState(false);
  const {sendToggleNotification} = useContext(SocketContext);
  const { id } = route.params || {};


  
  const loadUserData = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) setDataUser(JSON.parse(data));
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed(1);
      loadUserData();
    }, [route.params?.refresh]),
  );

const fetchFeed = async (pageToLoad = 1) => {
  if (isLoading || (!hasMore && pageToLoad !== 1)) return;
  setIsLoading(true);

  try {
    // Construir URL según si llega un ID o no
    const url = id ? `reels/all/${id}?page=${pageToLoad}` : `reels/all?page=${pageToLoad}`;
    const res = await getHttps(url);
    const data = res.data.feeds || res.data;

    // Si no hay más reels
    if (res.data?.statusCode === 409 || data.length === 0) {
      setHasMore(false);
      Alert.alert('Fin de reels', 'Ya no hay más reels para mostrar.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
      return;
    }

    // ✅ Solo filtrar duplicados en páginas siguientes
    const isFirstPage = pageToLoad === 1;
    const uniqueData = isFirstPage
  ? data
  : data.filter(item => !feeds.some(f => f.id === item.id || f.id === id));

    // Si ya no hay suficientes reels en esta página
    if (uniqueData.length < PAGE_SIZE) {
      setHasMore(false);
    }

    // Reemplazar o agregar feeds según la página
    if (isFirstPage) {
      setFeeds(uniqueData);
    } else {
      setFeeds(prev => [...prev, ...uniqueData]);
    }

    setPage(pageToLoad);
  } catch (err) {
    console.error('❌ Error al cargar reels:', err);
  } finally {
    setIsLoading(false);
  }
};

  const handleLikeToggle = async item => {
    const feedId = item.id;
    const isReel = item.isReel === true; // o simplemente const isReel = item.isReel;

    try {
      // Actualizar el estado visual del like en los feeds
      const updatedFeeds = feeds.map(feed => {
        if (feed.id === feedId) {
          const isLiked = !feed.isLiked;
          const likeCount = isLiked
            ? (feed.likeCount || 0) + 1
            : Math.max((feed.likeCount || 1) - 1, 0);
          return {...feed, isLiked, likeCount};
        }
        return feed;
      });

      setFeeds(updatedFeeds);

      // Enviar al backend el like con el campo correcto
      const response = await postHttps('like', {
        [isReel ? 'id_reel' : 'id_feed']: feedId,
        type: isReel ? 'REEL' : 'FEED',
      });

      console.log('Like enviado correctamente:', response.data);
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleShare = async item => {
    try {
      let type = '';
      let id = '';
      let message = '';

      if (item.isReel) {
        type = 'reel';
        id = item.id;
        message = 'Mira esta reel en Wemgo:';
      } else if (!item.isReel) {
        type = 'feed';
        id = item.id;
        message = 'Mira esta publicación en Wemgo:';
      }

      const {data} = await getHttps(`shortlink/generate?type=${type}&id=${id}`);

      await Share.share({
        message: `${message}\n${data.url}`,
      });
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

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

  const handleScroll = event => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.y / height);
    if (newIndex !== currentIndex) {
      // Pausar el video anterior
      setPausedVideo(prev => ({...prev, [currentIndex]: true}));

      // Activar el video actual
      setPausedVideo(prev => ({...prev, [newIndex]: false}));

      setCurrentIndex(newIndex);

      const isNearEnd = newIndex === feeds.length - 2; // en el video 4 de cada grupo de 5
      if (isNearEnd && hasMore && !isLoading) {
        console.log('📦 Precargando siguiente página anticipadamente...');
        fetchFeed(page + 1);
      }
    }
  };

  const handleOpenComments = (feedId, ownerId, isReel) => {
    setCurrentFeedId(feedId);
    setUserFeedId(ownerId);
    setModalVisible(true);
    setIsReelModal(isReel); // Guardamos si es reel o feed
  };

  const handleOpenLikes = (feedId, ownerId, isReel) => {
    setCurrentFeedId(feedId);
    setUserFeedId(ownerId);
    setModalVisible2(true);
    setIsReelModal(isReel);
  };

  const updateFeedCommentsCount = (id, change) => {
    setFeeds(prev =>
      prev.map(feed =>
        feed.id === id
          ? {...feed, commentCount: (feed.commentCount || 0) + change}
          : feed,
      ),
    );
  };

useFocusEffect(
  useCallback(() => {
    // 🔄 Reiniciar estado por completo
    setFeeds([]);
    setPage(1);
    setCurrentIndex(0);
    setHasMore(true);
    setPausedVideo({});
    setVideoProgress({});
    setVideoDuration({});
    setViewedVideos({});
    setSeekAction(null);
    setShowSeekIcons({});
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });

    // ✅ Cargar contenido inicial
    fetchFeed(1);
    loadUserData();

    // ✅ Limpiar el parámetro id para futuras entradas
    navigation.setParams?.({ id: undefined });
  }, [route.params?.id])
);



  const renderItem = ({item, index}) => {
    const isActive = index === currentIndex;

    const handleTouch = e => {
      const touchX = e.nativeEvent.locationX;
      const touchY = e.nativeEvent.locationY;
      const screenWidth = width;
      const screenHeight = height;

      // Definir el rango de los extremos izquierdo y derecho (20% cada uno)
      const leftEdge = screenWidth * 0.2;
      const rightEdge = screenWidth * 0.8;

      // Zonas seguras verticales para evitar conflicto con UI (por ejemplo: botones al centro-derecha o centro-izquierda)
      const safeVerticalTop = screenHeight * 0.3;
      const safeVerticalBottom = screenHeight * 0.7;

      console.log(`👆 Tocando en X=${touchX}, Y=${touchY}`);

      if (
        touchX <= leftEdge &&
        touchY > safeVerticalTop &&
        touchY < safeVerticalBottom
      ) {
        console.log(`⏪ Retroceder en video index ${index}`);
        setSeekAction({index, direction: 'backward'});
        setShowSeekIcons(prev => ({...prev, [index]: 'backward'}));
      } else if (
        touchX >= rightEdge &&
        touchY > safeVerticalTop &&
        touchY < safeVerticalBottom
      ) {
        console.log(`⏩ Adelantar en video index ${index}`);
        setSeekAction({index, direction: 'forward'});
        setShowSeekIcons(prev => ({...prev, [index]: 'forward'}));
      } else {
        console.log(`⏯️ Pausar/Reanudar en index ${index}`);
        setPausedVideo(prev => ({...prev, [index]: !prev[index]}));
      }

      setTimeout(() => {
        setShowSeekIcons(prev => ({...prev, [index]: null}));
      }, 1000);
    };



    return (
      <View style={styles.reelWrapper}>
        <View style={styles.reelBorderContainer}>
          <TouchableOpacity
            style={styles.videoTouchable}
            activeOpacity={1}
            onPress={handleTouch}>
            {isActive ? (
              <Video
                ref={ref => {
                  if (ref) videoRefs.current[index] = ref;
                }}
                source={{
                  uri: item.img,
                  bufferConfig: {
                    minBufferMs: 5000,
                    maxBufferMs: 15000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 3000,
                  },
                }}
                style={styles.video}
                resizeMode="cover"
                paused={index !== currentIndex || pausedVideo[index]}
                repeat
                onLoad={async data => {
                  console.log(
                    `📥 Video ${index} cargado con duración:`,
                    data.duration,
                  );
                  setVideoDuration(prev => ({...prev, [index]: data.duration}));

                  const savedProgress = videoProgress[index];
                  if (
                    videoRefs.current[index]?.seek &&
                    typeof savedProgress === 'number' &&
                    savedProgress > 0
                  ) {
                    videoRefs.current[index].seek(savedProgress);
                  }

                  // 👁️ Registrar vista si aún no se ha hecho
                  if (!viewedVideos[item.id]) {
                    try {
                      await postHttps('video-views', {
                        [item.isReel ? 'reelid' : 'feedid']: item.id,
                        user: DataUser.id,
                      });

                      setViewedVideos(prev => ({...prev, [item.id]: true}));
                    } catch (e) {
                      console.error('❌ Error registrando vista:', e);
                    }
                  }
                }}
                onProgress={progress => {
                  try {
                    setVideoProgress(prev => ({
                      ...prev,
                      [index]: progress.currentTime,
                    }));

                    if (
                      seekAction?.index === index &&
                      typeof videoProgress[index] === 'number' &&
                      typeof videoDuration[index] === 'number'
                    ) {
                      const videoRef = videoRefs.current[index];
                      if (videoRef?.seek) {
                        let seekTime = videoProgress[index];
                        seekTime =
                          seekAction.direction === 'forward'
                            ? Math.min(seekTime + 5, videoDuration[index])
                            : Math.max(seekTime - 5, 0);

                        console.log(
                          `⏩ SEEK ${seekAction.direction} a ${seekTime}s del video ${index}`,
                        );
                        videoRef.seek(seekTime);
                        setSeekAction(null);
                      } else {
                        console.warn(
                          `⚠️ videoRef.seek no disponible para el índice ${index}`,
                        );
                      }
                    }
                  } catch (e) {
                    console.error(
                      `❌ Error en onProgress del video ${index}:`,
                      e,
                    );
                  }
                }}
              />
            ) : (
              <FastImage
                source={{uri: item.thumbnail}}
                style={styles.video}
                resizeMode="cover"
              />
            )}

            {showSeekIcons[index] && (
              <View style={styles.seekIconsWrapper}>
                {showSeekIcons[index] === 'backward' && (
                  <View style={styles.seekIconLeft}>
                    <MaterialIcons name="replay-5" size={48} color="white" />
                  </View>
                )}
                {showSeekIcons[index] === 'forward' && (
                  <View style={styles.seekIconRight}>
                    <MaterialIcons name="forward-5" size={48} color="white" />
                  </View>
                )}
              </View>
            )}

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      videoProgress[index] && videoDuration[index]
                        ? (videoProgress[index] / videoDuration[index]) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.goreelsTitle}>GoReels</Text>
          </View>

          <View style={styles.userInfoContainer}>
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => {
      if (DataUser.id === item.user.id) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('FriendTimeline', { id: item.user.id });
      }
    }}>
    <View style={styles.userRow}>
      <FastImage source={{ uri: item.user?.img }} style={styles.avatar} />

      {/* Contenedor horizontal para nombre, verificado y seguir */}
      <View style={styles.usernameRow}>
        <Text
          numberOfLines={1}
          style={[
            styles.usernameText,
            { maxWidth: 160, flexShrink: 1, color: 'white' },
          ]}>
          {item.user?.username || `${item.user?.first_name}_${item.user?.last_name}`}
        </Text>

        {item.user?.checked === '1' && (
          <MaterialIcons
            name="verified"
            size={16}
            color={COLORS.verified}
            style={styles.verifiedIcon}
          />
        )}

        {item.isFollowing === false &&
          item.user.id !== DataUser.id &&
          !followedIds.includes(item.user.id) && (
            <TouchableOpacity
              onPress={() => handleFollow(item.user.id)}
              style={[
                styles.followIcon,
                { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 3 },
              ]}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 13,
                }}>
                Seguir
              </Text>
            </TouchableOpacity>
          )}
      </View>
    </View>
  </TouchableOpacity>

  {/* Descripción del reel debajo */}
  {item.description ? (
    <Text style={styles.descriptionText}>{item.description}</Text>
  ) : null}
</View>


          <Animated.View
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            style={styles.actionContainer}>
            {/* Like */}
            <View style={styles.actionBlock}>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  handleLikeToggle(item);
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <MaterialIcons
                  name={
                    item.userLiked || item.isLiked
                      ? 'favorite'
                      : 'favorite-border'
                  }
                  size={32}
                  color={COLORS.like}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  handleOpenLikes(item.id, item.user, item.isReel);
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.actionText}>{item.likeCount || 0}</Text>
              </TouchableOpacity>
            </View>

            {/* Comment */}
            <View style={styles.actionBlock}>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  handleOpenComments(item.id, item.user, item.isReel);
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <MaterialIcons
                  name="comment"
                  size={32}
                  color={COLORS.comment}
                />
              </TouchableOpacity>

              <Text style={styles.actionText}>{item.commentCount || 0}</Text>
            </View>

            {/* Share */}
            <View style={styles.actionBlock}>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  handleShare(item); // 👉 crea esta función
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <MaterialIcons
                  name="share"
                  size={30}
                  color={COLORS.share || '#ffffff'}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
        <NeonFrame />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={feeds}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <Image
                source={require('../assets/icons/logo.png')}
                style={styles.loadingLogo}
              />
              <View style={styles.loadingRow}>
                <ActivityIndicator size="large" color={COLORS.white} />
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            </View>
          ) : !hasMore ? (
            <View style={styles.noMoreContainer}>
              <Image
                source={require('../assets/icons/check.png')} // Usa un ícono amigable (puedes usar un ✔ o carita feliz)
                style={styles.noMoreIcon}
              />
              <Text style={styles.noMoreText}>
                ¡Ya has visto todos los Reels!
              </Text>
              <Text style={styles.noMoreSubText}>
                Vuelve más tarde para nuevos contenidos 🔄
              </Text>
            </View>
          ) : null
        }
      />

      <CommentItem
        feedId={currentFeedId}
        isVisible={isModalVisible}
        feedOwnerId={userFeedId}
        onClose={() => setModalVisible(false)}
        onCommentAdded={() => updateFeedCommentsCount(currentFeedId, 1)}
        onCommentDeleted={() => updateFeedCommentsCount(currentFeedId, -1)}
        isReel={isReelModal}
      />

      <Likes
        feedId={currentFeedId}
        isVisible={isModalVisible2}
        feedOwnerId={userFeedId}
        onClose={() => setModalVisible2(false)}
        isReel={isReelModal}
      />
    </View>
  );
};

export default Reels;
const styles = StyleSheet.create({
  reelWrapper: {
    height,
    backgroundColor: COLORS.background,
    position: 'relative',
    zIndex: 1,
    borderColor: 'white',
  },

  reelBorderContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden', // ✅ Aquí sí va
    position: 'relative',
  },

  noMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  noMoreIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  noMoreText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noMoreSubText: {
    fontSize: 14,
    color: COLORS.gray || '#aaa',
    textAlign: 'center',
    marginTop: 5,
  },

  container: {
    flex: 1,
    backgroundColor: 'black', // o tu color de fondo
    position: 'relative', // para que los borders se posicionen correctamente
  },

  videoTouchable: {flex: 1},
  video: {width: '98%', height: '99%'},
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#ffffff40',
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  actionBlock: {
    alignItems: 'center',
    marginBottom: 20, // Espaciado entre cada bloque
  },
  topBar: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
    marginRight: 8,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  goreelsTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    textShadowColor: '#000',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 100,
  },
  userRow: {flexDirection: 'row', alignItems: 'flex-start'},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#9400FF',
    shadowColor: '#9400FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  usernameBlock: {flex: 1, marginLeft: 10, top: 10},
  usernameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: 6,
  top:10,
  left:7
},
  usernameText: {
  fontWeight: 'bold',
  fontSize: 14,
  maxWidth: 160, // o porcentaje ajustable
  flexShrink: 1,
},
  verifiedIcon: {marginLeft: 6},
  descriptionText: {
    color: COLORS.white,
    fontSize: 13,
    marginTop: 4,
    marginRight: 10,
  },
  actionContainer: {
    position: 'absolute',
    right: 10,
    bottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -12}, {translateY: -12}],
  },

  actionText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4, // Cercano al ícono
  },
  footerText: {color: COLORS.white, textAlign: 'center', marginVertical: 20},
  seekIconsWrapper: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  seekIconLeft: {
    position: 'absolute',
    left: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
    padding: 6,
  },
  seekIconRight: {
    position: 'absolute',
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
    padding: 6,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  followIcon: {
    backgroundColor: '#944af5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#944af5',
  },

  loadingLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    color: COLORS.white,
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});
