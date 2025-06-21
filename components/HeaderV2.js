import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Ionicons from "react-native-vector-icons/Ionicons"
import { COLORS } from '../constants'

const HeaderV2 = ({ title }) => {
    const navigation = useNavigation()
  return (
    <View style={styles.container}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.iconContainer}>
            <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.black}
            />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View>
            <Text>{"  "}</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    iconContainer: {
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        backgroundColor: COLORS.white
    },
    title: {
        fontSize: 22,
        fontFamily: 'Roboto Bold',
        color: COLORS.black,
    }
});
export default HeaderV2