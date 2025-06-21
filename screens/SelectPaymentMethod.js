import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from "react-native-vector-icons/AntDesign"
import { COLORS, SIZES } from '../constants'
import { ScrollView } from 'react-native-virtualized-view'
import Octicons from "react-native-vector-icons/Octicons"
import CheckBox from '@react-native-community/checkbox';
import Button from '../components/Button'

const SelectPaymentMethod = ({ navigation }) => {
  const [isChecked, setChecked] = useState(false);
  /**
   * Render header
   */
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconContainer}>
          <AntDesign
            name="arrowleft"
            color={COLORS.black}
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Payment</Text>
        <View>
          <Text>{"   "}</Text>
        </View>
      </View>
    )
  }

  /**
   * Render content
   */
  const renderContent = () => {
    return (
      <View>
        <View style={styles.menbershipCard}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <View>
              <Text style={styles.menbershipTitle}>Premium</Text>
              <Text style={styles.menbershipSubtitle}>Membership</Text>
            </View>
            <Octicons
              name="check-circle-fill"
              color={COLORS.primary}
              size={36}
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Octicons name="check" size={16} color={COLORS.primary} />
              <Text style={styles.menbershipItem}>Starter pack</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Octicons name="check" size={16} color={COLORS.primary} />
              <Text style={styles.menbershipItem}>Dinner (vege, vegeterian, gluten free)</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Octicons name="check" size={16} color={COLORS.primary} />
              <Text style={styles.menbershipItem}>2 day access to recovery space</Text>
            </View>
          </View>
          <Text style={styles.menbershipPrice}>Pay $19,99</Text>
        </View>
        <TouchableOpacity
          style={styles.cardNumContainer}>
          <Text style={styles.cardNumLeft}>Visa **********250</Text>
          <Text style={styles.cardNumRight}>Change</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.creditCardContainer}>
          <View style={{
            flexDirection: "row",
            alignItems: "center"
          }}>
            <CheckBox
              style={styles.checkbox}
              value={isChecked}
              tintColor={isChecked ? COLORS.primary : "gray"}
              onValueChange={setChecked}
              boxType="circle"
              onTintColor={COLORS.primary}
              onFillColor={COLORS.primary}
              onCheckColor={COLORS.white}
            />
            <Text style={styles.checkboxTitle}>Credit / Debit / ATM Card</Text>
          </View>
          <AntDesign
            name="right"
            color={COLORS.black}
            size={20}
          />
        </TouchableOpacity>
        <Button
          title="Add Payment Method"
          onPress={()=>navigation.navigate("AddNewCard")}
          style={{
            backgroundColor: COLORS.tansparentPrimary,
            borderColor: COLORS.tansparentPrimary,
            borderWidth: 2
          }}
        />
        <Button
          title="Process to Pay"
          filled
          style={{ marginTop: 28}}
          onPress={()=>navigation.navigate("PaymentSuccessful")}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView>
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 999
  },
  headerText: {
    fontSize: 22,
    fontFamily: "Roboto Bold",
    color: COLORS.black
  },
  menbershipCard: {
    height: 230,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 22
  },
  menbershipTitle: {
    fontSize: 22,
    fontFamily: "Roboto Bold",
    color: COLORS.black,
    marginBottom: 4
  },
  menbershipSubtitle: {
    fontSize: 14,
    fontFamily: "Roboto Regular",
    color: COLORS.black
  },
  menbershipItem: {
    fontSize: 14,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
    marginLeft: 12,
    marginVertical: 4
  },
  menbershipPrice: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.primary,
    marginTop: 8
  },
  cardNumContainer: {
    width: SIZES.width - 32,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16
  },
  cardNumLeft: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.black
  },
  cardNumRight: {
    fontSize: 14,
    fontFamily: "Roboto Medium",
    color: COLORS.primary
  },
  creditCardContainer: {
    width: SIZES.width - 32,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    marginVertical: 12,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  checkBoxContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18
  },
  checkbox: {
    marginRight: 8,
    height: 16,
    width: 16
  },
  checkboxTitle: {
    fontFamily: "Roboto Medium",
    color: COLORS.black,
    fontSize: 14,
    marginLeft: 8,
  }
})
export default SelectPaymentMethod