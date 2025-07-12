import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const StoryHeader = ({ user, onClose }) => (
  <View style={styles.header}>
    <View style={styles.userInfo}>
      <Image source={{ uri: user.img }} style={styles.profileImage} />
      <Text style={styles.username}>{user.first_name} {user.last_name}</Text>
    </View>
    <TouchableOpacity onPress={onClose}>
      <Text style={styles.closeButton}>✖</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 30,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default StoryHeader;