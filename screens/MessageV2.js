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

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../context/SocketContext';
import Tab from '../components/Tab';
import Header from '../components/Header';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

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
  const [activeTab, setActiveTab] = useState('mensajes');
  const [loadedTabs, setLoadedTabs] = useState({
    mensajes: false,
    misParches: false,
    parches: false,
  });

  const [tabLoading, setTabLoading] = useState(false);

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

  const fetchMensajes = async (reset = false) => {
    if (reset) {
      setUsers([]);
      setFilteredUsers([]);
      setLoading(true);
    }

    setRefreshing(true);

    try {
      const response = await getHttps(`chat?page=1&limit=50`);
      const formattedUsers = response.data.map(user => {
        const dateObj = user.lastMessage?.timestamp
          ? new Date(user.lastMessage.timestamp)
          : null;
        return {
          id: user.id,
          fullName: user.fullName,
          messageInQueue:
            user.id === DataUser.id ? 0 : user.unreadMessages || 0,
          userImg:
            user.img ||
            'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
          isOnline: onlineUsers.some(onlineUser => onlineUser.id == user.id),
          lastMessage: user.lastMessage?.content || '',
          lastMessageTime:
            dateObj?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) || '',
          lastMessageDate:
            dateObj?.toLocaleDateString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }) || '',
        };
      });
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchMisParches = async () => {
    try {
      const res = await getHttps('parche-user/misparches');
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchOtrosParches = async () => {
    try {
      const res = await getHttps('parche-user/otrosparches');
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setUsers([]);
    setFilteredUsers([]);
    setLoading(true);
    setRefreshing(false);

    if (activeTab === 'mensajes') {
      fetchMensajes(true);
    } else if (activeTab === 'misParches') {
      fetchMisParches();
    } else if (activeTab === 'parches') {
      fetchOtrosParches();
    }
  }, [activeTab]);

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
            'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
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

  /* const renderSuggestions = () => {
 

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
 */

  const renderSkeleton = () => (
    <>
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.secondaryWhite,
          }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#333',
              marginRight: 16,
            }}
          />
          <View style={{flex: 1}}>
            <View
              style={{
                height: 15,
                width: '60%',
                backgroundColor: '#333',
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <View
              style={{
                height: 13,
                width: '40%',
                backgroundColor: '#444',
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      ))}
    </>
  );
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
   {/*      <View style={{position: 'absolute', right: 4, alignItems: 'center'}}>
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

  const renderMisParches = () => {
    if (loading) return renderSkeleton();

    return (
      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => {
          const lastMessageDate = item.lastMessageTimestamp
            ? new Date(item.lastMessageTimestamp).toLocaleDateString()
            : null;

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ChatParche', {id: item.id})}
              style={[
                styles.userContainer,
                {flexDirection: 'row', alignItems: 'center'},
              ]}>
              {/* Imagen del dueño */}
              <Image source={{uri: item.owner?.img}} style={styles.userImage} />

              <View style={{flex: 1, marginLeft: 10}}>
                {/* Nombre del parche */}
                <Text style={styles.userName}>
                  {item.name || 'Parche sin nombre'}
                </Text>

                {/* Tipo y creador */}

                <Text style={styles.lastSeen}>Creador: {item.owner?.name}</Text>

                {/* Último mensaje */}
                <Text style={styles.lastSeen} numberOfLines={1}>
                  {item.lastMessage
                    ? `Último mensaje: ${item.lastMessage}`
                    : 'Sin mensajes'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMisParches(true)}
          />
        }
      />
    );
  };

