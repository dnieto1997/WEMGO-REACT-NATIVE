// HeaderHome.js
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HeaderHome = ({ title, navigation, unreadCount, DataUser }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')} // Ajusta ruta si es necesario
          style={styles.logo}
          resizeMode="contain"
        />
        {title && <Text style={styles.titleText}>{title}</Text>}
      </View>

      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications', { id: DataUser.id })}
        >
          <MaterialCommunityIcons name="bell" color={'white'} size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Message')}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="message-text" color={'white'} size={30} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  titleText: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
};

export default HeaderHome;
