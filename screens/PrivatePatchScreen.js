import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal 
} from 'react-native';
import { getHttps, postHttps } from '../api/axios';
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketContext } from '../context/SocketContext';
import { useNavigation } from '@react-navigation/native';



const placeholderImg =
  'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png';

const PrivatePatchScreen = ({ route }) => {
  const { id } = route.params;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoadingMap, setImageLoadingMap] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
   const [DataUser, setDataUser] = useState({});
     const {sendInvitationNotification} = useContext(SocketContext);
     const navigation=useNavigation()


     const [showAddMembers, setShowAddMembers] = useState(false);
const [addableUsers, setAddableUsers] = useState([]);
const [selectedToAdd, setSelectedToAdd] = useState([]);
const [searchUser, setSearchUser] = useState('');
const [loadingUsers, setLoadingUsers] = useState(false);

    const loadUserData = useCallback(async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setDataUser(parsedData);
   
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }, []);

    useEffect(() => {
    loadUserData()
        fetchUsers(true);
    }, [])
    



  const fetchUsers = async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);

    try {
      const currentPage = reset ? 1 : page;
      const response = await getHttps(`followers/parchefollow?page=${currentPage}&limit=200`);
      console.log(response.data)
      const newUsers = response?.data?.users || [];

      if (reset) {
        setUsers(newUsers);
        setFilteredUsers(newUsers);
        setPage(2);
      } else {
        const combined = [...users, ...newUsers];
        setUsers(combined);
        setFilteredUsers(combined);
        setPage(prev => prev + 1);
      }

      setHasMore(newUsers.length === 200);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSearch = text => {
    setSearch(text);
    const filtered = users.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const toggleSelect = userId => {
    if (selected.includes(userId)) {
      setSelected(prev => prev.filter(id => id !== userId));
    } else if (selected.length < 25) {
      setSelected(prev => [...prev, userId]);
    } else {
      Alert.alert('Límite alcanzado', 'Solo puedes invitar hasta 25 personas.');
    }
  };

  const sendInvitations = async () => {
    try {
      const payload = { event_id: id, invitedUsers: JSON.stringify(selected) };
     const response= await postHttps('parche-user', payload);
     console.log(response.data)
   
 
               
  sendInvitationNotification?.({
    parchId: response.data.parchId,
    UserCreated: DataUser.id,
    invitation_user: JSON.stringify(selected),
  });

      navigation.navigate('Parches', { selectedTab: 'PRIVATE' });
      setSelected([]);
    } catch (error) {
      console.log('Error enviando invitaciones:', error);



  Alert.alert('Error', 'Ya creaste un parche asociado a este evento');
    }
  };




  const renderItem = ({ item }) => {
    const isSelected = selected.includes(item.id.toString());
    const isImageLoading = imageLoadingMap[item.id];

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selected]}
        onPress={() => toggleSelect(item.id.toString())}
      >
        <View style={styles.userInfo}>
          <View style={{ width: 42, height: 42, marginRight: 12 }}>
            {isImageLoading && (
              <View style={styles.loader}>
                <ActivityIndicator size="small" color="#9b59b6" />
              </View>
            )}
            <Image
              source={{ uri: item.img || placeholderImg }}
              style={[styles.avatar, isImageLoading && { opacity: 0 }]}
              onLoadStart={() =>
                setImageLoadingMap(prev => ({ ...prev, [item.id]: true }))
              }
              onLoadEnd={() =>
                setImageLoadingMap(prev => ({ ...prev, [item.id]: false }))
              }
            />
          </View>
          <Text style={styles.username}>
            {item.first_name} {item.last_name}
          </Text>
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={22} color="#9b59b6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ top: 10, left: 10 }}>
        <Header title={'Parche Privado'} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#aaa" style={{ marginHorizontal: 8 }} />
        <TextInput
          placeholder="Buscar usuario..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearch}
          style={styles.input}
        />
      </View>

      <View style={{ flex: 1 }}>
        {initialLoad ? (
          <ActivityIndicator color="purple" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => fetchUsers(false)}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>

      {selected.length > 0 && (
        <TouchableOpacity style={styles.button} onPress={sendInvitations}>
          <Text style={styles.buttonText}>Enviar invitación ({selected.length})</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showAddMembers} animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={20} color="#aaa" style={{ marginHorizontal: 8 }} />
      <TextInput
        placeholder="Buscar usuario..."
        placeholderTextColor="#aaa"
        value={searchUser}
        onChangeText={(text) => {
          setSearchUser(text);
          const filtered = addableUsers.filter(user =>
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(text.toLowerCase())
          );
          setAddableUsers(filtered);
        }}
        style={styles.input}
      />
    </View>

    {loadingUsers ? (
      <ActivityIndicator color="purple" style={{ marginTop: 20 }} />
    ) : (
      <FlatList
        data={addableUsers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedToAdd.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.userItem, isSelected && styles.selected]}
              onPress={() => {
                if (isSelected) {
                  setSelectedToAdd(prev => prev.filter(id => id !== item.id));
                } else if (selectedToAdd.length < 25) {
                  setSelectedToAdd(prev => [...prev, item.id]);
                } else {
                  Alert.alert('Límite', 'Solo puedes invitar hasta 25 personas.');
                }
              }}>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: item.img || 'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png' }}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{item.first_name} {item.last_name}</Text>
              </View>
              {isSelected && (
                <MaterialIcons name="check-circle" size={22} color="#9b59b6" />
              )}
            </TouchableOpacity>
          );
        }}
      />
    )}

    <TouchableOpacity
      style={styles.button}
      onPress={async () => {
        try {
          const payload = {
            event_id: parche.event_id,
            invitedUsers: JSON.stringify(selectedToAdd),
          };
          await postHttps('parche-user', payload);
          Alert.alert('Éxito', 'Invitaciones enviadas');
          setShowAddMembers(false);
          fetchParche();
        } catch (err) {
          console.error(err);
          Alert.alert('Error', 'No se pudieron enviar las invitaciones');
        }
      }}>
      <Text style={styles.buttonText}>Invitar ({selectedToAdd.length})</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.button, { backgroundColor: '#B00020', marginTop: 10 }]} onPress={() => setShowAddMembers(false)}>
      <Text style={styles.buttonText}>Cerrar</Text>
    </TouchableOpacity>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 20,
    marginBottom: 10,
    height: 40,
  },
  modalContainer: {
  flex: 1,
  backgroundColor: '#000',
  padding: 16,
  paddingTop: 50,
},
addMemberButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#03DAC6',
  padding: 12,
  borderRadius: 8,
  marginTop: 10,
},
addMemberText: {
  color: '#000',
  fontWeight: 'bold',
  marginLeft: 8,
},
  input: {
    color: '#fff',
    flex: 1,
    fontSize: 15,
  },
  userItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#222',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    position: 'absolute',
  },
  loader: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 15,
  },
  button: {
    backgroundColor: 'purple',
    padding: 14,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PrivatePatchScreen;
