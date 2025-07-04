import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, FONTS, SIZES, images} from '../constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ScrollView} from 'react-native-virtualized-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getHttps} from '../api/axios';
import {useFocusEffect} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PhotoCardEliminate from '../components/PhotoCardEliminate';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Tab from '../components/Tab';

const Profile = ({navigation}) => {
  const [DataUser, setDataUser] = useState({});
  const [Followers, setFollowers] = useState('');
  const [Following, setFollowing] = useState('');
  const [countEvent, setcountEvent] = useState('');
  const [feed, setUserFeeds] = useState([]);
  const [User, setUser] = useState({});
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setDataUser(parsedData);
        fetchUserData(parsedData.id);
        FindFollow(parsedData.id);
        UserEvent(parsedData.id);
        loadUserFeeds(parsedData.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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

  const fetchUserData = async id => {
    try {
      const response = await getHttps(`users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const UserEvent = async userId => {
    const response = await getHttps(`event-user/countbyuser/${userId}`);
    setcountEvent(response.data);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      UserEvent(DataUser.id);
    }, [])
  );

  const renderLinks = () => {
    const links = [
      {title: 'Editar Perfil', onPress: () => navigation.navigate('ProfileDetails'), icon: 'edit'},
      {title: 'Configuración', onPress: () => navigation.navigate('Settings'), icon: 'setting'},
    ];

    if (DataUser.role !== 'USER') {
      links.push({title: 'Tus Eventos', onPress: () => navigation.navigate('YourEvent'), icon: 'appstore1'});
    }

    return (
      <View style={styles.linkCard}>
        {links.map((link, index) => (
          <TouchableOpacity key={index} onPress={link.onPress} style={styles.linkItem}>
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

  const renderUserProfileInfo = () => {
    return (
      <View style={styles.card}>

   <View style={styles.avatarContainer}>
  <Image
    source={User.img ? { uri: User.img } : { uri: 'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png' }}
    resizeMode="cover"
    style={styles.avatar}
  />
  {User.checked === '1' && (
    <View style={styles.checkIconContainer}>
      <MaterialIcons name="verified" size={24} color="#3897f0" />
    </View>
  )}
</View>

      
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{User.first_name + ' ' + User.last_name}</Text>
       
        </View>
        <Text style={styles.description}>{User.description }</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Message')} style={styles.btnPurple}>
            <Text style={styles.btnTextWhite}>WemChat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Parches')}
            style={[styles.btnDark, {marginLeft: 12}]}
          >
            <Text style={styles.btnTextWhite}>Parches</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.countersContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Followers', {id: DataUser.id})}>
            <View style={styles.countersView}>
              <Text style={styles.countersNum}>{Followers}</Text>
              <Text style={styles.countersText}>Seguidores</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Following', {id: DataUser.id})}>
            <View style={styles.countersView}>
              <Text style={styles.countersNum}>{Following}</Text>
              <Text style={styles.countersText}>Siguiendo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUserFeeds = () => {
    return (
      <FlatList
        data={[...feed]}
        numColumns={3}
        keyExtractor={(item, index) => `${item.users_id}+${index}`}
        renderItem={({item}) => {
          let imageUrl = null;
          try {
            const parsedThumbnails = JSON.parse(item.thumbnail);
            const parsedImages = JSON.parse(item.feed_img);

            const isVideo = url => ['.mp4', '.mov', '.avi', '.webm'].some(ext => url.toLowerCase().endsWith(ext));

            if (Array.isArray(parsedImages) && parsedImages[0]) {
              const originalUrl = parsedImages[0];
              if (isVideo(originalUrl)) {
                imageUrl = {uri: originalUrl};
              } else if (Array.isArray(parsedThumbnails) && parsedThumbnails[0]) {
                imageUrl = {uri: parsedThumbnails[0]};
              } else {
                imageUrl = {uri: originalUrl};
              }
            }
          } catch (error) {
            console.log('Error parsing img/thumbnail:', error);
          }

          return (
            <View style={styles.itemContainer}>
              <PhotoCardEliminate
                image={imageUrl}
                comments={item.commentCount}
                likes={item.likeCount}
                id={item.feed_id}
                idUser={DataUser.id}
                reloadFeeds={() => loadUserFeeds(DataUser.id)}
              />
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.mainContainer}>
        <View style={styles.container2}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={22} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Perfil</Text>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconContainer}>
            <Ionicons name="settings-outline" size={22} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderUserProfileInfo()}
          <View style={{paddingTop: 20}}>{renderUserFeeds()}</View>
          <View style={{margin: 50}} />

         
        </ScrollView>
      </View>
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'}}
          activeOpacity={1}
          onPressOut={() => setSettingsVisible(false)}
        >
          <View style={{backgroundColor: '#1e1e1e', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20}}>
            {renderLinks()}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {flex: 1, backgroundColor: '#200f39'},
  mainContainer: {flex: 1, padding: 16},
  container2: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  iconContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
  title: {fontSize: 22, fontFamily: 'Poppins-Bold', color: COLORS.white},
  card: {alignItems: 'center', padding: 16},
avatar: {
  height: 92,
  width: 92,
  borderRadius: 999,
  marginBottom: 12,
  borderWidth: 4,         // grosor del borde
  borderColor: '#0d0519', // color blanco
},
avatarContainer: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 4,
  borderColor: '#1f1033', // borde oscuro (como el fondo de tu app)
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  backgroundColor: '#000', // por si la imagen no carga
},

avatar: {
  width: 92,
  height: 92,
  borderRadius: 46,
},

checkIconContainer: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  
  borderRadius: 12,
},
  nameContainer: {flexDirection: 'row', alignItems: 'center'},
  name: {fontSize: 22, fontFamily: 'Poppins-Bold', color: COLORS.white},
  description: {fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.white, marginVertical: 8, textAlign: 'center'},
  btnContainer: {flexDirection: 'row', marginTop: 8},
  btnPurple: {paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#6e28c9', borderRadius: 20},
  btnDark: {paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#1a0e32', borderRadius: 20},
  btnTextWhite: {color: '#fff', fontSize: 14, fontFamily: 'Poppins-Bold'},
  countersContainer: {flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16},
  countersView: {alignItems: 'center'},
  countersNum: {fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff'},
  countersText: {fontSize: 12, fontFamily: 'Poppins-Regular', color: '#aaa'},
itemContainer: {
  width: (SIZES.width - 32) / 3,
  aspectRatio: 1,
  marginBottom: 6,
  padding: 2,
  borderRadius: 18,
  overflow: 'hidden',
  // borderWidth y borderColor estaban aquí antes
},
  linkCard: {backgroundColor: '#1e1e1e', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 8},
  linkItem: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#333'},
  linkLeft: {flexDirection: 'row', alignItems: 'center'},
  linkText: {marginLeft: 12, fontSize: 16, color: '#fff', fontWeight: '500'},
});

export default Profile;