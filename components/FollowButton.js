// components/FollowButton.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';

const FollowButton = ({ isFollowing, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.followButton, isFollowing ? styles.following : styles.notFollowing]}
      onPress={onPress}>
      <View style={styles.buttonContent}>
        <MaterialCommunityIcons
          name={isFollowing ? 'account-remove' : 'account-check'}
          color={COLORS.black}
          size={24}
        />
        <Text style={styles.buttonText}>{isFollowing ? 'Siguiendo' : 'Seguir'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  following: {
    backgroundColor: '#999',
  },
  notFollowing: {
    backgroundColor: '#8358f1',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
});

export default FollowButton;