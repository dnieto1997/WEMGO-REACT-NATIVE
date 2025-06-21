import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES, icons} from '../constants';
import RNPickerSelect from 'react-native-picker-select';
import DatePicker from 'react-native-modern-datepicker';
import {launchImageLibrary} from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
import {postHttpsStories} from '../api/axios';
import Header from '../components/Header';

const CreateEvent = ({navigation}) => {
  const [eventName, setEventName] = useState('');
  const [place, setPlace] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [ages, setAges] = useState({start: '', end: ''});
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [price, setPrice] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState('start');
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
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

  const selectImages = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 10, // Permite seleccionar hasta 10 imágenes
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Selección de imagen cancelada');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo acceder a la galería.');
      } else {
        setSelectedMedia(response.assets || []);
      }
    });
  };

  const handleUpload = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Error', 'Debe seleccionar al menos una imagen.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      selectedMedia.forEach((media, index) => {
        formData.append('event', {
          uri: media.uri,
          type: media.type || 'image/jpeg',
          name: `story_${index}.jpg`,
        });
      });

      formData.append('name', eventName);
      formData.append('place', place);
      formData.append('type', eventType);
      formData.append('city', city);
      formData.append('country', country);
      formData.append('price_ticket', price);
      formData.append('initial_date', startDate);
      formData.append('final_date', endDate);
      formData.append('description', description);

      if (ages.start && ages.end) {
        formData.append('ages', `[${ages.start}-${ages.end}]`);
      }

      await postHttpsStories('event', formData, true);
      Alert.alert('Éxito', 'Evento subido correctamente.');

      navigation.goBack();
    } catch (error) {
      console.error('Error subiendo evento:', error);
      Alert.alert('Error', 'No se pudo subir el evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.area}>
    
      <View style={styles.container}>

        <Header title="Create Event"/>
      
    
        <ScrollView showsVerticalScrollIndicator={false}>
        
          <View style={{top:15}}>
            <TextInput
              placeholder="Event Name"
              style={styles.input}
              onChangeText={setEventName}
            />
            <TextInput
              placeholder="Place"
              style={styles.input}
              onChangeText={setPlace}
            />
            <TextInput
              placeholder="City"
              style={styles.input}
              onChangeText={setCity}
            />
            <TextInput
              placeholder="Country"
              style={styles.input}
              onChangeText={setCountry}
            />

            <Text style={styles.label}>Type</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setTypeModalVisible(true)}>
              <Text style={styles.textInput}>
                {eventType || 'Select an item...'}
              </Text>
            </TouchableOpacity>

            {/* Modal para seleccionar Tipo de Evento */}
            <Modal
              visible={isTypeModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setTypeModalVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={eventTypes}
                    keyExtractor={item => item.value}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setEventType(item.label);
                          setTypeModalVisible(false);
                        }}>
                        <Text style={styles.modalText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
               <Text>Ages</Text>
            <View style={styles.rowContainer}>
           
              <TextInput
                placeholder="Start Age"
                keyboardType="numeric"
                style={styles.inputHalf}
                onChangeText={value => setAges({...ages, start: value})}
              />
              <TextInput
                placeholder="End Age"
                keyboardType="numeric"
                style={styles.inputHalf}
                onChangeText={value => setAges({...ages, end: value})}
              />
            </View>

            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setSelectedDateType('start');
                setDatePickerVisible(true);
              }}>
              <Text style={styles.textInput}>
                {startDate || 'Select a date...'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setSelectedDateType('end');
                setDatePickerVisible(true);
              }}>
              <Text style={styles.textInput}>
                {endDate || 'Select a date...'}
              </Text>
            </TouchableOpacity>

            {/* Modal para seleccionar Fechas */}
            <Modal
              visible={isDatePickerVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setDatePickerVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DatePicker
                    onSelectedChange={date => {
                      if (selectedDateType === 'start') {
                        setStartDate(date);
                      } else {
                        setEndDate(date);
                      }
                      setDatePickerVisible(false);
                    }}
                  />
                </View>
              </View>
            </Modal>

            <TouchableOpacity style={styles.button} onPress={selectImages}>
              <FontAwesome name="camera" size={24} color={COLORS.black} />
              <Text>Add Images</Text>
            </TouchableOpacity>

            <ScrollView horizontal>
              {selectedMedia.map((img, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{uri: img.uri}} style={styles.image} />
                </View>
              ))}
            </ScrollView>

            <TextInput
              placeholder="Price Ticket"
              style={styles.input}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Event Description"
              style={styles.input}
              onChangeText={setDescription}
            />

            <Button
              title="Publish Event"
              filled
              onPress={handleUpload}
              loading={loading}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {flex: 1, backgroundColor: COLORS.secondaryWhite},
  container: {flex: 1, backgroundColor: COLORS.secondaryWhite, padding: 16},
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: SIZES.width - 32,
    margin:10
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {height: 16, width: 16, tintColor: COLORS.black},
  headerTitle: {fontSize: 22, fontFamily: 'Roboto Black', color: 'black'},
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginVertical: 6,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  rowContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  inputHalf: {
    width: '48%',
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    marginVertical: 10,
  },
  imageContainer: {width: 100, height: 100, borderRadius: 10, marginRight: 10},
  image: {width: '100%', height: '100%', borderRadius: 10},
  container: {flex: 1, padding: 16, backgroundColor: COLORS.secondaryWhite},
  label: {fontSize: 16, fontWeight: 'bold', marginBottom: 5},
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  textInput: {fontSize: 16, color: 'gray'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  modalText: {fontSize: 18},
});

export default CreateEvent;
