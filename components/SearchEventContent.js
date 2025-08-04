// SearchEventContent.jsx

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHttps } from '../api/axios';

const { width } = Dimensions.get('window');
const RECENT_SEARCHES_KEY = 'recent_event_searches';

const SearchEventContent = () => {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // 🔄 Cargar búsquedas al iniciar
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (err) {
      console.error('Error loading recent searches:', err);
    }
  };

  const saveRecentSearches = async (updated) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving recent searches:', err);
    }
  };

  const handleSearch = async (text) => {
    setQuery(text);

    if (text.length > 2) {
      try {
        const response = await getHttps(`event/search/${text}`);
        setEvents(response.data);

        // Guardar búsqueda si es nueva
        if (!recentSearches.includes(text)) {
          const updated = [text, ...recentSearches.slice(0, 9)];
          setRecentSearches(updated);
          saveRecentSearches(updated);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    } else {
      setEvents([]);
    }
  };

  const handleRecentPress = (text) => {
    setQuery(text);
    handleSearch(text);
  };

  const removeRecentSearch = async (text) => {
    const updated = recentSearches.filter((item) => item !== text);
    setRecentSearches(updated);
    saveRecentSearches(updated);
  };

  const clearAllSearches = () => {
    Alert.alert('Confirmar', '¿Eliminar todas las búsquedas recientes?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
          setRecentSearches([]);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* 🔍 Input */}
      <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
        <TextInput
          placeholder="Buscar eventos..."
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={query}
          onChangeText={handleSearch}
          style={[
            styles.input,
            {
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialIcons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
      </View>

      {/* 🕘 Recientes */}
      {recentSearches.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Búsquedas recientes
            </Text>
            <TouchableOpacity onPress={clearAllSearches}>
              <MaterialIcons name="delete" size={18} color={isDarkMode ? '#ccc' : '#555'} />
            </TouchableOpacity>
          </View>

          {recentSearches.map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <TouchableOpacity onPress={() => handleRecentPress(item)} style={{ flex: 1 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeRecentSearch(item)}>
                <MaterialIcons name="close" size={18} color={isDarkMode ? '#ccc' : '#555'} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 📋 Resultados */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.eventCard, { backgroundColor: isDarkMode ? '#444' : '#f1f1f1' }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>
              {item.name}
            </Text>
          </View>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  eventCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
});

export default SearchEventContent;
