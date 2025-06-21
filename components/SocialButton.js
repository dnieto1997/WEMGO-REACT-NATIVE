import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS } from '../constants'

const SocialButton = ({ onPress, icon, name }) => {
  return (
    <TouchableOpacity
      onPress={onPress} 
      style={styles.container}>
        <Image
         source={icon}
         style={styles.icon}
         resizeMode='contain'
        />
        <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    icon: {
        height: 78,
        width: 78,
        marginBottom: 12
    },
    name: {
        fontSize: 18,
        fontFamily: 'Roboto Regular',
        color: COLORS.black
    }
})

export default SocialButton