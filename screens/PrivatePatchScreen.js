import React from 'react'
import { Text, View } from 'react-native';

const PrivatePatchScreen = ({ route }) => {
    
    const { id } = route.params; // <-- aquí recibes el ID

  return (
    <View>
        <Text>chat privado {id}</Text>
    </View>
  )
}

export default PrivatePatchScreen