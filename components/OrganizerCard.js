import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS } from '../constants'

const OrganizerCard = ({ image, name, onPress }) => {
  return (
    <View style={styles.container}>
       <Image
         source={image}
         resizeMode='contain'
         style={styles.image}
       />
       <Text style={styles.numEvent}>100+ Event</Text>
       <Text style={styles.name}>{name}</Text>
       <TouchableOpacity
        style={styles.btn}>
         <Text style={styles.btnText}>Follow</Text>
       </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        width: 104,
        height: 164,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        marginRight: 12
    },
    image: {
        width: "100%",
        height: 78,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    numEvent: {
        fontSize: 10,
        fontFamily: "Roboto Bold",
        color: COLORS.black,
        marginTop: 4
    },
    name: {
        fontSize: 12,
        fontFamily: "Roboto Bold",
        color: COLORS.primary,
        marginVertical: 10
    },
    btn: {
        height: 24,
        width: 78,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.tansparentPrimary,
        borderRadius: 12,
    },
    btnText: {
        fontSize: 12,
        fontFamily: "Roboto Bold",
        color: COLORS.primary
    }
})

export default OrganizerCard