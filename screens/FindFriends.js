import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import Header from '../components/Header'
import { ScrollView } from 'react-native-virtualized-view'
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Button from '../components/Button'

const FindFriends = () => {
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Find Friends" />
        <ScrollView>
          <View style={styles.findContainer}>
            <MaterialIcons
              name="wifi-tethering"
              size={148}
              color={COLORS.primary}
            />
          </View>
          <View>
            <View style={styles.friendContainer}>
              <Text style={styles.friendTitle}>Find Friends</Text>
              <Text style={styles.friendSubtitle}>Tell your friends about the app so that they’ll see your messages faster</Text>
              <Text style={styles.friendBottom}>50  of your friends are already join us</Text>
            </View>
          </View>
          <Button
            title="Add from contacts"
            filled
            style={{
              backgroundColor: COLORS.purple,
              borderColor: COLORS.purple,
              marginTop: 22,
              marginBottom: 16
            }}
          />

          <Button
            title="Add from Facebook"
            textColor={COLORS.primary}
            style={{
              backgroundColor: COLORS.tansparentPrimary,
              borderColor: COLORS.tansparentPrimary
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
    backgroundColor: COLORS.secondaryWhite
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16
  },
  findContainer: {
    marginVertical: 48,
    alignItems: "center"
  },
  friendContainer: {
    height: 168,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  friendTitle: {
    fontSize: 20,
    fontFamily: "Roboto Bold",
    color: COLORS.black
  },
  friendSubtitle: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Roboto Regular",
    textAlign: "center",
    marginVertical: 18
  },
  friendBottom: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Roboto Regular",
    textAlign: "center"
  }
})
export default FindFriends