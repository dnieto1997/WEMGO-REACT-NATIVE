import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { COLORS, SIZES } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from "react-native-vector-icons/AntDesign"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { ScrollView } from 'react-native-virtualized-view'
import MembershipCard from '../components/MembershipCard'
import Button from '../components/Button'

const Menbership = ({ navigation }) => {
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
        <Text style={styles.headerText}>Menbership</Text>
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
    const [isChecked, setChecked] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState(null);

    const memberships = [
      { title: 'Weekly', subtitle: 'Pay for 7 days', price: '$9.99' },
      { title: 'Monthly', subtitle: 'Pay Monthly get more features', price: '$19.99' },
      { title: 'Yearly', subtitle: 'Pay for a full yearly', price: '$199.99' },
      // Add more memberships as needed
    ];

    return (
      <View>
        <View style={styles.menbershipCard}>
          <FontAwesome5
            name="crown"
            size={72}
            color={COLORS.white}
          />
          <View style={{ marginLeft: 22 }}>
            <Text style={styles.menbershipTitle}>Join Our Premium</Text>
            <Text style={styles.menbershipSubtitle}>Unlimited Features</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          {memberships.map((membership, index) => (
            <MembershipCard
              key={index}
              title={membership.title}
              subtitle={membership.subtitle}
              price={membership.price}
              isSelected={index === selectedMembership}
              onSelect={() => setSelectedMembership(index)}
            />
          ))}
        </View>
        <Text style={styles.aggreementTitle}>No Commitment . Cancel anytime***</Text>
        <Button
          title="Subscribe Now"
          filled
          style={{ marginVertical: 16 }}
          onPress={() => navigation.navigate("SelectPaymentMethod")}
        />
        <Text style={styles.aggreementTitle}>By continue, you have agreed to our</Text>
        <Text style={[styles.aggreementTitle, { color: COLORS.primary, marginTop: 6 }]}>Terms of Service Privacy Policy</Text>
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
    width: SIZES.width - 32,
    height: 120,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22
  },
  menbershipTitle: {
    fontSize: 20,
    fontFamily: "Roboto Bold",
    color: COLORS.white,
    marginBottom: 6
  },
  menbershipSubtitle: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: COLORS.white
  },
  aggreementTitle: {
    fontSize: 14,
    fontFamily: "Roboto Medium",
    color: COLORS.black,
    textAlign: "center"
  }
})
export default Menbership