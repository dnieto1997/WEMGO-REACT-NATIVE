import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';


const UserGreetingCard = ({ DataUser, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.greetingBox}>
        <Text style={styles.greetingText}>Hola, {DataUser.firstName}</Text>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={
              DataUser.img
                ? { uri: DataUser.img }
                :''
            }
            style={styles.avatar}
          />
        
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  greetingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2B1A4A',
    padding: 16,
    borderRadius: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins-Light',
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#888',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserGreetingCard;
