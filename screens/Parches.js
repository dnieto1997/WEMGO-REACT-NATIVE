import React, { useCallback, useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { deleteHttps, getHttps, postHttps, postHttpsStories } from '../api/axios';
import Tab from '../components/Tab';
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';

const Parches = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Eliminados edadMinima, edadMaxima y genero
  const [ciudad, setCiudad] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [parcheNombre, setParcheNombre] = useState('');
  const [parcheDescripcion, setParcheDescripcion] = useState('');
  const [parcheFecha, setParcheFecha] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [parcheFoto, setParcheFoto] = useState(null);

  const ciudadesColombia = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
    'Bucaramanga', 'Pereira', 'Santa Marta', 'Manizales', 'Cúcuta',
  ];

  const crearSala = async () => {
    try {
      setLoadingCreate(true);
      const formData = new FormData();
      formData.append('ciudad', ciudad);
      formData.append('type', 'GROUP');
      formData.append('event_id', null);
      formData.append('name', parcheNombre);
      formData.append('description', parcheDescripcion);
      formData.append('date_created', parcheFecha);
      if (parcheFoto) {
        // Si la imagen viene de image-picker, debes obtener el nombre y type
        formData.append('groupImage', {
          uri: parcheFoto,
          name: 'parche.jpg',
          type: 'image/jpeg',
        });
      }
      await postHttpsStories('parches/createGroup', formData);
      setShowCreateModal(false);
      setCiudad('');
      setParcheNombre('');
      setParcheDescripcion('');
      setParcheFecha('');
      setParcheFoto(null);
      fetchParches();
      Alert.alert('Parche creado', 'El parche público se creó correctamente createGroup');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el parche createGroup');
      console.error(error);
    } finally {
      setLoadingCreate(false);
    }
  };
  // Selector de imagen
  const handleSelectFoto = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setParcheFoto(response.assets[0].uri);
        // Si necesitas base64: setParcheFoto(response.assets[0].base64)
      }
    });
  };
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('MYPARCHES');
  const [parches, setParches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(10);

  const insets = useSafeAreaInsets();

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
      let endpoint = '';
      if (selectedTab === 'PUBLIC') {
        endpoint = `parches/parchepublico?page=${page}&limit=${limit}`;
      } else if (selectedTab === 'PRIVATE') {
        endpoint = `parches/parcheprivado?page=${page}&limit=${limit}`;
      } else if (selectedTab === 'MYPARCHES') {
        endpoint = `parches/parchegroup?page=${page}&limit=${limit}`;
      }

      const response = await getHttps(endpoint);
      setParches(response.data.parches);
    } catch (error) {
      console.error('Error trayendo parches:', error);
      Alert.alert('Error', 'No se pudieron cargar los parches');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (item, type) => {
    navigation.navigate(type == 'group' ? 'DetailsGroups' : 'DetailsParches', { id: item.id });
  };

  const handleOptions = item => {
    Alert.alert(
      'Opciones',
      '¿Qué deseas hacer?',
      [
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EditarParche', { id: item.id }),
        },
        {
          text: 'Eliminar',
          onPress: () => confirmDelete(item.id),
          style: 'destructive',
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const confirmDelete = parcheId => {
    Alert.alert(
      'Eliminar Parche',
      '¿Estás seguro de que deseas eliminar este parche?',
      [
        { text: 'Cancelar', style: 'cancel' },
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
        
      await deleteHttps(`parches/${parcheId}`)
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
    navigation.navigate('ChatParche', { id: item.id })
  };

  const renderParches = () => {
    // Filtrar parches de tipo "group" solo en "Mis Parches"
    //console.log(`Selected Tab: ${selectedTab}, Total Parches: ${parches.length}`);
    const filteredParches = selectedTab === 'MYPARCHES'
      ? parches.filter(p => (p.type?.toLowerCase?.() === 'group'))
      : parches;
    //console.log(`Filtered Parches Count: ${filteredParches.length}`);
    return filteredParches.map(item => {
      const eventoImg = item.eventData?.img
        ? JSON.parse(item.eventData.img)[0]
        : null;

      return (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => handleNavigate(item, item.type?.toLowerCase())}>
          <View style={styles.cardRow}>
            {eventoImg && (
              <Image source={{ uri: eventoImg }} style={styles.miniEventImg} />
            )}
            {item.img && (
              <Image source={{ uri: item.img }} style={styles.miniEventImg} />
            )}

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.headerRow}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Image
                    source={{ uri: item.user_created.img }}
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
                      style={{ marginLeft: 6 }}
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


              {selectedTab === 'PUBLIC' && item.eventData && (
                <>
                  <Text style={styles.title}>
                    {'Parche Publico'}
                  </Text>
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
                  <Text style={styles.title}>
                    {item.eventData ? item.eventData.name : 'Parche Privado'}
                  </Text>
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
                                style={{ marginLeft: 6 }}
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
                                style={{ marginLeft: 6 }}
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedTab === 'MYPARCHES' && (
                <>
                  <Text style={styles.title}>
                    {item.name}
                  </Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={{ ...styles.container, paddingTop: insets.top }}>
      <View style={{ top: 5, left: 10 }}>
        <Header title="Parches" />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'MYPARCHES' && styles.tabSelected]}
          onPress={() => handleTabChange('MYPARCHES')}>
          <Text
            style={
              selectedTab === 'MYPARCHES' ? styles.tabTextSelected : styles.tabText
            }>
            Mis Parches
          </Text>
        </TouchableOpacity>
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
        <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {renderParches()}
        </ScrollView>
      )}

      {/* Botón flotante solo en "Mis Parches" */}
      {selectedTab === 'MYPARCHES' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal para crear parche público */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => {
              setShowCreateModal(false);
              if (Platform.OS !== 'web') {
                const { Keyboard } = require('react-native');
                Keyboard.dismiss();
              }
            }}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Parche</Text>
            {/* Foto del parche */}
            <Text style={styles.label}>Foto del parche</Text>
            <TouchableOpacity style={[styles.input, { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }]} onPress={handleSelectFoto}>
              {parcheFoto ? (
                <Image source={{ uri: parcheFoto }} style={{ width: 60, height: 60, borderRadius: 8 }} />
              ) : (
                <Text style={{ color: '#aaa' }}>Seleccionar imagen</Text>
              )}
            </TouchableOpacity>
            {/* Nombre del parche */}
            <Text style={styles.label}>Nombre del parche</Text>
            <TextInput
              style={styles.input}
              value={parcheNombre}
              onChangeText={setParcheNombre}
              placeholder="Nombre del parche"
              placeholderTextColor="#666"
            />
            {/* Descripción del parche */}
            <Text style={styles.label}>Descripción del parche</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={parcheDescripcion}
              onChangeText={setParcheDescripcion}
              placeholder="Descripción del parche"
              placeholderTextColor="#666"
              multiline
            />
            {/* Fecha del parche */}
            <Text style={styles.label}>Fecha del parche</Text>
            <TouchableOpacity
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: parcheFecha ? '#fff' : '#aaa' }}>
                {parcheFecha ? parcheFecha : 'Seleccionar fecha'}
              </Text>
              <MaterialIcons name="date-range" size={22} color="#fff" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={parcheFecha ? new Date(parcheFecha) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    // Formato YYYY-MM-DD
                    const yyyy = selectedDate.getFullYear();
                    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(selectedDate.getDate()).padStart(2, '0');
                    setParcheFecha(`${yyyy}-${mm}-${dd}`);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
            {/* Ciudad */}
            <Text style={styles.label}>Ciudad</Text>
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                value={ciudad}
                onValueChange={setCiudad}
                items={[
                  ...ciudadesColombia.map(c => ({ label: c, value: c }))
                ]}
                style={{
                  inputAndroid: styles.picker,
                  inputIOS: styles.picker,
                  placeholder: { color: '#aaa' },
                }}
                placeholder={{ label: 'Seleccionar ciudad', value: '' }}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loadingCreate && { opacity: 0.7 }]}
              onPress={crearSala}
              disabled={loadingCreate}
            >
              {loadingCreate ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Crear Parche</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#944af5', marginTop: 10 }]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
    color: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#fff',
    borderColor: '#333',
    backgroundColor: '#111',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  androidPicker: {
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
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
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 80,
    backgroundColor: '#944af5',
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 99,
  },
});

export default Parches;
