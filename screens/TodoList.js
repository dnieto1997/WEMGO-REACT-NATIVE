// TodoList.js
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  useColorScheme
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants';
import Header from '../components/Header';
import { getHttps } from '../api/axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'searchHistory';

const TodoList = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [DataUser, setDataUser] = useState({});
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) setDataUser(JSON.parse(data));
    };
    loadUserData();
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) setSearchHistory(JSON.parse(history));
  };

  const saveSearchToHistory = async (text) => {
    const updated = [text, ...searchHistory.filter(q => q !== text)].slice(0, 10);
    setSearchHistory(updated);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const removeSearchItem = async (text) => {
    const updated = searchHistory.filter(q => q !== text);
    setSearchHistory(updated);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const handleSearch = useCallback((text) => {
    setQuery(text);

    if (text.length > 2) {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(async () => {
        try {
          const response = await getHttps(`users/search/${text}`);
          const formattedResults = response.data.map(user => ({
            id: user.id,
            fullName: `${user.first_name} ${user.last_name}`,
            userImg: user.img || 'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
            checked: user.checked,
          }));
          setFilteredUsers(formattedResults);
          saveSearchToHistory(text);
        } catch (error) {
          console.error('Error searching users:', error);
        }
      }, 500);
    } else {
      setFilteredUsers([]);
    }
  }, [searchHistory]);

  const clearSearch = () => {
    setQuery('');
    setFilteredUsers([]);
  };

  useFocusEffect(
    useCallback(() => {
      clearSearch();
    }, [])
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => {
        if (item.id === DataUser.id) {
          navigation.navigate("Profile");
        } else {
          navigation.navigate("FriendTimeline", { id: item.id });
        }
      }}
    >
      <Image source={{ uri: item.userImg }} style={styles.userImage} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.userName}>{item.fullName}</Text>
        {item.checked == "1" && (
          <MaterialIcons name="verified" size={18} color="#3897f0" style={{ marginLeft: 6 }} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <TouchableOpacity onPress={() => handleSearch(item)} style={{ flex: 1 }}>
        <Text style={styles.historyText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeSearchItem(item)}>
        <MaterialIcons name="close" size={18} color="#999" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <View style={{ marginVertical: 22 }}>
      <View style={styles.searchBox}>
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
              backgroundColor: '#fff',
              color: isDarkMode ? '#000' : COLORS.black,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Poppins-Bold',
              flex: 1,
            },
          ]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <MaterialIcons name="close" size={20} color={COLORS.black} />
          </TouchableOpacity>
        )}
      </View>

      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
        />
      ) : (
        <FlatList
          data={searchHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderHistoryItem}
          ListHeaderComponent={
            searchHistory.length > 0 ? (
              <Text style={styles.historyHeader}>Búsquedas recientes</Text>
            ) : null
          }
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Buscar Usuarios" />
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: "black"
  },
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 16
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins-Bold",
    fontWeight: "bold"
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  historyText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  historyHeader: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginBottom: 6,
  },
});

export default TodoList;
