import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Modal,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {COLORS, SIZES, FONTS, images} from '../constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {photosData} from '../data';
import PhotoCard from '../components/PhotoCard';
import SubHeader from '../components/SubHeader';
import EventItem from '../components/EventItem';
import {ScrollView} from 'react-native-virtualized-view';
import {getHttps, postHttps} from '../api/axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Tab from '../components/Tab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Icono de "X" para limpiar
import { SocketContext } from '../context/SocketContext';

const FriendTimeline = ({navigation, route}) => {
  const {id} = route.params;


  const [user, setUser] = useState({});
  const [feed, setfeed] = useState({});
  const [DataUser, setDataUser] = useState({});
  const [Followers, setFollowers] = useState('');
  const [Following, setFollowing] = useState('');
  const [likeEvent, setlikeEvent] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [eventGoing, setEventGoing] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
    const {sendToggleNotification} = useContext(SocketContext);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        EventGoing(parsedData.id);
        setDataUser(parsedData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const EventGoing = async id => {
    try {
      const response = await getHttps(`event-user/eventbyuser/${id}`);
      setEventGoing(response.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const UserInformation = async () => {
    try {
      const response = await getHttps(`users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const FindFollow = async () => {
    try {
      const response = await getHttps(`followers/${id}`);
      setFollowers(response.data.followers);
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const FindFeed = async () => {
    try {
      const response = await getHttps(`feed/search/${id}`);
      
      setfeed(response.data);
    } catch (error) {
      console.error('', 'Error fetching followers:', error);
    }
  };

  const FindEvent = async () => {
    try {
      const response = await getHttps(`like-event/${id}`);
      setlikeEvent(response.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await getHttps(`followers/status/${id}`);
      setIsFollowing(response.data.siguiendo);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const maxLength = 60; // caracteres visibles
  const description = user.description || '';

  const shortDescription =
    description.length > maxLength
      ? description.substring(0, maxLength).trim() + '...'
      : description;

  useEffect(() => {
    setIsTruncated(description.length > maxLength);
  }, [description]);

  const handleFollow = async () => {
    try {
      const response = await getHttps(`followers/toggle/${id}`);
      const isNowFollowing = response.data.siguiendo;
         
      setIsFollowing(response.data.siguiendo);
      setFollowers(prev => (response.data.siguiendo ? prev + 1 : prev - 1));
       if (isNowFollowing) {
      sendToggleNotification?.({
        followerId: DataUser.id,
        followedId:id
      });
    }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  useEffect(() => {
    UserInformation();
    FindFollow();
    FindFeed();
    FindEvent();
    checkFollowStatus();
    loadUserData();
  }, [id]);

  return (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.profileContainer}>
            <View style={styles.headerProfileContainer}>
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate('Main');
                    }
                  }}
                  style={styles.headerIcon}>
                  <AntDesign name="arrowleft" color={COLORS.black} size={24} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 16,
                  marginTop: 30,
                }}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Image
                    source={{uri: String(user.img)}}
                    resizeMode="cover"
                    style={styles.avatar}
                  />
                </TouchableOpacity>
                <View style={{marginLeft: 16}}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={styles.name}>
    {user.first_name + ' ' + user.last_name}
  </Text>

  {user.checked == "1" && (
       <MaterialIcons
         name="verified"
         size={18}
         color="#3897f0"
         style={{ marginLeft: 6 }}
       />
  )}
</View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: 216,
                      marginTop: 8,
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('Followers', {id: id})
                      }>
                      <View style={{alignItems: 'center'}}>
                        <Text style={styles.numItem}>{Followers}</Text>
                        <Text style={styles.nameItem}>Seguidores</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.line} />
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('Following', {id: id})
                      }>
                      <View style={{alignItems: 'center'}}>
                        <Text style={styles.numItem}>{Following}</Text>
                        <Text style={styles.nameItem}>Siguiendo</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={{paddingHorizontal: 16}}>
              <Text
                style={[styles.address, {flexWrap: 'wrap'}]}
                numberOfLines={4}
                ellipsizeMode="tail">
                {user.description || ''}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              {/* Botón Seguir */}
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing ? styles.following : styles.notFollowing,
                ]}
                onPress={handleFollow}>
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons
                    name={isFollowing ? 'account-remove' : 'account-check'}
                    color={COLORS.black}
                    size={24}
                  />
                  <Text style={styles.buttonText}>
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botón Mensaje */}
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => navigation.navigate('MessageDetails', {id})}>
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons
                    name="message-plus-outline"
                    color={COLORS.black}
                    size={24}
                  />
                  <Text style={styles.buttonText}>Mensaje</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: 'black',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}></View>

              <FlatList
                data={feed}
                numColumns={3}
                keyExtractor={(item, index) =>
                  `${item.users_id.toString()}+${index}`
                }
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => {
                  let imageUrl = null;
                  try {
                    const parsedThumbnails = JSON.parse(item.thumbnail);
                    const parsedImages = JSON.parse(item.feed_img);

                    // Detectar si es video o imagen
                    const isVideo = url => {
                      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
                      return videoExtensions.some(ext =>
                        url.toLowerCase().endsWith(ext),
                      );
                    };

                    if (
                      Array.isArray(parsedImages) &&
                      parsedImages.length > 0 &&
                      parsedImages[0]
                    ) {
                      const originalUrl = parsedImages[0];

                      if (isVideo(originalUrl)) {
                        // Si es video, usar el URL original del video
                        imageUrl = {uri: originalUrl};
                      } else if (
                        Array.isArray(parsedThumbnails) &&

                        parsedThumbnails[0]
                      ) {
                        // Si es imagen y hay thumbnail, usar thumbnail
                        imageUrl = {uri: parsedThumbnails[0]};
                      
                      } else {
                        
                        imageUrl = {uri: originalUrl};
                      }
                    }
                  } catch (error) {
                    console.log('Error parsing img/thumbnail:', error);
                  }

                  return (
                    <PhotoCard
                      image={imageUrl}
                      comments={item.commentCount}
                      likes={item.likeCount}
                      id={item.feed_id}
                      idUser={id}
                    />
                  );
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{margin: 40}} />
      <Tab />
      <Modal
        visible={showFullDescription}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFullDescription(false)}>
        <View style={modalStyles.container}>
          <View style={modalStyles.content}>
            <ScrollView>
              <Text style={modalStyles.description}>{description}</Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setShowFullDescription(false)}>
              <Text style={modalStyles.closeButton}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {/* Botón de cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <MaterialCommunityIcons
              name={'close'}
              color={COLORS.black}
              size={24}
            />
          </TouchableOpacity>

          {/* Imagen completa */}
          <Image
            source={{uri: String(user.img)}}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};
const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    textAlign: 'center',
    color: 'blue',
    marginTop: 15,
    fontWeight: 'bold',
  },
});
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 50,
    zIndex: 10,
    width: 40,
    height: 40,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  profileContainer: {
    width: SIZES.width,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: 'black',
  },
  headerProfileContainer: {
    height: 174,
    backgroundColor: '#944af5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 36,
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcon: {
    height: 40,
    width: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: 94,
    height: 94,
    borderColor: COLORS.white,
    borderWidth: 1,
    borderRadius: 100,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  numItem: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  nameItem: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    fontWeight: 'bold',
  },
  line: {
    height: 41,
    width: 1,
    borderColor: 'rgba(0, 0, 0,.3)',
    borderWidth: 0.2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  followButton: {
    paddingVertical: 6, // 🔹 Menos altura
    paddingHorizontal: 12, // 🔹 Más compacto
    borderRadius: 6,
    marginRight: 6, // 🔹 Espaciado entre botones
    alignItems: 'center',
    justifyContent: 'center',
  },
  following: {
    backgroundColor: COLORS.gray,
  },
  notFollowing: {
    backgroundColor: COLORS.primary,
  },
  messageButton: {
    paddingVertical: 6, // 🔹 Menos altura
    paddingHorizontal: 12, // 🔹 Más compacto
    borderRadius: 6,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 14, // 🔹 Tamaño reducido
    marginLeft: 5, // 🔹 Espacio más ajustado
  },
});

export default FriendTimeline;
