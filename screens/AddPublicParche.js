// AddPublicParche.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getHttps, postHttps } from '../api/axios';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const AddPublicParche = ({ route }) => {
  const { id } = route.params;
  const navigation = useNavigation();
  const [parches, setParches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchParchesPublicos();
  }, []);

  const fetchParchesPublicos = async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getHttps(`parches/publicoevent/${id}?page=${page}&limit=5`);
      const nuevos = res.data.parches.map(p => ({
        ...p,
        edad: p.edad ? JSON.parse(p.edad) : [],
        eventData: {
          ...p.eventData,
          img: p.eventData.img ? JSON.parse(p.eventData.img) : [],
        },
      }));
      setParches(prev => [...prev, ...nuevos]);
      setHasMore(nuevos.length > 0);
      setPage(prev => prev + 1);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los parches.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleGoToCreate = () => {
    const yaCreeParche = parches.some(p => p.is_owner === '1');
    if (yaCreeParche) {
      Alert.alert('Aviso', 'Ya creaste un parche con este evento.');
    } else {
      navigation.navigate('PublicPatchScreen', { id });
    }
  };

  const parchear = async (eventId, parcheid) => {
    try {
      await postHttps('parche-user/public', {
        event_id: String(eventId),
        parcheid: String(parcheid),
      });
      Alert.alert('Éxito', '¡Ya estás en el parche!');
      setParches([]);
      setPage(1);
      setHasMore(true);
      fetchParchesPublicos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo unir al parche.');
    }
  };

  const goToEventDetails = (parcheId) => {
    navigation.navigate('DetailsParches', { id: parcheId });
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) =>
    layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

  return (
    <View style={styles.container}>
      <Header title="Parches Públicos" />
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : parches.length === 0 ? (
        <Text style={styles.emptyText}>No hay parches disponibles aún.</Text>
      ) : (
        <ScrollView
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) fetchParchesPublicos();
          }}
          scrollEventThrottle={400}
        >
          {parches.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => goToEventDetails(item.id)}>
              {item.eventData.img[0] && (
                <Image source={{ uri: item.eventData.img[0] }} style={styles.img} />
              )}
              <View style={styles.cardContent}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: item.user_created.img }} style={styles.avatar} />
                  <Text style={styles.creator}>
                    {item.user_created.first_name} {item.user_created.last_name}
                  </Text>
                  {item.user_created.checked === '1' && (
                    <MaterialIcons name="verified" size={18} color="#3897f0" style={{ marginLeft: 6 }} />
                  )}
                </View>

                <Text style={styles.name}>{item.eventData.name}</Text>
                <Text style={styles.place}>{item.eventData.place} - {item.eventData.city}</Text>
                <Text style={styles.infoText}>Capacidad: {item.capacityStatus}</Text>
                {item.edad.length === 2 && (
                  <Text style={styles.infoText}>Edad permitida: {item.edad[0]} - {item.edad[1]}</Text>
                )}
                {item.genero && (
                  <Text style={styles.infoText}>Género permitido: {item.genero}</Text>
                )}

                {item.userGo === '0' && (
                  <View style={styles.rightAlign}>
                    <TouchableOpacity style={styles.parchearButton} onPress={() => parchear(item.event_id, item.id)}>
                      <Text style={styles.parchearText}>Parchear</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {loadingMore && <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 10 }} />}
        </ScrollView>
      )}

      <TouchableOpacity onPress={handleGoToCreate} style={styles.floatingAddButton}>
        <MaterialIcons name="add-circle-outline" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    padding: 10,
  },
  emptyText: {
    color: '#ccc',
    marginTop: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 6,
  },
  creator: {
    color: '#fff',
    fontWeight: '600',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  place: {
    color: '#ccc',
    fontSize: 13,
  },
  infoText: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  rightAlign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  parchearButton: {
    backgroundColor: '#3897f0',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  parchearText: {
    color: '#fff',
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
});

export default AddPublicParche;
