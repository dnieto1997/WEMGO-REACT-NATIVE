import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { SIZES, COLORS } from '../constants'
import AntDesign from "react-native-vector-icons/AntDesign"

const TodoListItem = ({ 
    icon, 
    title, 
    description, 
    time,
    color
}) => {
  return (
    <View style={styles.container}>
       <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Image
                  source={icon}
                  style={styles.icon}
                  resizeMode='contain'
                />
            </View>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
       </View>
       <TouchableOpacity style={styles.timeBtn}>
         <AntDesign
           name="clockcircleo"
           size={10}
           color={COLORS.red}
         />
         <Text style={styles.time}>{time}</Text>
       </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        height: 80,
        width: SIZES.width - 32,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    iconContainer: {
        height: 50,
        width: 50,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6
    },
    icon: {
        height: 34,
        width: 34,
        tintColor: COLORS.white
    },
    title: {
        fontSize: 16,
        fontFamily: "Roboto Bold",
        color: COLORS.black,
        marginBottom: 4
    },
    description: {
        fontSize: 14,
        fontFamily: "Roboto Regular",
        color: COLORS.black
    },
    time: {
        fontSize: 10,
        fontFamily: "Roboto Regular",
        color: COLORS.red,
        marginLeft: 4
    },
    timeBtn: {
        width: 72,
        height: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: COLORS.transparentRed,
        borderRadius: 12
    }
})

export default TodoListItem