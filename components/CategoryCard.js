import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS } from '../constants'

const CategoryCard = ({ name, image, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}>
        <Image
          source={image}
          style={styles.image}
          resizeMode='contain'
        />
        <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        height: 101,
        width: 101,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginRight: 12
    },
    image: {
        height: 36,
        width: 36,
    },
    name: {
        fontSize: 14,
        fontFamily: "Roboto Bold",
        color: COLORS.black,
        marginTop: 16,
    }
})

export default CategoryCard