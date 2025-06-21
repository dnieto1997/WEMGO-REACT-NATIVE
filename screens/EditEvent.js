import React, {useEffect, useState} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES, icons} from '../constants';
import {launchImageLibrary} from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
import {getHttps, patchHttpsStories} from '../api/axios';
import Header from '../components/Header';
import DatePicker from 'react-native-modern-datepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';

const EditEvent = ({navigation, route}) => {
  const {id} = route.params;
  const [event, setEvent] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState('start');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const eventTypes = [
    {label: 'Conference', value: 'conference'},
    {label: 'Music Festival', value: 'music'},
    {label: 'Sports Event', value: 'sports'},
    {label: 'Networking Event', value: 'networking'},
    {label: 'Cultural Celebration', value: 'cultural'},
  ];

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await getHttps(`event/${id}`);
    
      setEvent(response.data);

      setExistingImages(JSON.parse(response.data.img || '[]'));
      if (response.data.ages) {
        const ageRange = response.data.ages.replace(/[\[\]]/g, '').split('-');
        setEvent(prev => ({
          ...prev,
          ages: {start: ageRange[0] || '', end: ageRange[1] || ''},
        }));
      }

      if (response.data.initial_date) {
        setStartDate(moment(response.data.initial_date).format('YYYY-MM-DD'));
      }
      if (response.data.final_date) {
        setEndDate(moment(response.data.final_date).format('YYYY-MM-DD'));
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'No se pudo cargar el evento.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 0}, response => {
      if (!response.didCancel && !response.errorCode) {
        const selectedImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        setNewImages([...newImages, ...selectedImages]);
      }
    });
  };

  const removeExistingImage = uri => {
    setExistingImages(existingImages.filter(img => img !== uri));
  };

  const removeNewImage = uri => {
    setNewImages(newImages.filter(img => img.uri !== uri));
  };

  const handleUpload = async () => {
    if (existingImages.length === 0 && newImages.length === 0) {
      Alert.alert('Error', 'Debe seleccionar al menos una imagen.');
      return;
    }
  
    setUpdating(true);
    setUpdateSuccess(false);
  
    let success = false;
    let attempt = 0;
  
    while (!success) {
      try {
        attempt++;
        const formData = new FormData();
  
        [...existingImages, ...newImages.map(img => img.uri)].forEach(
          (uri, index) => {
            formData.append('event', {
              uri,
              type: 'image/jpeg',
              name: `image_${index}.jpg`,
            });
          }
        );
  
        formData.append('ages', `[${event.ages.start}-${event.ages.end}]`);
        formData.append('initial_date', startDate);
        formData.append('final_date', endDate);
        formData.append('name', event.name);
        formData.append('place', event.place);
        formData.append('city', event.city);
        formData.append('country', event.country);
        formData.append('type', event.type);
        formData.append('price_ticket', event.price_ticket || '');
        formData.append('description', event.description);
  
        console.log(`🔄 Intento de actualización #${attempt}`);
  
        await patchHttpsStories(`event/${id}`, formData, true);
  
        console.log('✅ Evento actualizado correctamente');
        setUpdateSuccess(true);
        success = true; // 🚀 Si llega aquí, ya se actualizó correctamente
  
        setTimeout(() => {
          setUpdating(false);
          setUpdateSuccess(false);
          navigation.goBack();
        }, 2000);
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };
  
  

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Editar Evento" />
  
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Nombre del Evento"
              style={styles.input}
              value={event.name}
              onChangeText={text => setEvent({...event, name: text})}
            />
            <TextInput
              placeholder="Lugar"
              style={styles.input}
              value={event.place}
              onChangeText={text => setEvent({...event, place: text})}
            />
            <TextInput
              placeholder="Ciudad"
              style={styles.input}
              value={event.city}
              onChangeText={text => setEvent({...event, city: text})}
            />
            <TextInput
              placeholder="País"
              style={styles.input}
              value={event.country}
              onChangeText={text => setEvent({...event, country: text})}
            />

             <TextInput
              placeholder="Price Tickets"
              keyboardType="numeric"
              style={styles.input}
              value={event.price_ticket}
              onChangeText={text => setEvent({...event, price_ticket: text})}
            />

            <Text style={styles.label}>Edad</Text>
            <View style={styles.rowContainer}>
              <TextInput
                placeholder="Edad mínima"
                keyboardType="numeric"
                style={styles.inputHalf}
                value={event.ages?.start}
                onChangeText={value =>
                  setEvent({...event, ages: {...event.ages, start: value}})
                }
              />
              <TextInput
                placeholder="Edad máxima"
                keyboardType="numeric"
                style={styles.inputHalf}
                value={event.ages?.end}
                onChangeText={value =>
                  setEvent({...event, ages: {...event.ages, end: value}})
                }
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

            <Text style={styles.label}>Type</Text>
           
            <TouchableOpacity
  style={styles.input}
  onPress={() => setTypeModalVisible(true)}>
  <Text style={styles.textInput}>
    {eventTypes.find(item => item.value.toLowerCase() === event.type)?.label || 'Seleccione un tipo...'}
  </Text>
</TouchableOpacity>

         
            <Modal visible={isTypeModalVisible} transparent animationType="slide" onRequestClose={() => setTypeModalVisible(false)}>
  <View style={styles.modalContainer2}>
    <View style={styles.modalContent2}>
      <FlatList
        data={eventTypes}
        keyExtractor={item => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              setEvent({ ...event, type: item.value.toLowerCase() }); // ✅ Guardamos el tipo en minúsculas
              setTypeModalVisible(false);
            }}>
            <Text style={styles.modalText}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </View>
</Modal>


            <Modal
              visible={isDatePickerVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setDatePickerVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DatePicker
                    onSelectedChange={date => {
                      const formattedDate = moment(date, 'YYYY/MM/DD').format(
                        'YYYY-MM-DD',
                      );
                      if (selectedDateType === 'start') {
                        setStartDate(formattedDate);
                      } else {
                        setEndDate(formattedDate);
                      }
                      setDatePickerVisible(false);
                    }}
                  />
                </View>
              </View>
            </Modal>
            <FlatList
              data={[...existingImages.map(uri => ({uri})), ...newImages]}
              horizontal
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              renderItem={({item}) => (
                <View style={styles.imageWrapper}>
                  <Image source={{uri: item.uri}} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      item.name
                        ? removeNewImage(item.uri)
                        : removeExistingImage(item.uri)
                    }>
                    <Icon name="trash" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <Text style={styles.addButtonText}>Añadir Imagen</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              placeholder="Descripción del Evento"
              style={styles.input}
              value={event.description}
              onChangeText={text => setEvent({...event, description: text})}
            />

            <Button
              title="Actualizar Evento"
              filled
              onPress={handleUpload}
              loading={updating} // ✅ Mostrar loading en el botón al actualizar
              disabled={updating} // ✅ Deshabilitar el botón mientras actualiza
            />
          </ScrollView>
       
      </View>
      <Modal transparent visible={updating} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {updateSuccess ? (
              <Text style={styles.modalText}>
                Evento actualizado correctamente.
              </Text>
            ) : (
              <>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.modalText}>Actualizando evento...</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {flex: 1, backgroundColor: COLORS.secondaryWhite},
  container: {flex: 1, padding: 16},
  input: {borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5},
  rowContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  inputHalf: {width: '48%', borderWidth: 1, borderColor: '#ccc', padding: 10},
  imageContainer: {position: 'relative', margin: 5},
  image: {width: 100, height: 100, borderRadius: 10},
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
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
  imageWrapper: {position: 'relative', marginRight: 10},
  image: {width: 150, height: 150, borderRadius: 8},
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {color: '#fff', textAlign: 'center', fontWeight: 'bold'},
  modalOverlay: {
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
  modalText: { fontSize: 16, textAlign: 'center' },
  modalContainer2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent2: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
});

export default EditEvent;
