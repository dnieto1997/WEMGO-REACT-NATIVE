import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { COLORS } from '../constants'

const NewsCard = ({ avatar, firstName, lastName, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}>
        <Image
          source={avatar}
          resizeMode='cover'
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
            <Text style={styles.firstName}>{firstName}</Text>
            <Text style={styles.lastName}>{lastName}</Text>
        </View>
        <LinearGradient
          colors={[ 'transparent', COLORS.primary ]}  
          style={styles.gradient}>
        </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 148,
        borderRadius: 20,
        marginRight: 6,
    },
    avatar: {
        width: 100,
        height: 148,
        borderRadius: 10,
    },
    firstName: {
        fontSize: 12,
        fontFamily: 'Roboto Bold',
        color: COLORS.white
    },
    lastName: {
        fontSize: 12,
        fontFamily: 'Roboto Bold',
        color: COLORS.white
    },
    nameContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 999
    },
    gradient: {
        height: 62,
        width: "100%",
        position: "absolute",
        bottom: 0,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    }
})

export default NewsCard