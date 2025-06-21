import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '../constants'

const ConversationCard = ({ 
    onPress, 
    fullName, 
    avatar, 
    lastMessage, 
    lastTime 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}>
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1
            }}>
            <Image
              source={avatar}
              resizeMode='contain'
              style={styles.avatar}
            />
            <View>
            <Text style={styles.fullName}>{fullName}</Text>
            <Text style={styles.lastMessage}>{lastMessage}</Text>
            </View>
        </View>
        <Text style={styles.lastTime}>{lastTime}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        width: SIZES.width - 32,
        marginVertical: 8
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 999,
        marginRight: 10
      },
    fullName: {
        fontSize: 16,
        fontFamily: "Roboto Bold",
        color: COLORS.black
    },
    lastMessage: {
        fontSize: 14,
        fontFamily: "Roboto Regular",
        color: COLORS.black
    },
    lastTime: {
        fontSize: 12,
        fontFamily: "Roboto Regular",
        color: "#8A8A8F"
    }
})

export default ConversationCard