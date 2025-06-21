import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-virtualized-view';
import {COLORS, SIZES, FONTS, icons} from '../constants';
import {getHttps, deleteHttps} from '../api/axios'; // Asegúrate de tener la función deleteHttps para eliminar eventos.
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Tab from '../components/Tab';
import {useFocusEffect} from '@react-navigation/native';

const YourEvent = ({navigation}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchEvents = async () => {
    try {
      const response = await getHttps(`event`);

      setEvents(response.data);
    } catch (error) {
      console.log('Error al obtener eventos', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );


  const handleDelete = async eventId => {
    Alert.alert(
      'Eliminar Evento',
      '¿Seguro que quieres eliminar este evento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteHttps(`event/${eventId}`);
              setEvents(events.filter(event => event.id !== eventId));
              Alert.alert(
                'Eliminado',
                'El evento ha sido eliminado correctamente.',
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el evento.');
            }
          },
        },
      ],
    );
  };


  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Tus Eventos" />

        {loading ? (
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {events.map(event => (
              <View key={event.id} style={styles.eventContainer}>
                {/* Mostrar la primera imagen del array */}
                {event.img && JSON.parse(event.img).length > 0 ? (
                  <Image
                    source={{uri: JSON.parse(event.img)[0]}}
                    resizeMode="cover"
                    style={styles.eventImage}
                  />
                ) : (
                  <Text style={styles.noImageText}>Sin imagen</Text>
                )}

                <View style={{padding: 12}}>
                  <Text style={styles.eventTitle}>{event.name}</Text>
                  <Text style={styles.eventAddress}>{event.place}</Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      marginVertical: 10,
                      justifyContent: 'space-between',
                    }}>
                    {/* Botón Editar */}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        navigation.navigate('EditEvent', {id: event.id})
                      }>
                      <MaterialIcons
                        name="edit"
                        size={20}
                        color={COLORS.white}
                      />
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    {/* Botón Eliminar */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(event.id)}>
                      <MaterialIcons
                        name="delete"
                        size={20}
                        color={COLORS.white}
                      />
                      <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={{margin:40}}/>
      <Tab />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryBlack,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryBlack,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: SIZES.width - 32,
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    height: 16,
    width: 16,
    tintColor: COLORS.black,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Roboto Black',
    position: 'absolute',
    right: (SIZES.width - 32) / 2 - 32,
    color: 'black',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Roboto Regular',
    marginTop: 20,
  },
  eventContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.secondaryBlack,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    top: 20,
  },
  eventImage: {
    height: 180,
    width: '100%',
  },
  noImageText: {
    height: 180,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: COLORS.gray,
  },
  eventTitle: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    fontSize: 18,
  },
  eventAddress: {
   fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    fontSize: 16,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
});

export default YourEvent;
