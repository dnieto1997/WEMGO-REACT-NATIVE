import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { COLORS, SIZES, FONTS, images } from '../constants'
import Entypo from "react-native-vector-icons/Entypo"

const FeaturedEventCard = ({ 
    eventImage, 
    days, 
    months,
    eventTitle,
    eventAddress,
    attenderImage1,
    attenderImage2,
    attenderImage3,
    attenderImage4,
}) => {
    const navigation = useNavigation();

  return (
    <TouchableOpacity
    onPress={()=>navigation.navigate("EventDetails")}
    style={styles.eventContainer}>
    <Image
      source={eventImage}
      resizeMode='cover'
      style={styles.eventImage}
    />

    <TouchableOpacity style={styles.dateContainer}>
      <Text style={styles.date}>{days}</Text>
      <Text style={styles.days}>{months}</Text>
    </TouchableOpacity>
    <View style={{ padding: 12 }}>
      <Text style={styles.eventTitle}>{eventTitle}</Text>
      <Text style={styles.eventAddress}>{eventAddress}</Text>

      <View style={{ flexDirection: "row", marginVertical: 18, justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", marginRight: -32 }}>
            <Image
              source={attenderImage1}
              style={styles.avatar}
            />
            <Image
              source={attenderImage2}
              style={[styles.avatar, { left: -12 }]}
            />
            <Image
              source={attenderImage3}
              style={[styles.avatar, { left: -24 }]}
            />
            <Image
              source={attenderImage4}
              style={[styles.avatar, { left: -36 }]}
            />
            <View
              style={[styles.avatar, {
                left: -48,
                backgroundColor: COLORS.primary,
                alignItems: "center",
                justifyContent: "center",
              }]}>
              <Text style={{
                fontSize: 10,
                color: COLORS.white,
                fontFamily: "Roboto Regular"
              }}>50+</Text>
            </View>
          </View>
          <Text style={{ ...FONTS.body4, color: COLORS.primary }}>Interested</Text>
        </View>
        <TouchableOpacity style={styles.btnContainer}>
          <Text style={styles.btnText}>Going</Text>
          <Entypo name="chevron-small-down" size={12} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    eventContainer: {
        height: 300,
        width: SIZES.width - 32,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        marginRight: 12,
        marginBottom: 16
      },
      eventImage: {
        height: 178,
        width: "100%",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
      },
      eventTitle: {
        fontFamily: "Roboto Bold",
        color: COLORS.black,
        fontSize: 16,
      },
      eventAddress: {
        fontFamily: "Roboto Medium",
        color: "#4E4B66",
        fontSize: 16,
        marginTop: 4
      },
      avatar: {
        height: 32,
        width: 32,
        borderRadius: 999,
        borderColor: COLORS.white,
        borderWidth: 3,
      },
      btnContainer: {
        height: 32,
        width: 76,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.tansparentPrimary,
        borderRadius: 16,
        flexDirection: "row",
      },
      btnText: {
        fontSize: 12,
        fontFamily: "Roboto Regular",
        color: COLORS.primary,
        marginRight: 2
      },
      dateContainer: {
        position: "absolute",
        height: 60,
        width: 50,
        backgroundColor: COLORS.primary,
        top: 178,
        right: 12,
        alignItems: "center",
        justifyContent: "center",
      },
      date: {
        fontSize: 28,
        fontFamily: 'Roboto Bold',
        color: COLORS.white
      },
      days: {
        fontSize: 16,
        fontFamily: 'Roboto Bold',
        color: COLORS.white
      }
})
export default FeaturedEventCard