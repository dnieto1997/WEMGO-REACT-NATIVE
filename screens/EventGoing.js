import { View, StyleSheet, FlatList } from 'react-native'
import React, { useCallback, useState,useEffect } from 'react'
import { COLORS } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import HeaderV2 from '../components/HeaderV2'
import { ScrollView } from 'react-native-virtualized-view'
import EventItem from '../components/EventItem'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { getHttps } from '../api/axios';
import Tab from '../components/Tab'
import Header from '../components/Header'


const EventGoing = () => {
    const [eventsGoing, seteventsGoing] = useState('second')
    const [DataUser, setDataUser] = useState({})
    const navigation=useNavigation();


    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
           UserEvent(parsedData.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

  

      const UserEvent = async (userId)=>{
        const response = await getHttps(`event-user/eventbyuser/${userId}`)
        const formattedEvents = response.data.map(event => ({
            id: event.id.toString(), // Asegura que el ID sea una cadena
            image: JSON.parse(event.img)[0], // Extrae la primera imagen del array
            title: event.name,
            address: event.place, // Ajusta si hay otro campo para la dirección
            date: new Date(event.initial_date).toDateString(), // Formatea la fecha
          }));

        
        
        seteventsGoing(formattedEvents)
      }
    
      
      useFocusEffect(
        useCallback(() => {
          loadUserData();
   
        }, [])
      );
  

  return (
    <SafeAreaView style={styles.area}>
        <View style={styles.container}>
            <Header title="Eventos" />
            <ScrollView 
               showsVerticalScrollIndicator={false} 
                 contentContainerStyle={{ marginVertical: 22 }}>
                  <FlatList
                        data={eventsGoing}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <EventItem
                                image={ item.image }
                                title={item.title}
                                address={item.address}
                                date={item.date}
                                onPress={() => navigation.navigate('EventDetails', { id: item.id })}
                                attenderImage1={item.attenderImage1}
                                attenderImage2={item.attenderImage2}
                            />
                        )}
                    />
            </ScrollView>
          
        </View>
        <Tab/>
    </SafeAreaView>
   

  )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.secondaryBlack
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.secondaryBlack,
        padding: 16
    }
})

export default EventGoing