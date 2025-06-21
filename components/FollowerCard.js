import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { COLORS, SIZES } from '../constants'

const DEFAULT_AVATAR = 'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png'

const FollowerCard = ({ onPress, avatar, name }) => {
  const [imgError, setImgError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Obtener la URI de la imagen, considerando diferentes formatos y fallback
  const imageUri = imgError
    ? DEFAULT_AVATAR
    : (typeof avatar === 'string' ? avatar : avatar?.uri) || DEFAULT_AVATAR

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.avatar}
            resizeMode='cover'
            onError={() => {
              setImgError(true)
              setLoading(false)
            }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator color="white" />
            </View>
          )}
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: SIZES.width - 32,
    backgroundColor: 'black',
    borderRadius: 6,
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 999,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 36,
    width: 36,
    borderRadius: 999,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    marginBottom: 4,
  },
})

export default FollowerCard
