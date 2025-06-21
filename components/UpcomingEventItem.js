import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '../constants'


const UpcomingEventItem = ({ 
    image, 
    title, 
    address, 
    date, 
    onPress,
    attenderImage1,
    attenderImage2
}) => {
  return (
    <TouchableOpacity
     onPress={onPress}
     style={styles.container}
    >   
      <Image
        source={image}
        resizeMode='cover'
        style={styles.image}
      />
      <View style={{marginLeft: 12, paddingVertical: 12}}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.date}>{date}</Text>

        <View style={{
          flexDirection: "row",
          marginTop: 6,
          alignItems: "center"
          }}>
            <View style={{
              flexDirection: "row"
            }}>
                <Image
                  source={attenderImage1}
                  resizeMode='contain'
                  style={styles.attenderImage1}
                />
                 <Image
                  source={attenderImage2}
                  resizeMode='contain'
                  style={styles.attenderImage2}
                />
                <TouchableOpacity 
                  style={styles.numAttenderContainer}>
                    <Text style={styles.numAttender}>50+</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.body}>Interested</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        height: 112,
        width: SIZES.width - 32,
        backgroundColor: COLORS.white,
        borderRadius: 5,
        flexDirection: 'row',
        marginBottom: 16
    },
    image: {
        height: 112,
        width: 112
    },
    title: {
        fontSize: 16,
        fontFamily: "Roboto Bold",
        color: COLORS.black,
        marginBottom: 6
    },
    address: {
        fontSize: 12,
        fontFamily: "Roboto Regular",
        color: COLORS.black,
        marginBottom: 6
    },
    date: {
        fontSize: 12,
        fontFamily: "Roboto Regular",
        color: COLORS.red,
    },
    body: {
        fontSize: 12,
        fontFamily: "Roboto Regular",
        color: COLORS.primary,
        left: - 30
    },
    attenderImage1: {
        height: 28,
        width: 28,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    attenderImage2: {
      height: 28,
      width: 28,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: COLORS.white,
      left: -20
  },
    numAttenderContainer: {
        height: 28,
        width: 28,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        left: -40,
        backgroundColor: COLORS.primary
    },
    numAttender: {
      fontSize: 10,
      fontFamily: "Roboto Regular",
      color: COLORS.white
    }
})

export default UpcomingEventItem