import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ImageBackground, Alert } from 'react-native'
import React, { useState,useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, icons, images } from '../constants'
import Button from '../components/Button'
import { ScrollView } from 'react-native-virtualized-view'
import LinearGradient from 'react-native-linear-gradient';
import HeaderwithLogo from '../components/HeaderwithLogo'
import {postHttps} from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage'


const interests = [
  { id: "1", name: "Películas", icon: images.movie, value: 'movie' },
  { id: "2", name: "Festival", icon: images.festival, value: 'festival' },
  { id: "3", name: "Comida", icon: images.food, value: 'food' },
  { id: "4", name: "Música", icon: images.music, value: 'music' },
  { id: "5", name: "Teatro", icon: images.theather, value: 'theather' },
  { id: "6", name: "Deporte", icon: images.sport, value: 'sport' },
  { id: "7", name: "Juegos", icon: images.games, value: 'games' },
  { id: "8", name: "Turismo", icon: images.touring, value: 'touring' },
  { id: "9", name: "Fiesta", icon: images.party, value: 'party' },
  { id: "10", name: "Playa", icon: images.beach, value: 'beach' },
  { id: "11", name: "Cultura", icon: images.culture, value: 'culture' },
  { id: "12", name: "Networking", icon: images.internet, value: 'internet' },
]

const Interests = ({ navigation }) => {
    const [DataUser, setDataUser] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);

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

    useEffect(() => {
      loadUserData()
    }, [])
    
  
  const toggleInterest = (interest) => {
    const isSelected = selectedInterests.some(item => item.value === interest.value);
  
    if (isSelected) {
      setSelectedInterests(prev => prev.filter(item => item.value !== interest.value));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests(prev => [...prev, interest]);
      } else {
        Alert.alert("Máximo 3 intereses", "Solo puedes seleccionar hasta 3 intereses.");
      }
    }
  };
  const create = async () => {
    try {
      if (selectedInterests.length === 0) {
        Alert.alert("Selecciona al menos un interés.");
        return;
      }
  
      const payload = {
        interest: JSON.stringify(selectedInterests.map(i => i.value)),
        user:DataUser.id
      };
  
      await postHttps("interest", payload);
  
      navigation.navigate("Main");
    } catch (error) {
      console.error("Error al crear intereses:", error);
      Alert.alert("Hubo un problema al guardar los intereses.");
    }
  };


  return (
<ImageBackground
 source={require('../assets/Fondo1.png')}
 style={styles.background}
 resizeMode="cover" // puedes usar "cover", "contain", "stretch"
>
    <SafeAreaView style={styles.area}>
      
      <View style={styles.container}>
      <HeaderwithLogo/>
    
      <View style={{top:30}}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Seleccione sus intereses para eventos</Text>
        <FlatList
          data={interests}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleInterest(item)}
              style={{
                backgroundColor: selectedInterests.includes(item)
                  ? "#944af5"
                  : COLORS.tansparentPrimary,
                width: (SIZES.width - 42) / 3,
                height: (SIZES.width - 42) / 3,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15,
                margin: 2,
              }}
            >
              <Image
                source={item.icon}
                style={{
                  height: 38,
                  width: 38,
                }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Poppins-Bold',
                  marginTop: 12,
                  color: selectedInterests.includes(item) ? 'white' : 'black',
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

<TouchableOpacity
  onPress={() => create()}
  style={[styles.btn, { backgroundColor: "#944af5", marginVertical: 26 }]}
>
  <Text style={styles.btnText}>Siguiente</Text>
</TouchableOpacity>
        </ScrollView>
        </View>
      </View>
    </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
  
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 16,
    textAlign: 'center',
    color:"white"
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  
    padding: 16
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: SIZES.width - 32
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    height: 16,
    width: 16,
    tintColor: COLORS.black
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Roboto Black",
    position: "absolute",
    right: (SIZES.width - 32) / 2 - 32,
    color: "black"
  },
  btn: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderColor: "#944af5",
    borderWidth: 2,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  btnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold', // o el que estés usando
  },
})

export default Interests