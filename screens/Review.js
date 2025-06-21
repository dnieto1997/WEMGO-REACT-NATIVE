import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../constants'
import HeaderV2 from '../components/HeaderV2'
import { ScrollView } from 'react-native-virtualized-view'
import { eventReviews } from '../data'
import ReviewCard from '../components/ReviewCard'
import Button from '../components/Button'

const Review = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <HeaderV2 title="Reviews" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <FlatList
            data={eventReviews}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <ReviewCard
                image={item.reviewerImage}
                date={item.date}
                title={item.title}
                num={item.rating}
                description={item.description}
              />
            )}
          />
          <Button
            title="Add Reviews"
            filled
            onPress={()=>{}}
            style={{
              marginVertical: 16
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16
  }
})

export default Review