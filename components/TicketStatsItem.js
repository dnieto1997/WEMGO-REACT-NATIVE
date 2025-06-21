import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '../constants';
import CircularPercentage from './CircularPercentage';

const TicketStatsItem = ({ title, subtitle, percentage, onPress }) => {
  return (
   <TouchableOpacity style={styles.container} onPress={onPress}>
       <CircularPercentage percentage={percentage} radius={28}/>
            <View style={{ marginLeft: 12}}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
   </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        height: 80,
        width: SIZES.width - 32,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        backgroundColor: COLORS.white,
        marginVertical: 6
    },
    iconContainer: {
        height: 48,
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        backgroundColor: COLORS.tertiaryWhite,
        marginRight: 16
    },
    icon: {
        height: 32,
        width: 32
    },
    title: {
        fontSize: 14,
        fontFamily: "Roboto Medium",
        color: COLORS.black,
        marginBottom: 4
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Roboto Regular",
        color: COLORS.black
    }
})

export default TicketStatsItem