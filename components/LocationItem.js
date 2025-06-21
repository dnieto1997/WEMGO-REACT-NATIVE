import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '../constants'
import AntDesign from "react-native-vector-icons/AntDesign"
import Feather from "react-native-vector-icons/Feather"

const LocationItem = ({ title, subtitle, onPress }) => {
    return (
        <TouchableOpacity
          onPress={onPress} 
          style={styles.container}>
            <View style={{ flexDirection: "row" }}>
                <Feather
                    name="map-pin"
                    color={COLORS.primary}
                    size={24}
                />
                <View style={{ marginLeft: 18 }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </View>
            <AntDesign
                name="right"
                color={COLORS.black}
                size={18}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: SIZES.width - 32,
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 22
    },
    title: {
        fontSize: 17,
        fontFamily: "Roboto Medium",
        color: COLORS.black,
        marginBottom: 4
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Roboto Medium",
        color: "gray"
    }
})

export default LocationItem