import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { COLORS } from '../constants'

const HeaderwithLogo = ({ title }) => {
    const navigation = useNavigation()
  return (
    <View style={styles.container}>
 
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')} // Asegúrate de que la imagen está en la ruta correcta
              style={styles.logo}
              resizeMode="contain"
            />
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
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        backgroundColor: COLORS.white
    },
    title: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        color: COLORS.white,
    },
    point: {
        position: 'absolute',
        top: 0,
        right: 8,
        height: 4,
        width: 4,
        borderRadius: 999,
        backgroundColor: COLORS.red,
        zIndex: 999
    },
    logo: {
        width: 120, 
        height: 40,
         
      },
      logoContainer: {
        flex: 1, 
        alignItems: 'center',
      
       
      },
    
});
export default HeaderwithLogo