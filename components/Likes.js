import React, { useState, useEffect, useContext } from 'react';
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
import { COLORS } from '../constants';
import { getHttps } from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const DEFAULT_IMAGE = 'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png';

const Likes = ({ feedId, isVisible, feedOwnerId, onClose }) => {
  const navigation = useNavigation();
  const [peopleLike, setPeopleLikes] = useState([]);
  const [filteredLikes, setFilteredLikes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [DataUser, setDataUser] = useState({});
   const [isFollowing, setIsFollowing] = useState(false);
  

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        onClose(); // Cierra el modal cuando se navega a otra pantalla
      };
    }, [])
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
      const response = await getHttps(`feed/likes/${feedId}`);
      setPeopleLikes(response.data);
      setFilteredLikes(response.data); // inicial
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = peopleLike.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredLikes(filtered);
  };

  const navigateToProfile = (userId) => {
    onClose();
    if (DataUser.id == userId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('FriendTimeline', { id: userId });
    }
  };

const handleFollow = async (userId) => {
  // Cambio optimista en la UI
  setFilteredLikes(prevLikes =>
    prevLikes.map(user =>
      user.id === userId
        ? { ...user, follower: user.follower === 1 ? 0 : 1 }
        : user
    )
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
          ? { ...user, follower: user.follower === 1 ? 0 : 1 }
          : user
      )
    );
  }
};



 const renderItem = ({ item }) => {
  const isCurrentUser = DataUser.id === item.id;

  return (
    <View style={styles.listItem}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => navigateToProfile(item.id)}
      >
        <Image
          source={{ uri: item.img || DEFAULT_IMAGE }}
          style={styles.userImage}
        />
        <Text style={styles.userName}>
          {item.first_name} {item.last_name}
        </Text>
      </TouchableOpacity>

{!isCurrentUser && (
  item.follower === 1 ? (
    <TouchableOpacity
      style={styles.messageButton}
      onPress={() => navigation.navigate('MessageDetails', { id: item.id })}
    >
      <MaterialCommunityIcons name="message-text" size={18} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Mensaje</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.followButton}
      onPress={() => handleFollow(item.id)}
    >
      <MaterialCommunityIcons name="account-check" size={18} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Seguir</Text>
    </TouchableOpacity>
  )
)}

    </View>
  );
};


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Me gusta</Text>
   <View style={styles.searchContainer}>
  <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
  <TextInput
    style={styles.searchInput}
    placeholder="Buscar..."
    placeholderTextColor="#ccc"
    value={searchText}
    onChangeText={handleSearch}
  />
</View>
        <FlatList
          data={filteredLikes}
          keyExtractor={(item, index) => `${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.commentList}
            ListEmptyComponent={
    <Text style={styles.emptyText}>Esta publicación no tiene reacciones.</Text>
  }
        />
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
