import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS } from '../constants'
import Svg, { Circle } from 'react-native-svg';

const DataCard = ({ percentage, radius, ticketType, numSold, color }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={styles.container}>
            <View>
                <Svg height={radius * 2} width={radius * 2}>
                    <Circle
                        cx={radius}
                        cy={radius}
                        r={radius - 5}
                        stroke="#d3d3d3"
                        strokeWidth={5}
                        fill="none"
                    />
                    <Circle
                        cx={radius}
                        cy={radius}
                        r={radius - 5}
                        stroke={color}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        fill="none"
                    />
                </Svg>
                {/* <Text style={{
                    textAlign: 'center',
                    position: "absolute",
                    bottom: 20,
                    right: 12,
                    fontFamily: "Roboto Bold"
                }}>{`${percentage}%`}</Text> */}
            </View>
            <Text style={styles.ticketType}>{ticketType}</Text>
            <Text style={styles.numSold}>{numSold} Sold</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "center",
    },
    ticketType: {
        fontSize: 12,
        fontFamily: "Roboto Bold",
        color: COLORS.black,
        marginVertical: 8
    },
    numSold: {
        fontSize: 12,
        fontFamily: "Roboto Regular",
        color: "gray",
    }
})

export default DataCard