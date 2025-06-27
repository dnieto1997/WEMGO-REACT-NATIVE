import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getHttps, postHttps} from '../api/axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../context/SocketContext';

const {width} = Dimensions.get('window');

const DetailsParches = ({route}) => {
  const navigation = useNavigation();
  const {id} = route.params;

  const [parche, setParche] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [dataUser, setDataUser] = useState({});

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [addableUsers, setAddableUsers] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selected, setSelected] = useState([]);
  const {sendInvitationNotification} = useContext(SocketContext);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    if (id) {
      fetchParche();
      loadUserData();
    } else {
      Alert.alert('Error', 'ID de parche inválido');
      navigation.goBack();
    }
  }, [id]);

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

  const fetchParche = async () => {
    setLoading(true);
    try {
      const response = await getHttps(`parches/${id}`);
      setParche(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el parche');
    } finally {
      setLoading(false);
    }
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

  const openAddMembers = () => {
    setShowAddMembers(true);
    setPage(1);
    setTotalPages(1);
    setAddableUsers([]);
    fetchAddableUsers(1);
  };

  const fetchAddableUsers = async (pageToLoad = 1) => {
    if (loadingUsers || loadingMore) return;

    pageToLoad === 1 ? setLoadingUsers(true) : setLoadingMore(true);

    try {
      const response = await getHttps(
        `followers/addparcheuser?page=${pageToLoad}&limit=200&parcheid=${id}&event_id=${parche.event_id}`,
      );

      console.log(response.data);

      const newUsers = response?.data?.users || [];
      const total = response?.data?.totalPages || 1;

      if (pageToLoad === 1) {
        setAddableUsers(newUsers);
      } else {
        setAddableUsers(prev => [...prev, ...newUsers]);
      }

      setTotalPages(total);
      setPage(pageToLoad);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoadingUsers(false);
      setLoadingMore(false);
    }
  };
  const sendInvitations = async () => {
    try {
      const payload = {
        event_id: parche.event_id,
        invitedUsers: JSON.stringify(selected),
        parcheid:parche.id
      };

      console.log(payload)
      const response = await postHttps('parche-user/enviarinvitacion', payload);
      console.log(response.data)

      sendInvitationNotification?.({
        parchId:id,
        UserCreated: parche.user_created.id,
        invitation_user: JSON.stringify(selected),
      });

      /*   navigation.navigate('Parches', { selectedTab: 'PRIVATE' }); */
      setSelected([]);
      setShowAddMembers(false);
    } catch (err) {
      console.error('Error enviando invitaciones:', err);
      Alert.alert('Error', 'No se pudieron enviar las invitaciones');
    }
  };
  const handlePublicPress = () => {
    if (parche.userGo == '1') {
      // Ya va al evento, abre chatr
      navigation.navigate('ChatParche', {id: parche.id});
    } else {
      // No va al evento, consultar API para unirse
      Alert.alert('Unirse al Evento', '¿Deseas unirte a este evento?', [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Aceptar', onPress: () => joinPublicParche()},
      ]);
    }
  };

  const joinPublicParche = async () => {
    try {
      const payload = {
        event_id: parche.event_id,
        type: 'PUBLIC',
        parcheid: parche.id,
      };

      try {
        await postHttps('parche-user/aceptarinvitacion', payload);
        Alert.alert('Invitación aceptada', 'Te has unido al parche');
        fetchParche();
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo aceptar la invitación');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo unir al evento');
    }
  };

  const handlePrivatePress = () => {
    if (parche.userGo === '1') {
      navigation.navigate('ChatParche', {id: parche.id});
    } else {
      Alert.alert('Invitación', 'Aceptar invitación', [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Aceptar', onPress: () => acceptInvitation()},
      ]);
    }
  };

  const acceptInvitation = async () => {
    const payload = {
      event_id: parche.event_id,
      type: 'PRIVATE',
      parcheid: parche.id,
    };

    try {
      await postHttps('parche-user/aceptarinvitacion', payload);
      Alert.alert('Invitación aceptada', 'Te has unido al parche');
      fetchParche();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo aceptar la invitación');
    }
  };

  const handleLeaveParche = () => {
    Alert.alert('Salir del Parche', '¿Deseas salir de este parche?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Salir', onPress: () => leaveParche()},
    ]);
  };

  const leaveParche = async () => {
    try {
      await postHttps('parche-user/salir', {
        parcheid: parche.id,
        userid: dataUser.id,
        event_id: parche.event_id,
      });
      Alert.alert('Saliste del parche');
      navigation.navigate('Parches');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo salir del parche');
    }
  };

  const confirmRemoveMember = memberId => {
    Alert.alert(
      'Quitar miembro',
      '¿Seguro deseas sacar a este usuario del parche?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Sacar',
          style: 'destructive',
          onPress: () => removeMember(memberId),
        },
      ],
    );
  };

  const removeMember = async memberId => {
    try {
      await postHttps('parche-user/salir', {
        parcheid: parche.id,
        userid: memberId,
        event_id: parche.event_id,
      });
      Alert.alert('Usuario eliminado');
      fetchParche();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo sacar al usuario');
    }
  };

  const renderImage = ({item}) => (
    <Image source={{uri: item}} style={styles.eventImage} />
  );

  if (loading || !parche) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  const eventoImgs = parche.eventData?.img
    ? JSON.parse(parche.eventData.img)
    : [];

  return (
    <ScrollView style={styles.container}>
      <View style={{top: 10, left: 10}}>
        <Header title="Parche" />
      </View>

      <View style={{top: 10}}>
        {eventoImgs.length > 0 && (
          <View>
            <FlatList
              data={eventoImgs}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderImage}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              onMomentumScrollEnd={e => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImage(index);
              }}
            />
            {eventoImgs.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImage + 1} / {eventoImgs.length}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.eventTitle}>{parche.eventData?.name}</Text>
          <Text style={styles.eventPlace}>
            {parche.eventData?.place} - {parche.eventData?.city}
          </Text>

          <Text style={styles.sectionLabel}>Descripción</Text>
          <Text style={styles.description}>
            {parche.eventData?.description}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Creador</Text>
          <TouchableOpacity
            style={styles.creatorRow}
            onPress={() =>
              navigation.navigate('FriendTimeline', {
                id: parche.user_created.id,
              })
            }>
            <Image
              source={{uri: parche.user_created.img}}
              style={styles.avatarLarge}
            />
            <View>
              <Text style={styles.creatorName}>
                {parche.user_created.first_name} {parche.user_created.last_name}
              </Text>
            </View>
            {parche.user_created.checked === '1' && (
              <MaterialIcons
                name="verified"
                size={18}
                color="#3897f0"
                style={{marginLeft: 6}}
              />
            )}
          </TouchableOpacity>

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Miembros</Text>
          {parche.members.map(member => (
            <View key={member.id} style={styles.memberItem}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center', flex: 1}}
                onPress={() =>
                  navigation.navigate('FriendTimeline', {id: member.id})
                }>
                <Image source={{uri: member.img}} style={styles.avatar} />
                <Text style={styles.memberName}>
                  {member.first_name} {member.last_name}
                </Text>
              </TouchableOpacity>

              {/* Botón para el creador sacar a otros miembros */}
              {dataUser.id === parche.user_created.id &&
                member.id !== dataUser.id && (
                  <TouchableOpacity
                    onPress={() => confirmRemoveMember(member.id)}
                    style={styles.kickIcon}>
                    <MaterialIcons name="logout" size={20} color="#B00020" />
                  </TouchableOpacity>
                )}

              {/* Si soy yo (miembro actual) y NO soy el creador, puedo salirme */}
              {dataUser.id === member.id &&
                dataUser.id !== parche.user_created.id && (
                  <TouchableOpacity
                    onPress={handleLeaveParche}
                    style={styles.kickIcon}>
                    <MaterialIcons name="logout" size={20} color="#B00020" />
                  </TouchableOpacity>
                )}
            </View>
          ))}

          {dataUser.id === parche.user_created.id && (
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={openAddMembers}>
              <MaterialIcons name="person-add" size={20} color="#fff" />
              <Text style={styles.addMemberText}>Invitar a Parchar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={
              parche.type === 'PUBLIC'
                ? styles.messageButton
                : parche.userGo === '1'
                ? styles.messageButton
                : styles.acceptButton
            }
            onPress={() => {
              if (parche.type === 'PUBLIC') {
                handlePublicPress();
              } else {
                handlePrivatePress();
              }
            }}>
            <MaterialIcons
              name={
                parche.type === 'PUBLIC'
                  ? 'message'
                  : parche.userGo == '1'
                  ? 'message'
                  : 'check-circle'
              }
              size={20}
              color="#fff"
            />
            <Text style={styles.messageButtonText}>
              {parche.type === 'PUBLIC'
                ? 'Message'
                : parche.userGo == '1'
                ? 'Message'
                : 'Aceptar invitación'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={showAddMembers} animationType="slide">
        <View style={styles.modalContainer}>
          <Header title="Agregar Miembros" />

          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color="#aaa"
              style={{marginHorizontal: 8}}
            />
            <TextInput
              placeholder="Buscar usuario..."
              placeholderTextColor="#aaa"
              value={searchUser}
              onChangeText={text => {
                setSearchUser(text);
                const filtered = addableUsers.filter(user =>
                  `${user.first_name} ${user.last_name}`
                    .toLowerCase()
                    .includes(text.toLowerCase()),
                );
                setAddableUsers(filtered);
              }}
              style={styles.input}
            />
          </View>

          {loadingUsers ? (
            <ActivityIndicator color="purple" style={{marginTop: 20}} />
          ) : (
            <FlatList
              data={addableUsers}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => {
                const isSelected = selected.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.userItem, isSelected && styles.selected]}
                    onPress={() => toggleSelect(item.id)}>
                    <View style={styles.userInfo}>
                      <Image
                        source={{
                          uri:
                            item.img ||
                            'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.username}>
                        {item.first_name} {item.last_name}
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons
                        name="check-circle"
                        size={22}
                        color="#9b59b6"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {selected.length > 0 && (
            <TouchableOpacity style={styles.button} onPress={sendInvitations}>
              <Text style={styles.buttonText}>Invitar ({selected.length})</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowAddMembers(false);
              setSelected([]);
              setSearchUser('');
            }}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: 'purple',
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#944af5',
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  username: {
    color: '#fff',
    fontSize: 16,
  },
  selected: {
    backgroundColor: '#333',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
    height: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 60,
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
  addMemberText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  eventImage: {
    width: width * 0.9,
    height: 260,
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 10,
  },
  kickIcon: {
    position: 'absolute',
    right: 10,
  },
  acceptButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#03DAC6',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },

  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  eventPlace: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 6,
  },
  description: {
    color: '#ccc',
    fontSize: 14,
  },
  leaveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B00020',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  creatorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  memberName: {
    color: '#fff',
    fontSize: 14,
  },
  messageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default DetailsParches;
