import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../context/SocketContext';
import {getHttps} from '../api/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HeaderSinlogo = ({ onRefresh}) => {
  const navigation = useNavigation();
  const [DataUser, setDataUser] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCountNotifications, setUnreadCountNotifications] = useState(0);
  const {socket} = useContext(SocketContext);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);

        setDataUser(parsedData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  const fetchUnreadNotificacionts = async () => {
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
      fetchUnreadNotificacionts(); // ✅ esta es la importante
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
      fetchUnreadNotificacionts();
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    fetchUnreadConversations();
    fetchUnreadNotificacionts();
  }, [onRefresh]);

  return (
    <View style={styles.container}>
       <View style={styles.container2}>
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
               <Ionicons name="arrow-back" size={22} color={COLORS.black} />
             </TouchableOpacity>
           
           </View>

      <View>
        <View style={{flexDirection: 'row', gap: 5, right: 12}}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate('Notifications', {id: DataUser.id})
            }>
            <MaterialCommunityIcons name="bell" color={'white'} size={30} />
            {unreadCountNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCountNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Message')}
            style={styles.iconButton}>
            <MaterialCommunityIcons
              name="message-text"
              color={'white'}
              size={30}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
                 
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
   container2: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',left:10},
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
  logo: {
    width: 120,
    height: 40,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
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
});
export default HeaderSinlogo;
