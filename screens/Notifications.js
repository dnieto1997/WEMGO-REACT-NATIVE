import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getHttps } from '../api/axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import Tab from '../components/Tab';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchNotifications = async (reset = false) => {
    if (loading) return;
    if (!reset && page > totalPages) return;

    if (reset) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoading(true);
    }

    try {
      const response = await getHttps(`notification?page=${reset ? 1 : page}&limit=10`);
      const result = response.data;
      const parsed = result.notifications.map(n => ({
        ...n,
        data: JSON.parse(n.data),
      }));

      if (reset) {
        setNotifications(parsed);
        setTotalPages(result.totalPages);
        setPage(2);
      } else {
        setNotifications(prev => [...prev, ...parsed]);
        setTotalPages(result.totalPages);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => {
    const { type, message, data, created_at, user } = item;

    const goToDestination = () => {
      switch (type) {
        case 'follow_user':
          return navigation.navigate('FriendTimeline', { id: data.follower.id });
        case 'reaction_feed':
        case 'feed_notification':
        case 'mention_feed':
          return navigation.navigate('Post', { id: data.feedId || data.id });
        case 'comment_feed':
          return navigation.navigate('Post', {
            id: data.feedId || data.id,
            commentId: data.commentId,
          });
          case 'invitation_parche':
      return navigation.navigate('DetailsParches', { id: data.parchId });
        default:
          return;
      }
    };

    const getImage = () => {
      if (type === 'comment_feed' || type === 'mention_feed') return user?.img;
      if (type === 'follow_user') return data.follower?.avatar;
      if (type === 'reaction_feed') return data.reactor?.avatar;
      if (type === 'feed_notification') return data.user?.avatar || user?.img;
       if (type === 'invitation_parche') return data.user?.img;
      return null;
    };

    const getMiniFeed = () => {
      if (type === 'comment_feed' || type === 'mention_feed') {
        if (data?.img) {
          try {
            const parsed = JSON.parse(data.img);
            if (Array.isArray(parsed) && parsed[0]) return parsed[0];
          } catch {
            return data.img;
          }
        }
      }

      if (data?.thumbnail) {
        try {
          const parsed = JSON.parse(data.thumbnail);
          if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        } catch {}
      }

      if (data?.images) {
        try {
          const parsed = JSON.parse(data.images);
          if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        } catch {}
      }

      return null;
    };

    const isVerified = ['1', 1, true].includes(
      data?.user?.verificado || data?.user?.checked ||
      data?.follower?.verificado || data?.follower?.checked ||
      data?.reactor?.verificado || data?.reactor?.checked ||
      user?.checked
    );

    return (
      <TouchableOpacity style={styles.card} onPress={goToDestination}>
        {getImage() && <Image source={{ uri: getImage() }} style={styles.avatar} />}
        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={styles.message}>{message}</Text>
            {isVerified && (
              <MaterialIcons
                name="verified"
                size={18}
                color="#3897f0"
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <Text style={styles.date}>{new Date(created_at).toLocaleString()}</Text>
        </View>
        {getMiniFeed() && <Image source={{ uri: getMiniFeed() }} style={styles.feedImage} />}
      </TouchableOpacity>
    );
  };

  return (
  <View style={styles.container}>
   <View style={{top:7,left:10}}>
  <Header title="Notificaciones" /> 
</View>
    <FlatList
      contentContainerStyle={{ paddingTop: 10, paddingBottom: 80 }} // paddingBottom por si el Tab oculta el último ítem
      data={notifications}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      onEndReached={() => fetchNotifications()}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchNotifications(true)}
          colors={['#9b59b6']}
          tintColor="#9b59b6"
        />
      }
      ListFooterComponent={loading && <ActivityIndicator color="#9b59b6" />}
    />
    <View style={{margin:10}}/>
    <Tab />
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feedImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 10,
  },
});

export default Notifications;
