import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import CheckBox from '@react-native-community/checkbox';
import { COLORS, SIZES } from '../constants';

const MembershipCard = ({ title, subtitle, price, isSelected, onSelect }) => {
    return (
      <TouchableOpacity
        style={isSelected ? styles.selectedMembershipItem : styles.membershipItem}
        onPress={onSelect}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox
            style={styles.checkbox}
            value={isSelected}
            onValueChange={onSelect}
            boxType="circle"
            onTintColor={COLORS.primary}
            onFillColor={ isSelected ? COLORS.white : COLORS.primary}
            onCheckColor={isSelected ? COLORS.primary: COLORS.white}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={isSelected ? styles.selectedMembershipItemTitle : styles.membershipItemTitle}>{title}</Text>
            <Text style={isSelected ? styles.selectedMembershipItemSubtitle : styles.membershipItemSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Text style={isSelected ? styles.selectedPrice : styles.price}>{price}</Text>
      </TouchableOpacity>
    );
  };

  
const styles = StyleSheet.create({
  membershipItem: {
    height: 74,
    width: SIZES.width - 32,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22
  },
  selectedMembershipItem: {
    height: 74,
    width: SIZES.width - 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22
  },
  checkBoxContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18
  },
  checkbox: {
    marginRight: 8,
    height: 20,
    width: 20
  },
  membershipItemTitle: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.black,
    marginBottom: 6
  },
  selectedMembershipItemTitle: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.white,
    marginBottom: 6
  },
  membershipItemSubtitle: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: COLORS.black
  },
  selectedMembershipItemSubtitle: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: COLORS.white
  },
  price: {
    fontSize: 18,
    fontFamily: "Roboto Bold",
    color: COLORS.black
  },
  selectedPrice:  {
    fontSize: 18,
    fontFamily: "Roboto Bold",
    color: COLORS.white
  },
});

export default  MembershipCard