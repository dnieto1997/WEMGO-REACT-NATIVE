import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {COLORS} from '../constants';
import {getHttps} from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DEFAULT_IMAGE =
  'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png';

const Likes = ({feedId, isVisible, feedOwnerId, onClose, isReel}) => {
  const navigation = useNavigation();
  const [peopleLike, setPeopleLikes] = useState([]);
  const [filteredLikes, setFilteredLikes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [DataUser, setDataUser] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isVideo, setIsVideo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      setPeopleLikes([]);
      setFilteredLikes([]);
      setSearchText('');
    }
  }, [isVisible]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        onClose(); // Cierra el modal cuando se navega a otra pantalla
      };
    }, []),
  );

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

  useEffect(() => {
    if (isVisible) {
      fetchLikes();
      loadUserData();
    }
  }, [isVisible]);

  const fetchLikes = async () => {
    try {
      setIsLoading(true);
      console.log(isReel);
      const endpoint = isReel
        ? `reels/likes/${feedId}`
        : `feed/likes/${feedId}`;

      const response = await getHttps(endpoint);
      console.log(response.data);
      const {likes, likeCount, viewsCount, isVideo} = response.data;

      setPeopleLikes(likes);
      setFilteredLikes(likes);
      setLikeCount(likeCount);
      setViewsCount(viewsCount);
      setIsVideo(isVideo);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = text => {
    setSearchText(text);
    const filtered = peopleLike.filter(user =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(text.toLowerCase()),
    );
    setFilteredLikes(filtered);
  };

  const navigateToProfile = userId => {
    onClose();
    if (DataUser.id == userId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('FriendTimeline', {id: userId});
    }
  };

  const handleFollow = async userId => {
    // Cambio optimista en la UI
    setFilteredLikes(prevLikes =>
      prevLikes.map(user =>
        user.id === userId
          ? {...user, follower: user.follower === 1 ? 0 : 1}
          : user,
      ),
    );

    try {
      await getHttps(`followers/toggle/${userId}`);
      fetchLikes();
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
      // Revertir el cambio si hay error
      setFilteredLikes(prevLikes =>
        prevLikes.map(user =>
          user.id === userId
            ? {...user, follower: user.follower === 1 ? 0 : 1}
            : user,
        ),
      );
    }
  };

  const renderItem = ({item}) => {
    const isCurrentUser = DataUser.id === item.id;

    return (
      <View style={styles.listItem}>
        <TouchableOpacity
          style={styles.userInfoContainer}
          onPress={() => navigateToProfile(item.id)}>
          <Image
            source={{uri: item.img || DEFAULT_IMAGE}}
            style={styles.userImage}
          />
          <Text style={styles.userName}>
            {item.first_name} {item.last_name}
          </Text>
        </TouchableOpacity>

        {!isCurrentUser &&
          (item.follower === 1 ? (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() =>
                navigation.navigate('MessageDetails', {id: item.id})
              }>
              <MaterialCommunityIcons
                name="message-text"
                size={18}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Mensaje</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => handleFollow(item.id)}>
              <MaterialCommunityIcons
                name="account-check"
                size={18}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Seguir</Text>
            </TouchableOpacity>
          ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        {isLoading ? (
          <>
            {/* 🔲 Skeleton del título */}
            <View
              style={{
                width: 180,
                height: 24,
                borderRadius: 4,
                backgroundColor: '#555',
                marginBottom: 10,
              }}
            />

            {/* 🔲 Skeleton de estadísticas */}
            <View style={[styles.statsContainer, {gap: 12}]}>
              <View style={[styles.statItem]}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonTextShort} />
              </View>
              <View style={[styles.statItem]}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonTextShort} />
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {isVideo === '1' ? 'Me gusta y reproducciones' : 'Me gusta'}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="favorite-border" size={20} color="white" />
                <Text style={styles.statText}>{likeCount}</Text>
              </View>
              {isVideo === '1' && (
                <View style={styles.statItem}>
                  <MaterialIcons name="visibility" size={20} color="white" />
                  <Text style={styles.statText}>{viewsCount}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* 🔍 Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#ccc"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#ccc"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {isLoading ? (
          <View>
            {[...Array(5)].map((_, index) => (
              <View key={index} style={styles.skeletonItem}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonText} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredLikes}
            keyExtractor={(item, index) => `${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.commentList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Esta publicación no tiene reacciones.
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 2.3,
    backgroundColor: '#333333',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  skeletonAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#555',
    marginRight: 12,
  },
  skeletonText: {
    height: 16,
    width: '60%',
    backgroundColor: '#555',
    borderRadius: 4,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    paddingVertical: 8,
    fontFamily: 'Poppins-Bold',
  },
  commentList: {
    flexGrow: 1,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  followButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },

  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  userImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },

  userName: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  icon: {
    marginRight: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Poppins-Bold',
  },
});

export default Likes;
