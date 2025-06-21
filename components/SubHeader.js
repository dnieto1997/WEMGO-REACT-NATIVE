import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { COLORS, FONTS } from '../constants'

const SubHeader = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
       <Text style={{
        fontSize: 20,
        fontFamily: 'Roboto Bold',
        color: COLORS.black
       }}>{title}</Text>
       <TouchableOpacity onPress={onPress}>
        <Text style={{...FONTS.body3, color: COLORS.primary}}>View All+</Text>
       </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 16
    }
})

export default SubHeader