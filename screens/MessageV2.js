import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES} from '../constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getHttps, patchHttps} from '../api/axios';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../context/SocketContext';
import Tab from '../components/Tab';
import Header from '../components/Header';

const MessageV2 = ({navigation}) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [DataUser, setDataUser] = useState({});
  const {refreshChats, onlineUsers} = useContext(SocketContext);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);


  useEffect(() => {
    fetchUsers();
  }, [onlineUsers]);
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setDataUser(parsedData);
          fetchSuggestions(parsedData.id);
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [refreshChats]);

  const navigateToProfile = userId => {
    if (DataUser.id == userId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('FriendTimeline', {id: userId});
    }
  };

  const fetchSuggestions = async userId => {
    try {
      const response = await getHttps(`followers/followers/${userId}`);

      setSuggestions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async (reset = false) => {
    let nextPage = reset ? 1 : page;
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    if (!hasMore && !reset) return;

    setRefreshing(true);
    try {
      const response = await getHttps(`chat?page=${nextPage}&limit=${50}`);

      const formattedUsers = response.data.map(user => {
        let lastMessage = '';
        let lastMessageTime = '';
        let lastMessageDate = '';
        if (user.lastMessage && user.lastMessage.timestamp) {
          const dateObj = new Date(user.lastMessage.timestamp);
          lastMessage = user.lastMessage.content || '';
          lastMessageTime = dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          lastMessageDate = dateObj.toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
        return {
          id: user.id,
          fullName: user.fullName,
          messageInQueue:
            user.id === DataUser.id ? 0 : user.unreadMessages || 0,
          userImg:
            user.img ||
            'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
          isOnline: onlineUsers.some(onlineUser => onlineUser.id == user.id),
          lastMessage,
          lastMessageTime,
          lastMessageDate,
        };
      });

      const combined = reset ? formattedUsers : [...users, ...formattedUsers];
      const unique = combined.filter(
        (user, index, self) => index === self.findIndex(u => u.id === user.id),
      );

      setUsers(unique);
      setFilteredUsers(unique);

      if (formattedUsers.length < limit) {
        setHasMore(false);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleSearch = async text => {
    setQuery(text);

    if (text.length > 2) {
      try {
        const response = await getHttps(`users/search/${text}`);
        const formattedResults = response.data.map(user => ({
          id: user.id,
          fullName: `${user.first_name} ${user.last_name}`,
          lastMessage: '',
          lastMessageTime: '',
          messageInQueue: 0,
          userImg:
            user.img ||
            'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
        }));

        setFilteredUsers(formattedResults);
      } catch (error) {
        console.log(error);
      }
    } else {
      setFilteredUsers(users);
    }
  };

  const markMessagesAsRead = async userId => {
    try {
      await patchHttps(`chat/markAsRead/${userId}`, {}); // ✅ Marcar mensajes como leídos
    } catch (error) {
      console.log(error);
    }
  };

    useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, []),
  );
const renderSuggestions = () => {
 

  return (
    <View
      key={index}
      style={[
        styles.userContainer,
        index % 2 !== 0 ? styles.oddBackground : null,
      ]}
    >
      <View style={styles.userImageContainer}>
        {item.isOnline && <View style={styles.onlineIndicator} />}
        <TouchableOpacity onPress={() => navigateToProfile(item.id)}>
          <Image
            source={{ uri: item.userImg || 'https://via.placeholder.com/150' }}
            resizeMode="contain"
            style={styles.userImage}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={async () => {
          await markMessagesAsRead(item.id);
          navigation.navigate('MessageDetails', { id: item.id });
        }}
        style={{ flexDirection: 'row', width: SIZES.width - 104 }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {item.fullName || 'Usuario desconocido'}
          </Text>
          <Text
            style={styles.lastSeen}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage || ''}
          </Text>
        </View>
        <View style={{ position: 'absolute', right: 4, alignItems: 'center' }}>
          <Text style={styles.lastMessageTime}>
            {item.lastMessageTime || ''}
          </Text>
          {item.messageInQueue > 0 && (
            <View style={styles.messageInQueueContainer}>
              <Text style={styles.messageInQueue}>
                {item.messageInQueue}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};


  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>
        Los chats aparecerán aquí cuando envíes o recibas un mensaje.{' '}
        <Text style={styles.startText}>Empezar</Text>
      </Text>
    </View>
  );

  const renderItem = ({item, index}) => (
    <View
      key={index}
      style={[
        styles.userContainer,
        index % 2 !== 0 ? styles.oddBackground : null,
      ]}>
      <View style={styles.userImageContainer}>
        {item.isOnline && <View style={styles.onlineIndicator} />}
        <TouchableOpacity onPress={() => navigateToProfile(item.id)}>
          <Image
            source={{uri: item.userImg}}
            resizeMode="contain"
            style={styles.userImage}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={async () => {
          await markMessagesAsRead(item.id);
          navigation.navigate('MessageDetails', {id: item.id});
        }}
        style={{flexDirection: 'row', width: SIZES.width - 104}}>
        <View style={{flex: 1}}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.lastSeen} numberOfLines={1} ellipsizeMode="tail">
            {item.lastMessage}
          </Text>
        </View>
        {item.messageInQueue > 0 && (
          <View style={styles.messageInQueueContainer}>
            <Text style={styles.messageInQueue}>{item.messageInQueue}</Text>
          </View>
        )}
        {/* <View style={{position: 'absolute', right: 4, alignItems: 'center'}}>
        <Text style={styles.lastMessageTime}>{item.lastMessageTime}</Text>
        {item.lastMessageDate ? (
          <Text style={{fontSize: 11, color: '#bbb', marginTop: 2}}>
            {item.lastMessageDate}
          </Text>
        ) : null}
      </View> */}
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <View>
      {/* 🔹 Barra de búsqueda */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search Users"
          placeholderTextColor={isDarkMode ? '#999' : COLORS.black}
          autoCapitalize="none"
          style={[
            styles.input,
            {
              color: isDarkMode ? '#000' : COLORS.black, // Color del texto (negro en ambos)
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Poppins-Bold',
              flex: 1,
            },
          ]}
          value={query}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch(query)}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : query.length > 0 ? (
        /* 🔹 Mostrar los resultados de búsqueda si hay una consulta */
        filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            onEndReached={() => {
              if (hasMore && !loading && !refreshing) fetchUsers();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchUsers(true)}
              />
            }
          />
        ) : (
          <Text style={styles.noResultsText}>No se encontraron resultados</Text>
        )
      ) : users.length === 0 ? (
        /* 🔹 Si no hay chats y no se está buscando, mostrar el mensaje vacío y sugerencias */
        <>
          {renderEmptyState()}
        
        </>
      ) : (
        <FlatList
          data={filteredUsers}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          onEndReached={() => fetchUsers()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchUsers(true)}
            />
          }
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.area, {flex: 1}]}>
      <View style={[styles.container, {flex: 1}]}>
        <Header title={'Mensajes'} goTo={'Event'} />

        {/* 🔽 Aquí lo envolvemos con flex: 1 para permitir scroll */}
        <View style={{flex: 1}}>{renderContent()}</View>
      </View>
      <View style={{margin: 80}} />
      <Tab />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtnContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
  },
  notiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    width: 16,
    borderRadius: 999,
    backgroundColor: COLORS.red,
    position: 'absolute',
    top: 1,
    right: 1,
    zIndex: 999,
  },
  notiText: {
    fontSize: 10,
    color: COLORS.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    height: 50,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.white,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#009688',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryWhite,
  },
  userImageContainer: {
    marginRight: 16,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  lastSeen: {
    fontSize: 14,
    color: 'white',
  },
  lastMessageTime: {
    fontSize: 12,
    color: 'white',
  },
  messageInQueue: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageInQueueContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 30,
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    top: 2,
  },
  messageInQueue: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: 'green',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  suggestionsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.white,
  },
  suggestionItem: {
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  suggestionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  emptyStateContainer: {alignItems: 'center', marginTop: 20},
  emptyStateText: {fontSize: 16, color: COLORS.white, textAlign: 'center'},
  startText: {color: COLORS.primary, fontWeight: 'bold'},
});

export default MessageV2;
