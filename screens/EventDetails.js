import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  Share
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES} from '../constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import Button from '../components/Button';
import {getHttps, postHttps} from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentEvents from '../components/CommentEvents';
import RNBlobUtil from 'react-native-blob-util';
import FastImage from 'react-native-fast-image';
import EventLikes from '../components/EventLikes';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';




const {width} = Dimensions.get('window');

const EventDetails = ({navigation, route}) => {
  const {id} = route.params;
  const [event, setEvent] = useState(null);
  const [company, setCompany] = useState('');
  const [liked, setLiked] = useState(false);
  const [DataUser, setDataUser] = useState({});
  const [attending, setAttending] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [commentEventId, setCommentEventId] = useState(null);
    const [modalVisible1, setModalVisible1] = useState(false);
      const FIXED_HEIGHT = 450;
      const ITEM_WIDTH = Dimensions.get('window').width -20;

  // Estados para QR y modales
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [qrCoupon, setQrCoupon] = useState(null);
  const [qrDiscount, setQrDiscount] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
const [commentsModalVisible, setCommentsModalVisible] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setDataUser(parsedData);
        }
      } catch (error) {}
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const checkIfUserLiked = async () => {
      try {
        const response = await getHttps(`like-event`);
        const hasLiked = response.data.some(
          entry => entry.user == DataUser.id && entry.id_event == id,
        );
        setLiked(hasLiked);
      } catch (error) {}
    };
    if (DataUser.id) {
      checkIfUserLiked();
    }
  }, [DataUser.id, id, liked]);

  useEffect(() => {
    if (!DataUser) return;
    const fetchEvent = async () => {
      try {
        const response = await getHttps(`event/${id}`);
        fetchCompany(response.data.company);
        setEvent(response.data);
      } catch (error) {
        console.log('event');
      }
    };

    const checkIfAttending = async () => {
      try {
        const response = await getHttps(`event-user`);
        // Busca el registro del usuario para este evento
        const userEvent = response.data.find(
          entry => entry.user == DataUser.id && entry.event == id,
        );
        setAttending(!!userEvent && userEvent.status === '1');
        if (userEvent && userEvent.coupon) {
          setQrCoupon(userEvent.coupon);
          setQrDiscount(userEvent.discount);
        } else {
          setQrCoupon(null);
          setQrDiscount(null);
        }
      } catch (error) {}
    };

    checkIfAttending();
    fetchEvent();
  }, [DataUser.id, id, attending]);

  const fetchCompany = async id => {
    try {
      const response = await getHttps(`company/${id}`);
      setCompany(response.data);
    } catch (error) {}
  };

  const toggleLike = async () => {
    try {
      await postHttps('like-event', {id_event: id});
      setLiked(!liked);
    } catch (error) {
      console.error('Error al darle like');
    }
  };

const handleOption = (type) => {
  console.log(type);
  setModalVisible1(false); // ← cerrar correctamente el modal
  if (type === 'public') {
    navigation.navigate('AddPublicParche', { id });
  } else {
    navigation.navigate('PrivatePatchScreen', { id });
  }
};
  // MODIFICADO: Confirmar asistencia con modal y mostrar QR
const toggleAttendance = async () => {
  const discountValue = event?.discount ? event.discount : "0";

  if (attending) {
    try {
      await postHttps('event-user', { event: id, discount: discountValue });
      setAttending(false);
      setQrCoupon(null);
      setQrDiscount(null);
    } catch (error) {
      console.error(error);
    }
    return;
  }

  setShowAttendModal(true);
};

