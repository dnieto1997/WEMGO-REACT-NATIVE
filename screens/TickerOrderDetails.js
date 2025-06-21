import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, FONTS } from '../constants'
import Header from '../components/Header'
import { ScrollView } from 'react-native-virtualized-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Button from '../components/Button'


const TickerOrderDetails = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Ticket" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.cardContainer}>
            <View style={styles.view}>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Roboto Bold",
                  color: COLORS.black,
                }}>Order #123456789</Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 12,
                  fontFamily: "Roboto Bold",
                  color: COLORS.black,
                }}>10/04/2022 - 10:30</Text>
              </View>
            </View>
            <View style={styles.separateLine} />
            <View style={styles.view}>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Roboto Bold",
                  color: COLORS.purple,
                }}>5 x $107 Ticket</Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Roboto Bold",
                  color: COLORS.primary,
                }}>$801</Text>
              </View>
            </View>
            <View style={styles.separateLine} />
            <View style={styles.view}>
              <View>
                <Text style={{
                  fontSize: 14,
                  fontFamily: "Roboto Regular",
                  color: COLORS.black,
                }}>Total Fess</Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Roboto Bold",
                  color: COLORS.black,
                }}>$109</Text>
              </View>
            </View>
            <View style={styles.view}>
              <View>
                <Text style={{
                  fontSize: 14,
                  fontFamily: "Roboto Regular",
                  color: COLORS.black,
                }}>Shipping fee</Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Roboto Bold",
                  color: COLORS.black,
                }}>Not counted</Text>
              </View>
            </View>
            <View style={styles.separateLine} />
            <View style={styles.view}>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Roboto Bold",
                  color: COLORS.black,
                }}>Total Price</Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 20,
                  fontFamily: "Roboto Bold",
                  color: COLORS.primary,
                }}>$107</Text>
              </View>
            </View>
          </View>
          <View style={{
            marginVertical: 12,
            width: SIZES.width - 32,
            backgroundColor: COLORS.white,
            paddingVertical: 12,
            paddingHorizontal: 16
          }}>
            <View style={{
              flexDirection: "row"
            }}>
              <MaterialCommunityIcons
                name="ticket-percent"
                color={COLORS.purple}
                size={24}
              />
              <Text style={{ ...FONTS.h3, marginLeft: 12 }}>Promotion</Text>
            </View>

            <TouchableOpacity style={{
              width: "100%",
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "rgba(0, 0, 0,.3)",
              borderWidth: 1,
              borderRadius: 12,
              marginVertical: 12,
              borderStyle: "dotted"
            }}>
              <Text style={{ ...FONTS.body3 }}>Add Promotion</Text>
            </TouchableOpacity>
          </View>
          <Button
            title="Payment Process"
            filled
            onPress={()=>navigation.navigate("SelectPaymentMethod")}
          />
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
  cardContainer: {
    width: SIZES.width - 32,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginVertical: 16,
    padding: 8
  },
  view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomColor: "rgba(0, 0, 0,.1)"
  },
  separateLine: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0,.2)",
    marginVertical: 8
  }
})
export default TickerOrderDetails