const renderParches = () => {
  if (loading) return renderSkeleton();

  return (
    <FlatList
      data={users}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => {
        const lastMessageDate = item.lastMessageTimestamp
          ? new Date(item.lastMessageTimestamp).toLocaleDateString()
          : null;

        const event = item.event;
        const eventImage = event?.img ? JSON.parse(event.img)[0] : null;

        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatParche', {id: item.id})}
            style={[
              styles.userContainer,
              {
                paddingVertical: 15,
                flexDirection: 'column',
                alignItems: 'flex-start',
              },
            ]}>

            {/* Encabezado: imagen y título */}
            <View style={{flexDirection: 'row', marginBottom: 8}}>
              {eventImage && (
                <Image
                  source={{uri: eventImage}}
                  style={{width: 60, height: 60, borderRadius: 10, marginRight: 10}}
                />
              )}
              <View style={{flex: 1}}>
                <Text style={{fontWeight: 'bold', fontSize: 16}} numberOfLines={2}>
                  {event?.name || 'Evento sin nombre'}
                </Text>
                <Text style={styles.lastSeen}>
                  <MaterialIcons name="place" size={16} color="#888" /> {event?.place} - {event?.city}
                </Text>
              </View>
            </View>

            {/* Creador */}
            <Text style={styles.lastSeen}>
              <MaterialIcons name="person" size={16} color="#888" /> Creador: {item.owner?.name}
            </Text>

            {/* Descripción */}
            {item.description && (
              <Text style={styles.lastSeen} numberOfLines={2}>
                <MaterialIcons name="info" size={16} color="#888" /> {item.description}
              </Text>
            )}

            {/* Último mensaje */}
            <Text style={styles.lastSeen} numberOfLines={2}>
              <MaterialIcons name="chat" size={16} color="#888" />{' '}
              {item.lastMessageUser
                ? `${item.lastMessageUser}: ${item.lastMessage}`
                : item.lastMessage || 'Sin mensajes'}
            </Text>

       
          </TouchableOpacity>
        );
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchOtrosParches(true)}
        />
      }
    />
  );
};


  const renderContent = () => {
    if (loading) return renderSkeleton();
    return (
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
                color: isDarkMode ? '#000' : COLORS.black,
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

        {/* 🔹 Mostrar skeleton si está cargando la pestaña */}
        {tabLoading ? (
          renderSkeleton()
        ) : query.length > 0 ? (
          filteredUsers.length > 0 ? (
            <FlatList
              data={filteredUsers}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              onEndReached={() => {
                if (hasMore && !loading && !refreshing) fetchOtrosParches();
              }}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchMensajes(true)}
                />
              }
            />
          ) : (
            <Text style={styles.noResultsText}>
              No se encontraron resultados
            </Text>
          )
        ) : users.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredUsers}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            onEndReached={() => {
              if (hasMore && !loading && !refreshing) fetchOtrosParches();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchOtrosParches()}
              />
            }
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.area, {flex: 1}]}>
      <View style={[styles.container, {flex: 1}]}>
        <Header title={'WemgoChat'} goTo={'Event'} />

        {/* 🔹 Tabs */}
<View style={{ backgroundColor: '#000', paddingTop: 10 }}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
    {[
      { key: 'mensajes', label: 'Mis mensajes' },
      { key: 'misParches', label: 'Mis parches' },
      { key: 'parches', label: 'Parches' },
    ].map(tab => (
      <TouchableOpacity
        key={tab.key}
        onPress={() => {
          setActiveTab(tab.key);
          if (!loadedTabs[tab.key]) {
            if (tab.key === 'mensajes') fetchMensajes(true);
            else if (tab.key === 'misParches') fetchMisParches();
            else if (tab.key === 'parches') fetchOtrosParches();
            setLoadedTabs(prev => ({ ...prev, [tab.key]: true }));
          }
        }}
        style={{ flex: 1, alignItems: 'center' }}
      >
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 6,
          }}
        >
          {tab.label}
        </Text>
        <View
          style={{
            height: 3,
            width: '100%',
            backgroundColor: activeTab === tab.key ? '#944af5' : '#333',
            borderRadius: 2,
          }}
        />
      </TouchableOpacity>
    ))}
  </View>
</View>




        {/* 🔹 Tab content */}
        <View style={{flex: 1, top: 10}}>
          {activeTab === 'mensajes' && renderContent()}
          {activeTab === 'misParches' && renderMisParches()}
          {activeTab === 'parches' && renderParches()}
        </View>
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