const confirmAttendance = async () => {
  setQrLoading(true);
  const discountValue = event?.discount ? event.discount : "0";

  try {
    const res = await postHttps('event-user', { event: id, discount: discountValue });
    
    if (discountValue === "0") {
      setAttending(true);
    } else if (res.data && res.data.coupon) {
      setQrCoupon(res.data.coupon);
      setQrDiscount(res.data.discount);
      setAttending(true);
      setShowQrModal(true);
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo registrar la asistencia.');
  }
  
  setQrLoading(false);
  setShowAttendModal(false);
};



    const handleShareProfile = async () => {
      try {
        const {data} = await getHttps(
          `shortlink/generate?type=event&id=${event.id}`,
        );
        console.log(data)
        await Share.share({
          message: `Mira este Evento en Wemgo:\n${data.url}`,
        });
      } catch (err) {
        console.error('Error al compartir perfil:', err);
      }
    };

const downloadQrImage = async () => {
  try {
    if (Platform.OS === 'android') {
      let hasPermission = false;
      let deniedMessage = '';
      let neverAskAgain = false;

      if (Platform.Version >= 33) {
        const readImagesGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Permiso para acceder a fotos',
            message: 'La app necesita acceder a tus fotos para guardar el cupón.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (readImagesGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          neverAskAgain = true;
          deniedMessage = 'Debes habilitar el permiso de fotos manualmente en la configuración del sistema.';
        } else if (readImagesGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          deniedMessage = 'Debes permitir acceso a las fotos para guardar el cupón.';
        }
        hasPermission = readImagesGranted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const writeGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permiso para guardar imagen',
            message: 'La app necesita guardar el cupón en tu almacenamiento.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (writeGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          neverAskAgain = true;
          deniedMessage = 'Debes habilitar el permiso de almacenamiento manualmente en la configuración del sistema.';
        } else if (writeGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          deniedMessage = 'Debes permitir acceso al almacenamiento para guardar el cupón.';
        }
        hasPermission = writeGranted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!hasPermission) {
        Alert.alert(
          'Permiso denegado',
          deniedMessage || 'No se pudo guardar la imagen.',
          neverAskAgain
            ? [
                {
                  text: 'Ir a configuración',
                  onPress: () => {
                    if (Platform.OS === 'android') {
                      Linking.openSettings();
                    }
                  },
                },
                { text: 'Cerrar', style: 'cancel' },
              ]
            : [{ text: 'Cerrar', style: 'cancel' }]
        );
        return;
      }

      const fileName = `wemgo-cupon-${Date.now()}.png`;
      const downloadPath = `${RNBlobUtil.fs.dirs.DownloadDir}/${fileName}`;

      await RNBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: downloadPath, // Esto asegura que va a /storage/emulated/0/Download
          description: 'Cupón Wemgo',
          mime: 'image/png',
          mediaScannable: true,
        },
      }).fetch('GET', qrCoupon);

      Alert.alert('Cupón guardado', 'El cupón se guardó en la carpeta Descargas.');
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo guardar la imagen.');
  }
};

  if (!event || !DataUser)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Cargando evento...</Text>
      </View>
    );

  let images = [];
  try {
    images = JSON.parse(event.img.replace(/'/g, '"'));
  } catch (error) {
    console.log('img');
  }

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Detalles del evento" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.cardContainer}>
            {images.length > 0 ? (
              <>
                <FlatList
                  data={images}
                  horizontal
                  keyExtractor={(img, index) => index.toString()}
                  renderItem={({item}) => (
                     <View
                                        style={{
        width: ITEM_WIDTH,
        height: FIXED_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }}>
                    <FastImage source={{uri: item}}  style={{width: ITEM_WIDTH, height: FIXED_HEIGHT}} />
                    </View>
                  )}
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToAlignment="center"
                />
              </>
            ) : (
              <View style={[styles.eventImage, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#222'}]}>
  <MaterialIcons name="image" size={60} color="#aaa" />
</View>
            )}
      <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 10}}>
  {/* Botón Me gusta */}
  <View style={{alignItems: 'center'}}>
    <TouchableOpacity onPress={toggleLike}>
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={30}
        color={liked ? 'red' : 'gray'}
      />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setLikesModalVisible(true)}>
      <Text style={{fontSize: 12, color: 'gray'}}>
        {event?.total_likes || 0} {event?.total_likes === 1 ? 'like' : 'likes'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Botón Comentarios */}
  <View style={{alignItems: 'center'}}>
    <TouchableOpacity
      onPress={() => {
        setCommentEventId(event.id);
        setModalVisible(true);
      }}>
      <Ionicons name="chatbubble-outline" size={30} color="gray" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setCommentsModalVisible(true)}>
      <Text style={{fontSize: 12, color: 'gray'}}>
        {event?.total_comments || 0}{' '}
        {event?.total_comments === 1 ? 'comentario' : 'comentarios'}
      </Text>
    </TouchableOpacity>
  </View>

    <View style={{alignItems: 'center'}}>
      <TouchableOpacity
                onPress={() => {
                  handleShareProfile();
                }}
                >
                <Ionicons
                  name="share-social-outline"
                  size={30}
                  color="white"
                />
              </TouchableOpacity>
                <Text style={{fontSize: 12, color: 'gray'}}>
       Compartir
      </Text>
  </View>

  {/* Botón Armar Parche */}
  <View style={{alignItems: 'center', opacity: attending ? 1 : 0.4}}>
    <TouchableOpacity
      onPress={() => attending && setModalVisible1(true)}
      disabled={!attending}>
      <Ionicons
        name="people"
        size={30}
        color={attending ? COLORS.primary : 'gray'}
      />
    </TouchableOpacity>
    <Text
      style={{
        fontSize: 12,
        color: attending ? COLORS.primary : 'gray',
        marginTop: 4,
      }}>
      Parche
    </Text>
  </View>


