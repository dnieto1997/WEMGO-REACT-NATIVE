import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';
import {COLORS, SIZES} from '../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EventItem = ({image, title, address, date, onPress, isGoing}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={{uri: image}} resizeMode="cover" style={styles.image} />
      <View style={{marginLeft: 12, paddingVertical: 12}}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.date}>{date}</Text>

        <View
          style={{
            flexDirection: 'row',
            marginTop: 6,
            alignItems: 'center',
          }}>
          {isGoing && (
            <>
              <Text style={styles.body}>Joined</Text>
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color={COLORS.primary}
                style={styles.icon}
              />
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 112,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    height: 112,
    width: 112,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto Bold',
    color: COLORS.black,
    marginBottom: 6,
  },
  address: {
    fontSize: 12,
    fontFamily: 'Roboto Regular',
    color: COLORS.black,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Roboto Regular',
    color: COLORS.red,
  },
  body: {
    fontSize: 12,
    fontFamily: 'Roboto Regular',
    color: COLORS.primary,
  },
});

export default EventItem;
