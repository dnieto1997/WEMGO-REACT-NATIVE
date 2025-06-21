import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { COLORS, SIZES } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import HeaderV2 from '../components/HeaderV2'
import { ScrollView } from 'react-native-virtualized-view'
import PaymentCard from '../components/PaymentCard'
import AntDesign from "react-native-vector-icons/AntDesign"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import CheckBox from '@react-native-community/checkbox'
import { userCards } from '../data'
import Button from '../components/Button'

const PaymentMethod = ({ navigation }) => {
  const [isCashChecked, setCashChecked] = useState(false);
  const [isCardChecked, setCardChecked] = useState(false);

  const handleCashPress = () => {
    setCashChecked(!isCashChecked);
    setCardChecked(false);
  };

  const handleCardPress = () => {
    setCardChecked(!isCardChecked);
    setCashChecked(false);
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <HeaderV2 title="Payment Method" />
        <ScrollView>
          <View style={{ marginTop: 16 }}>
            <FlatList
              data={userCards}
              showsHorizontalScrollIndicator={false}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <PaymentCard
                  number={item.number}
                  balance={item.balance}
                  date={item.date}
                  onPress={() => console.log("Card Pressed")}
                  containerStyle={{
                    width: SIZES.width - 32,
                    marginBottom: 8
                  }}
                />
              )} />

            <TouchableOpacity
              style={styles.cardNumContainer}>
              <Text style={styles.cardNumLeft}>Visa **********250</Text>
              <Text style={styles.cardNumRight}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCardPress}
              style={styles.creditCardContainer}>
              <View style={{
                flexDirection: "row",
                alignItems: "center"
              }}>
                <CheckBox
                  style={styles.checkbox}
                  value={isCardChecked}
                  tintColor={isCardChecked ? COLORS.primary : "gray"}
                  onValueChange={setCardChecked}
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

            <TouchableOpacity
              onPress={handleCashPress}
              style={styles.creditCardContainer}>
              <View style={{
                flexDirection: "row",
                alignItems: "center"
              }}>
                <CheckBox
                  style={styles.checkbox}
                  value={isCashChecked}
                  tintColor={isCashChecked ? COLORS.primary : "gray"}
                  onValueChange={setCashChecked}
                  boxType="circle"
                  onTintColor={COLORS.primary}
                  onFillColor={COLORS.primary}
                  onCheckColor={COLORS.white}
                />
                <Text style={styles.checkboxTitle}>Cash on  Payment</Text>
              </View>
              <AntDesign
                name="right"
                color={COLORS.black}
                size={20}
              />
            </TouchableOpacity>
            <TouchableOpacity
               onPress={()=>navigation.navigate("AddNewCard")}
              style={[styles.creditCardContainer, { backgroundColor: COLORS.primary }]}>
              <View style={{
                flexDirection: "row",
                alignItems: "center"
              }}>
                <FontAwesome
                  name="credit-card-alt"
                  size={16}
                  color={COLORS.white}
                />
                <Text style={[styles.checkboxTitle, { color: COLORS.white }]}>Add A New Card</Text>
              </View>
              <AntDesign
                name="right"
                color={COLORS.white}
                size={20}
              />
            </TouchableOpacity>

            {/* Checkout Button */}
            <Button
              title="Process to Checkout"
              filled
              onPress={() => navigation.navigate("PaymentSuccessful")}
              style={{
                backgroundColor: COLORS.purple,
                borderColor: COLORS.purple,
                marginVertical: 12
              }}
            />
          </View>
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
  cardNumContainer: {
    width: SIZES.width - 32,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    marginVertical: 22
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
    marginVertical: 6,
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
export default PaymentMethod