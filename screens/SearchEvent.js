import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getHttps } from '../api/axios';
import HeaderwithLogoandIcons from '../components/Headerwithlogoandicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import MonthlyCalendar from '../components/MonthlyCalendar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const groupEventsByDate = events => {
  return events.reduce((acc, event) => {
    const date = new Date(event.initial_date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});
};

const getMonthCalendarDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay(); // domingo = 0
  const daysInMonth = lastDayOfMonth.getDate();
  const totalDays = Math.ceil((startDay + daysInMonth) / 7) * 7;

  const calendar = [];
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(year, month, i - startDay + 1);
    const iso = date.toISOString().split('T')[0];
    calendar.push({
      date,
      iso,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return calendar;
};

const getWeekDates = () => {
  const today = new Date();
  const firstDay = today.getDate() - today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(firstDay + i);
    return {
      label: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }),
      day: date.getDate(),
      iso: date.toISOString().split('T')[0],
    };
  });
};

const EventCard = ({ event, navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('EventDetails', { id: event.id })}
    style={styles.eventCardNew}>
    <View style={styles.eventDetails}>
      <Text numberOfLines={2} style={styles.eventNameNew}>
        {event.name}
      </Text>
      <Text style={styles.eventTimeNew}>
        {new Date(event.initial_date).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Text numberOfLines={1} style={styles.eventLocationNew}>
        {event.place}
      </Text>
    </View>
  </TouchableOpacity>
);

const SearchEvent = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [eventsByDate, setEventsByDate] = useState({});
  const [viewMode, setViewMode] = useState('week');
  const [calendarDates, setCalendarDates] = useState(getWeekDates());
  const [DataUser, setDataUser] = useState({});
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [eventos, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const insets = useSafeAreaInsets();


  const eventTypes = [
    { label: 'Películas', value: 'movie' },
    { label: 'Festival', value: 'festival' },
    { label: 'Comida', value: 'food' },
    { label: 'Música', value: 'music' },
    { label: 'Teatro', value: 'theather' },
    { label: 'Deporte', value: 'sport' },
    { label: 'Juegos', value: 'games' },
    { label: 'Turismo', value: 'touring' },
    { label: 'Fiesta', value: 'party' },
    { label: 'Playa', value: 'beach' },
    { label: 'Cultura', value: 'culture' },
    { label: 'Networking', value: 'internet' },
  ];
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
    loadUserData();
  }, []);

  const handleSearch = async text => {
    setQuery(text);
    try {
      const params = new URLSearchParams();
      if (text.length > 2) params.append('query', text);
      if (selectedType) params.append('type', selectedType); // Corregido aquí
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await getHttps(
        `event/search/filters?${params.toString()}`,
      );

      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await getHttps('event/searchbyinterest');

      const grouped = groupEventsByDate(response.data);
      setEventsByDate(grouped);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const switchView = mode => {
    setViewMode(mode);
    if (mode === 'week') {
      setCalendarDates(getWeekDates());
    } else {
      setCalendarDates(getMonthCalendarDates());
    }
  };

  const handleRefreshHeader = () => {

  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      loadUserData();
      handleRefreshHeader();

    }, []),
  );

  const mostrarModal = () => {
    setSearchModalVisible(true);
    setQuery('');
    setEvents([]);
    setSelectedType('');
    setStartDate(null);
    setEndDate(null);
  };

  const cerrarModal = () => {
    setSearchModalVisible(false);
    setQuery('');
    setEvents([]);
    fetchEvents();
  };
  const renderCalendar = () => (
    <MonthlyCalendar events={Object.values(eventsByDate).flat()} />
  );

  const renderWeekEvents = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {calendarDates.map(({ label, day, iso }) => (
          <View key={iso} style={styles.eventRow}>
            {/* Fecha del día (lado izquierdo con fondo especial) */}
            <View
              style={[
                styles.dateBox,
                iso === '2024-04-22' && styles.gradientDateBox,
              ]}>
              <Text style={styles.dayText}>{day}</Text>
              <Text style={styles.monthText}>{label.split(' ')[2]}</Text>
            </View>

            <View style={{ margin: 9 }} />
            <View style={styles.cardContainer}>
              {eventsByDate[iso]?.length ? (
                eventsByDate[iso].map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    navigation={navigation}
                  />
                ))
              ) : (
                <Text style={styles.noEventText}>No hay eventos</Text>
              )}
            </View>
          </View>
        ))}
        <View style={{ margin: 35 }} />
      </ScrollView>
    </SafeAreaView>
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top - 15 }}>
      <View style={{ marginTop: 15 }} />
      <HeaderwithLogoandIcons onRefresh={handleRefreshHeader} />

      <View style={{ marginTop: 30 }} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => switchView('week')}
          style={[styles.tabButton, viewMode === 'week' && styles.tabActive]}>
          <Text
            style={[
              styles.tabText,
              viewMode === 'week' && styles.tabTextActive,
            ]}>
            Esta semana
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchView('month')}
          style={[styles.tabButton, viewMode === 'month' && styles.tabActive]}>
          <Text
            style={[
              styles.tabText,
              viewMode === 'month' && styles.tabTextActive,
            ]}>
            Este mes
          </Text>
        </TouchableOpacity>

        <View style={styles.icons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => mostrarModal()}>
            <Ionicons name="search-outline" size={25} color="#944af5" />
          </TouchableOpacity>
          {/*      {DataUser.role !== 'USER' && ( 
               <TouchableOpacity style={styles.iconButton} onPress={() => { }}>
               <Ionicons name="add-outline" size={25} color="#944af5" />
             </TouchableOpacity>
          )} */}
        </View>
      </View>
      <View style={{ marginEnd: 10 }}>
        <Text style={styles.textEvent}>
          ¡Te podrían interesar estos eventos!
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Input de búsqueda con ícono */}
            <View style={[styles.searchContainer, { marginBottom: 12 }]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#222',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                }}>
                <Icon
                  name="search"
                  size={20}
                  color="#aaa"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={[styles.input, { flex: 1,backgroundColor:"#222"}]}
                  placeholder="Buscar eventos..."
                  placeholderTextColor="white"
                  value={query}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>
            </View>

            {/* Select tipo de evento */}
            <View style={{ marginBottom: 12 }}>
              <RNPickerSelect
                onValueChange={value => setSelectedType(value)}
                value={selectedType}
                placeholder={{ label: 'Seleccionar tipo de evento', value: null }}
                items={eventTypes}
                style={{
                  inputAndroid: {
                    color: '#fff',
                    backgroundColor: '#222',
                    padding: 12,
                    borderRadius: 10,
                  },
                  inputIOS: {
                    color: '#fff',
                    backgroundColor: '#222',
                    padding: 12,
                    borderRadius: 10,
                  },
                }}
              />
            </View>

            {/* Filtros por fecha */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={{
                  flex: 1,
                  marginRight: 5,
                  backgroundColor: '#222',
                  padding: 10,
                  borderRadius: 10,
                }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                  Desde:{' '}
                  {startDate ? startDate.toLocaleDateString() : 'Seleccionar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={{
                  flex: 1,
                  marginLeft: 5,
                  backgroundColor: '#222',
                  padding: 10,
                  borderRadius: 10,
                }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                  Hasta:{' '}
                  {endDate ? endDate.toLocaleDateString() : 'Seleccionar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DatePickers */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}

            {/* Resultados */}
            <ScrollView style={{ marginTop: 10 }}>
              {eventos
                .filter(evento =>
                  query
                    ? evento.name.toLowerCase().includes(query.toLowerCase())
                    : true,
                )
                .map((evento, index) => {
                  const images = JSON.parse(evento.img || '[]');
                  const start = new Date(
                    evento.initial_date,
                  ).toLocaleDateString();
                  const end = new Date(evento.final_date).toLocaleDateString();

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.resultCard}
                      onPress={() => {
                        setSearchModalVisible(false);
                        navigation.navigate('EventDetails', { id: evento.id });
                      }}>
                      <Image
                        source={{ uri: images[0] }}
                        style={styles.resultImage}
                      />
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle}>{evento.name}</Text>
                        <Text style={styles.resultLocation}>
                          {evento.city}, {evento.country}
                        </Text>
                        <Text style={styles.resultDate}>
                          {start} - {end}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            {/* Botón cerrar */}
            <TouchableOpacity onPress={cerrarModal} style={styles.closeButton}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {viewMode === 'month' ? renderCalendar() : renderWeekEvents()}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  icons: {
    flexDirection: 'row',
  },
  textEvent: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  iconButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20, // mitad del ancho/alto
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  scrollContainer: {
    padding: 12,
  },
  dayContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  dateLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 4,
  },
  dateLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a47aff',
  },
  eventDescription: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 4,
  },
  noEventText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  dateBox: {
    width: 90,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 20, // solo esquina inferior derecha redondeada
    overflow: 'hidden',
    backgroundColor: '#3a3a3a',
  },

  gradientDateBox: {
    backgroundColor: 'linear-gradient(45deg, #b952ff, #5ac8fa)', // para gradient real necesitarías una View de `react-native-linear-gradient`
    // esto es solo visual para ver cómo sería, reemplaza por el componente si usas gradient real
  },

  dayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  monthText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Poppins-Bold',
  },

  cardContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    marginLeft: -1,
    borderRadius: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#222',
    marginHorizontal: 5,
  },
  tabActive: {
    backgroundColor: '#a47aff',
  },
  tabText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  dateLabelSub: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  eventCard: {
    marginBottom: 10,
    backgroundColor: '#222',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 10,
    marginHorizontal: 15,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  noEventText: {
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 20,
    marginTop: 6,
  },
  calendarContainer: {
    paddingHorizontal: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
    marginTop: 30,
  },
  calendarHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    padding: 4,
    minHeight: 70,
  },
  calendarDay: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  eventDot: {
    fontSize: 10,
    color: '#a47aff',
  },
  moreEventsText: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
  },
  eventCardNew: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  eventDetails: {
    padding: 12,
  },
  eventNameNew: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventTimeNew: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 2,
  },
  eventLocationNew: {
    color: '#aaa',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    height: 40,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  resultImage: {
    width: 80,
    height: 80,
  },
  resultInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultLocation: {
    color: '#aaa',
    fontSize: 13,
  },
  resultDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeText: {
    color: '#ff6666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchEvent;
