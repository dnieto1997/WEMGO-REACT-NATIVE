import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MediaCarousel from './MediaCarousel';
import {getHttps, postHttps} from '../api/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width: windowWidth} = Dimensions.get('window');
const ITEM_WIDTH = windowWidth - 40;
const FIXED_HEIGHT = 450;

const FeedCard = React.memo(
  ({
    feed,
    DataUser,
    followedIds,
    navigation,
    handleFollow,
    handleClick,
    toggleOptions,
    showOptionsId,
    setShowOptionsId,
    setFeedToDelete,
    setShowDeleteConfirm,
    feedToDelete,
    showDeleteConfirm,
    likeLoading,
    setCurrentImages,
    setImageIndex,
    setImageViewVisible,
    renderFeedOptions,
    renderMedia,
    setUserFeedId,
    setCurrentFeedId,
    setModalVisible,
    setModalVisible2,
    timeAgo,
    showFullDescription,
    setShowFullDescription,
    visibleFeedId, 
    isScreenFocused,
    isModalVisible
   
  }) => {
    let images = [];
    let thumbnails = [];
    if (feed.feed_img) {
      try {
        images = Array.isArray(feed.feed_img)
          ? feed.feed_img
          : JSON.parse(feed.feed_img);
      } catch (error) {
        images = [];
      }
    }

  
       if (feed.feed_thumbnail) {
      try {
        thumbnails = Array.isArray(feed.feed_thumbnail)
          ? feed.feed_thumbnail
          : JSON.parse(feed.feed_thumbnail);
      } catch (error) {
        thumbnails = [];
      }
    }
  
    const hasSentView = useRef(false);
    const [showToggle, setShowToggle] = useState(false);
   useEffect(() => {
  if (feed.feed_isVideo !== "1" && feed.feed_isVideo !== 1) return;

  const shouldSendView =
    visibleFeedId === feed.feed_id && !hasSentView.current;

  if (shouldSendView) {
    const sendView = async () => {
      try {
      await postHttps('video-views', {
          feedid: feed.feed_id,
          user: DataUser.id,
        });

        hasSentView.current = true;
      } catch (err) {
        console.log(err);
      }
    };

    sendView();
  }

  // Reset si pierde foco para permitir nuevo envío
  if (visibleFeedId !== feed.feed_id) {
    hasSentView.current = false;
  }
}, [visibleFeedId, feed.feed_id, DataUser.id, feed.isVideo]);

    const handleShareProfile = async () => {
      try {
        const {data} = await getHttps(
          `shortlink/generate?type=feed&id=${feed.feed_id}`,
        );

        await Share.share({
          message: `Mira esta Publicacion en Wemgo:\n${data.url}`,
        });
      } catch (err) {
        console.error('Error al compartir perfil:', err);
      }
    };

    return (
      <View style={styles.feedContainer}>
        {/* Perfil */}
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={() => {
              if (DataUser.id == feed.userId) navigation.navigate('Profile');
              else navigation.navigate('FriendTimeline', {id: feed.userId});
            }}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <FastImage
              source={{
                uri:
                  feed.users_img ||
                  'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
              }}
              style={styles.imgProfile}
            />
            <View style={styles.profileHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.profileName}>
                  {feed.users_first_name
                    ? `${feed.users_first_name} ${feed.users_last_name}`
                    : 'Anónimo'}
                </Text>
                {feed.users_checked === '1' || feed.users_checked === 1 ? (
                  <MaterialIcons
                    name="verified"
                    size={18}
                    color="#3897f0"
                    style={{marginLeft: 6}}
                  />
                ) : null}
              </View>
            </View>
          </TouchableOpacity>

          {feed.userId !== DataUser.id &&
            feed.isFollowing === 0 &&
            !followedIds.includes(feed.userId) && (
              <TouchableOpacity
                onPress={() => handleFollow(feed.userId)}
                style={styles.followIcon}>
                <Text style={{color: 'white', fontFamily: 'Poppins-Bold'}}>
                  {' '}
                  Seguir{' '}
                </Text>
              </TouchableOpacity>
            )}
        </View>

        {/* Media */}
        <View style={{flexDirection: 'row'}}>
          
          <View style={styles.imageContainer}>
            <MediaCarousel
              images={images}
              thumbnails={thumbnails}
              feedId={feed.feed_id}
              visibleFeedId={visibleFeedId}
              isScreenFocused={isScreenFocused} // o pásalo desde props
              setCurrentImages={setCurrentImages}
              setImageIndex={setImageIndex}
              setImageViewVisible={setImageViewVisible}
                isModalVisible={isModalVisible}
             
            />
          </View>
        </View>

        {/* Interacciones */}
        <View style={styles.interactionContainer}>
          <TouchableOpacity
            onPress={() => handleClick(feed.feed_id)}
            disabled={likeLoading[feed.feed_id]}
            style={styles.likeContainer}>
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
              <Text style={styles.likeText}>{feed.likeCount} </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setUserFeedId(feed.userId);
              setCurrentFeedId(feed.feed_id);
              setModalVisible(true);
            }}
            style={styles.commentContainer}>
            <MaterialCommunityIcons name="comment" size={30} color="white" />
            <Text style={styles.commentText}>{feed.commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleShareProfile();
            }}
            style={styles.commentContainer}>
            <Ionicons name="share-social-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Descripción */}
      <View style={styles.descriptionContainer}>
  <TouchableOpacity
    onPress={() => {
      if (DataUser.id === feed.userId) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('FriendTimeline', {id: feed.userId});
      }
    }}>
    <Text
      style={[styles.profileName, {flexWrap: 'wrap'}]}
      numberOfLines={1}
      ellipsizeMode="tail">
      {feed.users_first_name
        ? `${feed.users_first_name} ${feed.users_last_name}`
        : 'Anónimo'}
    </Text>
  </TouchableOpacity>

  <Text
    style={[styles.eventAddress, {flexWrap: 'wrap'}]}
    numberOfLines={showFullDescription ? undefined : 2}
    ellipsizeMode="tail"
    onTextLayout={(e) => {
      // Detecta si el texto se corta en más de 2 líneas
      if (e.nativeEvent.lines.length > 2 && !showToggle) {
        setShowToggle(true);
      }
    }}>
    {feed.feed_description}
  </Text>

  {showToggle && (
    <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
      <Text style={styles.toggleText}>
        {showFullDescription ? 'Ver menos' : 'Ver más'}
      </Text>
    </TouchableOpacity>
  )}

  <Text style={styles.timeAgoText}>
    {feed.feed_date_publication ? timeAgo(feed.feed_date_publication) : ''}
  </Text>
</View>


        <View style={styles.separator} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  feedContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 12,
    marginBottom: 40,
    marginHorizontal: 12,
  },
  followIcon: {
    padding: 6,
    backgroundColor: '#944af5',
    borderRadius: 5,
  },
  profileContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  imgProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#3897f0',
    borderRadius: 6,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
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
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: '50%',
    top: '10%',
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  interactionContainer: {
    top: 10,
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    gap: 20,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontSize: 17,
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  commentText: {
    fontSize: 17,
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  descriptionContainer: {
    width: '100%',
    flexDirection: 'column',
    paddingHorizontal: 10,
    top: 13,
  },
  eventAddress: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-Regular',
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Poppins-Bold',
  },
  timeAgoText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 10,
    width: '100%',
    top: 10,
  },
});

export default FeedCard;
