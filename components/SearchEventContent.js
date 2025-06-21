// SearchEventContent.jsx

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  useColorScheme
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getHttps } from '../api/axios';

const { width } = Dimensions.get("window");

const SearchEventContent = () => {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await getHttps(`event/search/${text}`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    } else {
      setEvents([]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
         <TextInput
     placeholder="Buscar usuarios..."
     placeholderTextColor={isDarkMode ? '#999' : COLORS.black}
     autoCapitalize="none"
     autoCorrect={false}
     value={query}
     onChangeText={handleSearch}
     style={[
       styles.input,
       {
         backgroundColor: '#fff',           // Fondo blanco fijo
         color: isDarkMode ? '#000' : COLORS.black, // Color del texto (negro en ambos)
         fontSize: 16,
         fontWeight: 'bold',
         fontFamily: 'Poppins-Bold',
         flex: 1,
       },
     ]}
   />

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text>{item.name}</Text>
            {/* Aquí tu diseño de tarjetas */}
          </View>
        )}
      />
    </View>
  );
};

export default SearchEventContent;

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  eventCard: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
});
