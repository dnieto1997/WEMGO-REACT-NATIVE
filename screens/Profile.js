import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, images } from '../constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ScrollView } from 'react-native-virtualized-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHttps } from '../api/axios';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Icono de "X" para limpiar
import PhotoCard from '../components/PhotoCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhotoCardEliminate from '../components/PhotoCardEliminate';
import Tab from '../components/Tab';

const Profile = ({ navigation }) => {
  const route = useRoute();
  const [DataUser, setDataUser] = useState({});
  const [Followers, setFollowers] = useState('');
  const [Following, setFollowing] = useState('');
  const [countEvent, setcountEvent] = useState('');
  const [feed, setUserFeeds] = useState([]);
  const [User, setUser] = useState({});
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Compara dos objetos shallow (solo para props simples)
  const shallowEqual = (obj1, obj2) => {
    if (!obj1 || !obj2) return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) return false;
    }
    return true;
  };

  // Compara dos arrays de feeds por id y campos principales
  const feedsAreEqual = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].feed_id !== arr2[i].feed_id) return false;
      if (arr1[i].likeCount !== arr2[i].likeCount) return false;
      if (arr1[i].commentCount !== arr2[i].commentCount) return false;
      if (arr1[i].feed_description !== arr2[i].feed_description) return false;
    }
    return true;
  };

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setDataUser(parsedData);

        // User
        const userRes = await getHttps(`users/${parsedData.id}`);
        if (!shallowEqual(userRes.data, User)) setUser(userRes.data);

        // Followers/Following
        const followRes = await getHttps(`followers/${parsedData.id}`);
        if (Followers !== followRes.data.followers) setFollowers(followRes.data.followers);
        if (Following !== followRes.data.following) setFollowing(followRes.data.following);

        // Events
        const eventRes = await getHttps(`event-user/countbyuser/${parsedData.id}`);
        if (countEvent !== eventRes.data) setcountEvent(eventRes.data);

        // Feeds
        const feedRes = await getHttps(`feed/search/${parsedData.id}`);
        if (!feedsAreEqual(feed, feedRes.data)) setUserFeeds(feedRes.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Función para obtener seguidores y seguidos
  const FindFollow = async userId => {
    try {
      const response = await getHttps(`followers/${userId}`);
      setFollowers(response.data.followers);
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const loadUserFeeds = async userId => {
    try {
      const response = await getHttps(`feed/search/${userId}`);
      setUserFeeds(response.data);
    } catch (error) {
      console.error('Error fetching user feeds:', error);
    }
  };

  const eventGoing = async count => {
    if (count == 0) {
      Alert.alert('Aviso', 'No has seleccionado Eventos');
    } else {
      navigation.navigate('YourEvent');
    }
  };

  const fetchUserData = async id => {
    try {
      const response = await getHttps(`users/${id}`);
      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const UserEvent = async userId => {
    const response = await getHttps(`event-user/countbyuser/${userId}`);

    setcountEvent(response.data);
  };


  // Solo refresca si route.params?.shouldRefresh es true, si no, mantiene el estado
  useFocusEffect(
    useCallback(() => {
      if (route.params?.shouldRefresh) {
        loadUserData();
        UserEvent(DataUser.id);
        // Limpia el flag para evitar recarga innecesaria
        navigation.setParams({ shouldRefresh: false });
      }
    }, [route.params?.shouldRefresh])
  );

  // Carga inicial solo una vez
  useEffect(() => {
    loadUserData();
    UserEvent(DataUser.id);
  }, []);

  // User Profile Info
  const renderUserProfileInfo = () => {
    return (
      <View style={styles.card}>
        {User.img ? (
          <FastImage
            source={{ uri: User.img }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <FastImage
            source={images.avatar2}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {User.first_name + ' ' + User.last_name}
          </Text>
          {User.checked == '1' && (
            <MaterialIcons
              name="verified"
              size={18}
              color="#3897f0"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Message')}
            style={[styles.btn, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.btnText}>WemChat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Parches')}
            style={[
              styles.btn,
              {
                backgroundColor: COLORS.white,
                flex: 1,
                marginLeft: 8,
              },
            ]}>
            <Text style={styles.btnText}>Parches</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separateLine} />
        <View style={styles.countersContainer}>
          <View style={styles.countersView}>
            <Text style={styles.countersNum}>{feed.length}</Text>
            <Text style={styles.countersText}>MomentGo</Text>
          </View>

          <View style={styles.line} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Followers', { id: DataUser.id })}>
            <View style={styles.countersView}>
              <Text style={styles.countersNum}>{Followers}</Text>
              <Text style={styles.countersText}>Seguidores</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.line} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Following', { id: DataUser.id })}>
            <View style={styles.countersView}>
              <Text style={styles.countersNum}>{Following}</Text>
              <Text style={styles.countersText}>Siguiendo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Profile Links
  const renderLinks = () => {
    const links = [

      {
        title: 'Editar Perfil',
        onPress: () => navigation.navigate('ProfileDetails'),
        icon: 'edit',
      },
      {
        title: 'Configuración',
        onPress: () => navigation.navigate('Settings'),
        icon: 'setting',
      },
    ];

    if (DataUser.role !== 'USER') {
      links.push({
        title: 'Tus Eventos',
        onPress: () => navigation.navigate('YourEvent'),
        icon: 'appstore1',
      });
    }

    return (
      <View style={styles.linkCard}>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            onPress={link.onPress}
            style={styles.linkItem}>
            <View style={styles.linkLeft}>
              <AntDesign name={link.icon} size={20} color="#fff" />
              <Text style={styles.linkText}>{link.title}</Text>
            </View>
            <AntDesign name="right" size={16} color="#888" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderUserFeeds = () => {
    // Helper para detectar videos por extensión
    const isVideo = url => {
      if (!url || typeof url !== 'string') return false;
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
      return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    return (
      <>
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
          keyExtractor={(item, index) => `${item.users_id.toString()}+${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
         renderItem={({ item, index }) => {
  let imageProps = null;
  try {
    const parsedThumbnails = JSON.parse(item.thumbnail);
    const parsedImages = JSON.parse(item.feed_img);

    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
      
      const originalUrl = parsedImages[0];
      console.log(originalUrl)
      const isVideoPost = isVideo(originalUrl);
      const thumbnailUrl = Array.isArray(parsedThumbnails) ? parsedThumbnails[0] : null;

      imageProps = isVideoPost
        ? { uri: originalUrl, thumbnail: thumbnailUrl }
        : { uri: originalUrl };
    }
  } catch (error) {
    console.log('Error parsing feed_img/thumbnail:', error);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Post', {
        id: item.feed_id,
        index,
        from: 'Profile',
        userId: DataUser.id,
      })}
    >
      <View style={{
        aspectRatio: 1,
        width: SIZES.width / 3.5,
        height: SIZES.width / 3.5,
        margin: 4,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <PhotoCardEliminate
  image={imageProps}
  id={item.feed_id}
  idUser={DataUser.id}
  reloadFeeds={loadUserData} // ✅ esta línea es la que hace que se actualice
/>
      </View>
    </TouchableOpacity>
  );
}}

        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.container2}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={22} color={COLORS.black} />
          </TouchableOpacity>

          <Text style={styles.title}>Perfil</Text>

          <TouchableOpacity
            onPress={() => setSettingsVisible(true)} // activa modal u opciones
            style={styles.iconContainer}>
            <Ionicons name="settings-outline" size={22} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderUserProfileInfo()}
          {renderUserFeeds()}

          <View style={{ margin: 50 }} />
        </ScrollView>
      </View>
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPressOut={() => setSettingsVisible(false)}>
          <View
            style={{
              backgroundColor: '#1e1e1e',
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
            {renderLinks()}
          </View>
        </TouchableOpacity>
      </Modal>

      <Tab/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  container2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  point: {
    position: 'absolute',
    top: 0,
    right: 8,
    height: 4,
    width: 4,
    borderRadius: 999,
    backgroundColor: COLORS.red,
    zIndex: 999,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  card: {
    width: SIZES.width - 32,
    paddingTop: 32,
    backgroundColor: 'black',
    borderRadius: 10,
    height: 302,
    marginVertical: 16,
    alignItems: 'center',
  },
  avatar: {
    height: 82,
    width: 82,
    borderRadius: 999,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  address: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  nameContainer: {
    marginVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  btn: {
    width: 100,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins-Bold',
    color: COLORS.black,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  btnText: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.black,
    fontSize: 14,
    textAlign: 'center',
  },
  btnContainer: {
    flexDirection: 'row',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SIZES.width - 96,
    marginTop: 8,
  },
  countersView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countersNum: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  countersText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    marginTop: 4,
  },
  line: {
    borderRightColor: 'rgba(0, 0, 0, .1)',
    borderRightWidth: 1,
  },
  separateLine: {
    width: '100%',
    borderWidth: 0.3,
    borderColor: 'rgba(0, 0, 0, .1)',
    marginTop: 32,
  },
  linkCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, .1)',
    paddingBottom: 8,
  },
  linkName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  linkRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    marginRight: 10,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  feedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  feedDescription: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.white,
  },
});

export default Profile;
