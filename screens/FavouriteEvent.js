import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../constants';
import HeaderV2 from '../components/HeaderV2';
import { ScrollView } from 'react-native-virtualized-view';
import { favouriteEvents } from '../data';
import EventItem from '../components/EventItem';

const FavouriteEvent = () => {
  return (
   <SafeAreaView style={styles.area}>
     <View style={styles.container}>
        <HeaderV2 title="My Favourite Events"/>
        <ScrollView 
          contentContainerStyle={{ marginVertical: 22 }} 
                     showsVerticalScrollIndicator={false}>
                        <FlatList
                        data={favouriteEvents}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <EventItem
                                image={item.image}
                                title={item.title}
                                address={item.address}
                                date={item.date}
                                onPress={() => console.log('New Year Explore Event')}
                                attenderImage1={item.attenderImage1}
                                attenderImage2={item.attenderImage2}
                            />
                        )}
                    />
        </ScrollView>
     </View>
   </SafeAreaView>
  )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.secondaryWhite
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.secondaryWhite,
        padding: 16
    }
})

export default FavouriteEvent