import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import {getHttps, postHttps} from '../api/axios';
import Tab from '../components/Tab';
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Parches = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('PUBLIC');
  const [parches, setParches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (route.params?.selectedTab) {
      setSelectedTab(route.params.selectedTab);
    }
  }, [route.params]);



  useFocusEffect(
  useCallback(() => {
    fetchParches();
  }, [selectedTab])
);

  const handleTabChange = tab => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
    }
  };

  const fetchParches = async () => {
    setLoading(true);
    try {
      const endpoint =
        selectedTab === 'PUBLIC'
          ? `parches/parchepublico?page=${page}&limit=${limit}`
          : `parches/parcheprivado?page=${page}&limit=${limit}`;

      const response = await getHttps(endpoint);
      setParches(response.data.parches);
    } catch (error) {
      console.error('Error trayendo parches:', error);
      Alert.alert('Error', 'No se pudieron cargar los parches');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = item => {
    navigation.navigate('DetailsParches', {id: item.id});
  };

  const handleOptions = item => {
    Alert.alert(
      'Opciones',
      '¿Qué deseas hacer?',
      [
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EditarParche', {id: item.id}),
        },
        {
          text: 'Eliminar',
          onPress: () => confirmDelete(item.id),
          style: 'destructive',
        },
        {text: 'Cancelar', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const confirmDelete = parcheId => {
    Alert.alert(
      'Eliminar Parche',
      '¿Estás seguro de que deseas eliminar este parche?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteParche(parcheId),
        },
      ],
    );
  };

  const deleteParche = async parcheId => {
    try {
      // Aquí haces el delete o postHttps correspondiente
      Alert.alert('Eliminado', 'El parche se eliminó correctamente');
      fetchParches();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo eliminar el parche');
    }
  };

  const handleAccept = async item => {
    const payload = {
      event_id: item.event_id,
      type: 'PRIVATE',
      parcheid: item.id,
    };

    try {
      await postHttps('parche-user/aceptarinvitacion', payload);
      Alert.alert('Invitación aceptada', 'Te has unido al parche');
      fetchParches();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo aceptar la invitación');
    }
  };

  
  const GotoMensaje = async item => {
   navigation.navigate('ChatParche',{id:item.id})
  };

  const renderParches = () => {
    return parches.map(item => {
      const eventoImg = item.eventData?.img
        ? JSON.parse(item.eventData.img)[0]
        : null;

      return (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => handleNavigate(item)}>
          <View style={styles.cardRow}>
            {eventoImg && (
              <Image source={{uri: eventoImg}} style={styles.miniEventImg} />
            )}

            <View style={{flex: 1, marginLeft: 10}}>
              <View style={styles.headerRow}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                  <Image
                    source={{uri: item.user_created.img}}
                    style={styles.avatar}
                  />
                  <Text style={styles.creatorName}>
                    {item.user_created.first_name} {item.user_created.last_name}
                  </Text>
                  {item.user_created.checked === '1' && (
                    <MaterialIcons
                      name="verified"
                      size={18}
                      color="#3897f0"
                      style={{marginLeft: 6}}
                    />
                  )}
                </View>

                {item.is_owner == '1' && (
                  <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => handleOptions(item)}>
                    <MaterialIcons name="more-vert" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.title}>
                {item.eventData ? item.eventData.name : 'Parche Privado'}
              </Text>

              {selectedTab === 'PUBLIC' && item.eventData && (
                <>
                  <Text style={styles.subtitle}>
                    Lugar: {item.eventData.place} - {item.eventData.city}
                  </Text>
                  <Text style={styles.subtitle}>
                    Creado por {item.user_created.first_name}{' '}
                    {item.user_created.last_name} para este evento
                  </Text>
                </>
              )}

              {selectedTab === 'PRIVATE' && (
                <>
                  <Text style={styles.subtitle}>
                    Parche privado creado por {item.user_created.first_name}{' '}
                    {item.user_created.last_name}
                  </Text>

                  {item.is_owner == '0' && (
                    <>
                      {item.is_owner == '0' && (
                        <>
                          {item.userGo == '0' ? (
                            <TouchableOpacity
                              style={styles.acceptButton}
                              onPress={() => handleAccept(item)}>
                              <Text style={styles.acceptButtonText}>
                                Aceptar Invitación
                              </Text>
                              <MaterialIcons
                                name="check-circle"
                                size={16}
                                color="#fff"
                                style={{marginLeft: 6}}
                              />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.messageButton}
                               onPress={() => GotoMensaje(item)}>
                              <Text style={styles.acceptButtonText}>
                                Mensaje
                              </Text>
                              <MaterialIcons
                                name="message"
                                size={16}
                                color="#fff"
                                style={{marginLeft: 6}}
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={{top: 5, left: 10}}>
        <Header title="Parches" />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'PUBLIC' && styles.tabSelected]}
          onPress={() => handleTabChange('PUBLIC')}>
          <Text
            style={
              selectedTab === 'PUBLIC' ? styles.tabTextSelected : styles.tabText
            }>
            Públicos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'PRIVATE' && styles.tabSelected]}
          onPress={() => handleTabChange('PRIVATE')}>
          <Text
            style={
              selectedTab === 'PRIVATE'
                ? styles.tabTextSelected
                : styles.tabText
            }>
            Privados
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{marginTop: 20}} />
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {renderParches()}
        </ScrollView>
      )}

      <Tab />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  optionsButton: {
    padding: 4,
  },
  messageButton: {
    marginTop: 6,
    backgroundColor: '#944af5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabSelected: {
    borderColor: '#6200ee',
  },
  tabText: {
    color: '#aaa',
    fontWeight: '500',
  },
  tabTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  contentContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  miniEventImg: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
  },
  creatorName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 2,
  },
  acceptButton: {
    marginTop: 6,
    backgroundColor: '#6200ee',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default Parches;