</View>


            {/* OJO para ver el cupón si ya está registrado */}
{/*             {attending && qrCoupon && (
              <TouchableOpacity
                style={{alignItems: 'center', marginTop: 12}}
                onPress={() => setShowQrModal(true)}
              >
                <Ionicons name="eye" size={30} color={COLORS.primary} />
                <Text style={{fontSize: 12, color: COLORS.primary}}>Ver cupón</Text>
              </TouchableOpacity>
            )} */}

            {/* Fecha del evento */}
            <View style={styles.eventDateContainer}>
              <Text style={styles.eventDateDay}>
                {new Date(event.initial_date).getDate()}
              </Text>
              <Text style={styles.eventDateMonth}>
                {new Date(event.initial_date).toLocaleString('es-ES', {
                  month: 'long',
                })}
              </Text>
            </View>

            {/* Organizador */}
            <View style={styles.organizerContainer}>
              <View style={{flexDirection: 'row'}}>
             <View style={styles.avatar}>
  <MaterialIcons name="person" size={36} color="#ccc" />
</View>
                <TouchableOpacity style={{marginLeft: 12}}>
                  <Text style={styles.eventTitle}>
                    Organizado Por: {company.name}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rayita} />

            {/* Información del evento */}
            <View style={{paddingHorizontal: 16}}>
              {/* Fecha y Hora */}
              <View style={{flexDirection: 'row', marginTop: 16}}>
                <View style={styles.iconContainer}>
                <MaterialIcons name="calendar-today" size={20} color="white" />
                </View>

                <View style={{marginLeft: 12}}>
                  <Text style={styles.iconTitle}>
                    {new Date(event.initial_date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                  <Text style={styles.iconSubtitle}>
                    Inicio: {new Date(event.initial_date).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                 <MaterialIcons name="calendar-today" size={20} color="white" />
                </View>
                <View style={{marginLeft: 12}}>
                  <Text style={styles.iconTitle}>
                    {new Date(event.final_date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                  <Text style={styles.iconSubtitle}>
                    Fin: {new Date(event.final_date).toLocaleTimeString()}
                  </Text>
                </View>
              </View>

              <View style={styles.rayita} />

              {/* Ubicación */}
              <View style={{flexDirection: 'row', marginTop: 8}}>
                <View
                  style={[styles.iconContainer, {backgroundColor: '#3d9aff'}]}>
                 <MaterialIcons name="location-on" size={20} color="white" />
                </View>
                <View style={{marginLeft: 12}}>
                  <Text style={styles.iconTitle}>
                    {event.place}, {event.city}, {event.country}
                  </Text>
                </View>
              </View>

              <View style={styles.rayita} />
              {/* Descripción */}
              <Text style={styles.descripcion}>Descripción:</Text>

              <Text style={styles.description}>{event.description}</Text>

              {/* Precio del ticket */}
              <View style={{marginBottom: 24}}>
               {/*  <View
                  style={{flexDirection: 'row', alignItems: 'center', top: 12}}>
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color="white"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.price}>
                    Precio:{' '}
                    {parseFloat(event.price_ticket) > 0
                      ? `$${event.price_ticket}`
                      : 'Gratis'}
                  </Text>
                </View> */}
              </View>
            </View>
          </View>

          <Button
            title={attending ? 'Cancelar asistencia' : 'Confirmar Asistencia'}
            filled
            onPress={toggleAttendance}
          />
        </ScrollView>
      </View>

      {/* Modal de confirmación de asistencia */}
      <Modal
        visible={showAttendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttendModal(false)}
      >
        <View style={{
          flex:1,
          backgroundColor:'rgba(0,0,0,0.7)',
          justifyContent:'center',
          alignItems:'center'
        }}>
          <View style={{
            backgroundColor:'white',
            borderRadius:16,
            padding:24,
            width:'80%',
            alignItems:'center'
          }}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:8, color:'black'}}>¿Quieres asistir a este evento?</Text>
            <Text style={{ fontSize: 16, color: 'black', marginBottom: 16 }}>
        {event.discount && Number(event.discount) > 0
          ? `Obtendrás un cupón de descuento del ${event.discount}%`
          : '¿Confirmas tu asistencia al evento?'}
      </Text>
            <View style={{flexDirection:'row', marginTop:8}}>
              <TouchableOpacity
                style={{marginRight:16, backgroundColor:'#ccc', padding:10, borderRadius:8}}
                onPress={() => setShowAttendModal(false)}
              >
                <Text style={{color:'black'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{backgroundColor:COLORS.primary, padding:10, borderRadius:8}}
                onPress={confirmAttendance}
                disabled={qrLoading}
              >
                <Text style={{color:'white'}}>{qrLoading ? 'Procesando...' : 'Sí, asistir'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para mostrar QR y guardar */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={{
          flex:1,
          backgroundColor:'rgba(0,0,0,0.7)',
          justifyContent:'center',
          alignItems:'center'
        }}>
          <View style={{
            backgroundColor:'white',
            borderRadius:16,
            padding:24,
            width:'80%',
            alignItems:'center'
          }}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:8, color:'black'}}>¡Cupón generado!</Text>
            <Text style={{fontSize:16, color:'black', marginBottom:16}}>
              Muestra este QR en el evento para tu descuento del <Text style={{fontWeight:'bold'}}>{qrDiscount}%</Text>
            </Text>
            <Image
              source={{uri: qrCoupon}}
              style={{width:200, height:200, marginBottom:16}}
            />
            <TouchableOpacity
              style={{backgroundColor:COLORS.primary, padding:10, borderRadius:8, marginBottom:8}}
              onPress={downloadQrImage}
            >
              <Text style={{color:'white'}}>Guardar cupón en mi celular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{backgroundColor:'#ccc', padding:10, borderRadius:8}}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={{color:'black'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

       <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible1}
        onRequestClose={() => setModalVisible1(false)}>
        <View style={styles.modalOverlay1}>
          <View style={styles.modalContainer1}>
            <Text style={styles.modalTitle1}>¿Qué tipo de parche deseas crear?</Text>

            <TouchableOpacity
              style={styles.optionButton1}
              onPress={() => handleOption('public')}>
              <Text style={styles.optionText1}>Público</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton1, {backgroundColor: '#444'}]}
              onPress={() => handleOption('private')}>
              <Text style={styles.optionText1}>Privado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton1}
              onPress={() => setModalVisible1(false)}>
              <Text style={styles.cancelText1}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <EventLikes
  eventId={event.id}
  isVisible={likesModalVisible}
  onClose={() => setLikesModalVisible(false)}
