// components/MessageButton.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.messageButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        <MaterialCommunityIcons name="message-plus-outline" color={'#000'} size={24} />
        <Text style={styles.buttonText}>Mensaje</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#110527',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
    fontFamily:"Poppins-Bold"
  },
});

export default MessageButton;