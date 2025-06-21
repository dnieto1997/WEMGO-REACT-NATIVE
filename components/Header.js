import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants';

const Header = ({title, goTo: propNavigation}) => {
  const navigation = useNavigation();
  const goTo = propNavigation;
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          goTo ? navigation.navigate(goTo) : navigation.goBack();
        }}
        style={styles.iconContainer}>
        <Ionicons name="arrow-back" size={22} color={COLORS.black} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={() => {}}></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.white,
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
    zIndex: 999,
  },
});
export default Header;
