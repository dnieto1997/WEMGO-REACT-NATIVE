// FriendTimeline.js final ensamblado y optimizado
import React, { useContext, useEffect, useState } from 'react';
import { View, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHttps } from '../api/axios';
import { SocketContext } from '../context/SocketContext';
import Tab from '../components/Tab';
import HeaderProfile from '../components/HeaderProfile';
import FeedGallery from '../components/FeedGallery';
import ProfileModal from '../components/ProfileModal';
import DescriptionModal from '../components/DescriptionModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FriendTimeline = ({ navigation, route }) => {
  const { id } = route.params;
  const { socket, sendToggleNotification } = useContext(SocketContext);
  const [user, setUser] = useState({});
  const [feed, setFeed] = useState([]);
  const [DataUser, setDataUser] = useState({});
  const [Followers, setFollowers] = useState(0);
  const [Following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshHeader, setRefreshHeader] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const triggerHeaderRefresh = () => {
      setRefreshHeader(prev => prev + 1); // Forzar refresh
    };

    socket.on('receiveMessage', triggerHeaderRefresh);
    socket.on('newComment', triggerHeaderRefresh);
    socket.on('newFollow', triggerHeaderRefresh);
    socket.on('sendInvitation', triggerHeaderRefresh);
    socket.on('newFeed', triggerHeaderRefresh);
    socket.on('newReaction', triggerHeaderRefresh);

    return () => {
      socket.off('receiveMessage', triggerHeaderRefresh);
      socket.off('newComment', triggerHeaderRefresh);
      socket.off('newFollow', triggerHeaderRefresh);
      socket.off('sendInvitation', triggerHeaderRefresh);
      socket.off('newFeed', triggerHeaderRefresh);
      socket.off('newReaction', triggerHeaderRefresh);
    };
  }, [socket]);

  const handleShareProfile = async () => {
    try {
      const { data } = await getHttps(`shortlink/generate?type=profile&id=${id}`);
      await Share.share({
        message: `Mira este perfil en Wemgo:\n${data.url}`,
      });
    } catch (err) {
      console.error('Error al compartir perfil:', err);
    }
  };
  const handleFollow = async () => {
    try {
      const response = await getHttps(`followers/toggle/${id}`);
      const isNowFollowing = response.data.siguiendo;
      setIsFollowing(isNowFollowing);
      setFollowers(prev => (isNowFollowing ? prev + 1 : prev - 1));
      if (isNowFollowing) {
        sendToggleNotification?.({ followerId: DataUser.id, followedId: id });
      }
    } catch (error) {
      console.error('Error toggle follow:', error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [userRes, followRes, feedRes, statusRes] = await Promise.all([
          getHttps(`users/${id}`),
          getHttps(`followers/${id}`),
          getHttps(`feed/search/${id}`),
          getHttps(`followers/status/${id}`),
        ]);
        console.log(feedRes.data.length);
        setUser(userRes.data);
        setFollowers(followRes.data.followers);
        setFollowing(followRes.data.following);
        setFeed(feedRes.data);
        setIsFollowing(statusRes.data.siguiendo);

        const data = await AsyncStorage.getItem('userData');
        if (data) setDataUser(JSON.parse(data));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadAllData();
  }, [id]);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#200f39', paddingTop: insets.top }}>
      <HeaderProfile
        user={user}
        isFollowing={isFollowing}
        Followers={Followers}
        Following={Following}
        countFeed={feed.length}
        onFollow={handleFollow}
        onOpenImage={() => setModalVisible(true)}
        navigation={navigation}
        userId={id}
        onRefresh={refreshHeader}
        onShare={handleShareProfile}
      />

      <FeedGallery feed={feed} userId={id} />

      <Tab />

      <ProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        image={user.img}
      />

      <DescriptionModal
        visible={showFullDescription}
        onClose={() => setShowFullDescription(false)}
        description={user.description}
      />
    </View>
  );
};

export default FriendTimeline;