/>

      <CommentEvents
        eventId={event.id}
        isVisible={isModalVisible}
        eventOwnerId={event.company}
        onClose={() => setModalVisible(false)}
        onCommentAdded={() => {}}
        onCommentDeleted={() => {}}
      />
    </SafeAreaView>
  );
};

// 🔹 **Estilos**
const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: 'black',
  },
  rayita: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    width: '100%',
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  reactionButton: {
    alignItems: 'center',
  },
  reactionText: {
    fontSize: 12,
    color: 'gray',
  },
  descripcion: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },

  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  cardContainer: {
    backgroundColor: 'black',
    width: SIZES.width - 32,
    top: 10,
  },
  eventImage: {
    width: width * 1.0,
    height: 300,
    borderRadius: 16,
    marginRight: 5,
  },
  eventDateContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#419aff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 4,
    width: 100,
    height: 80,
  },

  LikeContainer: {
    position: 'absolute',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 4,
    top: 210,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 4,
  },

  map: {
    height: 152,
    marginVertical: 22,
  },

  icon: {
    height: 20,
    width: 20,
    tintColor: 'black',
  },

  eventDateDay: {
    fontSize: 23,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  eventDateMonth: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  organizerContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    top: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  eventRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  eventRating: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: COLORS.black,
    marginLeft: 4,
  },
  btnFollow: {
    width: 75,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.transparentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followText: {
    color: COLORS.purple,
    fontSize: 14,
    fontFamily: 'Roboto Regular',
  },
  eventName: {
    fontSize: 22,
    fontFamily: 'Roboto Bold',
    color: COLORS.primary,
  },
  iconContainer: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.purple,
  },
  icon: {
    height: 20,
    width: 20,
    tintColor: COLORS.white,
  },
  iconTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  iconSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    color: 'white',
    top: 5,
  },
  btnRead: {
    width: 104,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.tansparentPrimary,
    borderRadius: 14,
    marginTop: 12,
  },
  map: {
    height: 152,
    zIndex: 1,
    marginVertical: 22,
  },
  // Callout bubble
  bubble: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
    width: 'auto',
  },
  // Arrow below the bubble
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#007a87',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryWhite,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  likeIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain', // Asegura que la imagen mantiene su color original
  },
  likeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    textAlign: 'center',
  },

     buttonContainer1: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText1: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay1: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer1: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle1: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton1: {
    backgroundColor: '#944af5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  optionText1: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cancelButton1: {
    marginTop: 10,
  },
  cancelText1: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },

});

export default EventDetails;
