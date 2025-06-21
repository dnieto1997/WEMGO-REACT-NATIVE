import React from 'react'
import { Text, View } from 'react-native';

const PublicPatchScreen = ({ route }) => {
    const { id } = route.params; // <-- aquí recibes el ID

  return (
    <View>
        <Text> chat publico {id}</Text>
    </View>
  )
}


export default PublicPatchScreen