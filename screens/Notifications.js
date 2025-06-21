import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getHttps} from '../api/axios';
import Header from '../components/Header';
import Tab from '../components/Tab';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getHttps('notification');

      // Convertir la cadena de `img` a array
      const formattedNotifications = response.data.map(item => ({
        ...item,
        img: JSON.parse(item.img)[0] || null, // Tomar solo la primera imagen del array
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      if (error.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'No se pudieron cargar las notificaciones.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = date => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSec < 60) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays < 7) return `hace ${diffDays} d`;
    return `hace ${diffWeeks} sem`;
  };

  const handlePressNotification = id => {
    navigation.navigate('Post', {id});
  };

  const renderItem = ({item}) => (
    <>
      <TouchableOpacity
        style={styles.notificationCard}
        onPress={() => handlePressNotification(item.id)}>
        {/* Imagen del usuario */}
        <Image
          source={{uri: item.user.img || 'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png'}}
          style={styles.avatar}
        />

        <View style={styles.textContainer}>
          {/* Nombre del usuario y descripción del feed */}
          <Text style={styles.userName}>
            <Text style={styles.boldText}>
              {item.user.first_name} {item.user.last_name}
            </Text>{' '}
            ha compartido la siguiente publicación
          </Text>

          {/* Fecha formateada */}
          <Text style={styles.date}>
            {formatTimeAgo(item.date_publication)}
          </Text>
        </View>

        {/* Imagen del feed (primera imagen) */}
        {item.img && (
          <Image source={{uri: item.img}} style={styles.feedImage} />
        )}
      </TouchableOpacity>
      <View style={styles.rayita} />
    </>
  );

  return (
    <>
      <View style={styles.container}>
        <Header title="Notificaciones" />
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : notifications.length === 0 ? (
          <Text style={styles.noNotifications}>
            No hay ninguna notificación.
          </Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            ListFooterComponent={<View style={{height: 80}} />} 
          />
        )}
      </View>

      <Tab />
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black', padding: 10},

  noNotifications: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'White',
    fontFamily:"Poppins-Bold"
  },

  // Estilo de cada notificación
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Avatar del usuario
  avatar: {width: 50, height: 50, borderRadius: 25, marginRight: 10},

  // Contenedor del texto
  textContainer: {flex: 1},

  // Nombre del usuario en negrita
  userName: {fontSize: 14, color: 'white', fontWeight: 'bold'},
  boldText: {color: 'white', fontWeight: 'bold', fontFamily: 'Poppins-Bold'},

  // Fecha de la notificación
  date: {fontSize: 12, color: 'gray', marginTop: 3, fontFamily: 'Poppins-Bold'},

  // Imagen del feed a la derecha
  feedImage: {width: 50, height: 50, borderRadius: 8, marginLeft: 10},
  goBackButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  rayita: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    width: '100%',
  },
  rayita: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    width: '100%',
  },
});

export default Notifications;
