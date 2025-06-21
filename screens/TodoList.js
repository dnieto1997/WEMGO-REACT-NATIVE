import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  TextInput ,
  useColorScheme 
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants';
import Header from '../components/Header';
import { getHttps } from '../api/axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Icono de "X" para limpiar
import AsyncStorage from '@react-native-async-storage/async-storage';


const TodoList = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [DataUser, setDataUser] = useState({});
  
const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setDataUser(parsedData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    loadUserData();
  }, []);

  /**
   * Manejo de búsqueda con optimización
   */
  const handleSearch = useCallback((text) => {
    setQuery(text);

    if (text.length > 2) {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      
      this.searchTimeout = setTimeout(async () => {
        try {
          const response = await getHttps(`users/search/${text}`);
          console.log(response.data)
          const formattedResults = response.data.map(user => ({
            id: user.id,
            fullName: `${user.first_name} ${user.last_name}`,
            userImg: user.img || 'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
            checked: user.checked,
          }));

          setFilteredUsers(formattedResults);
        } catch (error) {
          console.error('Error searching users:', error);
        }
      }, 500);
    } else {
      setFilteredUsers([]);
    }
  }, []);

  /**
   * Función para limpiar la búsqueda
   */
  const clearSearch = () => {
    setQuery('');
    setFilteredUsers([]);
  };
  useFocusEffect(
    useCallback(() => {
      clearSearch();
    }, [])
  );

  /**
   * Renderiza cada usuario en la lista de búsqueda
   */
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
    <MaterialIcons
      name="verified"
      size={18}
      color="#3897f0"
      style={{ marginLeft: 6 }}
    />
  )}
</View>
    </TouchableOpacity>
  );

  /**
   * Renderiza el contenido de la pantalla
   */
  const renderContent = () => (
    <View style={{ marginVertical: 22 }}>
      {/* Barra de búsqueda con botón de limpiar */}
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
      backgroundColor: '#fff',           // Fondo blanco fijo
      color: isDarkMode ? '#000' : COLORS.black, // Color del texto (negro en ambos)
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

      {/* Lista de resultados de búsqueda */}
      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
        />
      ) : (
        <Text style={styles.noResults}></Text>
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
    backgroundColor:  "black",
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
     fontWeight:"bold",
     fontFamily:"Poppins-Bold",
     
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "white",
    fontWeight:"bold",

  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "white",
    marginTop: 4
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
    fontFamily:"Poppins-Bold",
    fontWeight:"bold"
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: "white",
    fontFamily:"Poppins-Bold",
    fontWeight:"bold"
  }
});

export default TodoList;
