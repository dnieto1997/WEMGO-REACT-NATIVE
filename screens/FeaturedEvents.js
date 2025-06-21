import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../constants'
import HeaderV2 from '../components/HeaderV2'
import { ScrollView } from 'react-native-virtualized-view'
import { featuredEvents } from '../data'
import FeaturedEventCard from '../components/FeaturedEventCard'

const FeaturedEvents = () => {
  return (
    <SafeAreaView style={styles.area}>
        <View style={styles.container}>
            <HeaderV2 title="Featured Events"/>
            <ScrollView contentContainerStyle={{marginVertical: 12}} showsVerticalScrollIndicator={false}>
            <FlatList
                data={featuredEvents}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item=>item.id}
                renderItem={({ item })=>(
                    <FeaturedEventCard
                    eventImage={item.eventImage}
                    eventTitle={item.eventTitle}
                    eventAddress={item.eventTitle}
                    days={item.days}
                    months={item.months}
                    attenderImage1={item.attenderImage1}
                    attenderImage2={item.attenderImage2}
                    attenderImage3={item.attenderImage3}
                    attenderImage4={item.attenderImage4}
                    />
                )}
                />
            </ScrollView>
        </View>
    </SafeAreaView>
  )
}

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

export default FeaturedEvents