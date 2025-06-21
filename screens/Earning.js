import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import { ScrollView } from 'react-native-virtualized-view'
import { COLORS, SIZES, FONTS, icons, images } from '../constants'
import Feather from "react-native-vector-icons/Feather"
import { BarChart } from 'react-native-chart-kit';
import TicketStatsItem from '../components/TicketStatsItem'

const Earning = () => {
  // Mock data for the bar chart
  const data = {
    labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 62],
      },
    ],
  };
  /**
   * Render card container
   */

  const renderCardContainer = () => {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.balance}>Balance</Text>
        <Text style={styles.amount}>$20,700</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View>
            <Text style={styles.cardNumber}>**** ****</Text>
            <Text style={styles.cardNumber}>****</Text>
          </View>
          <Text style={styles.cardLastNumber}>8061</Text>
        </View>
        <Text style={styles.cardText}>CARD HOLDER</Text>
        <Text style={styles.cardHolderName}>Alexa Smith</Text>
        <Image
          source={images.elipse}
          resizeMode="contain"
          style={styles.elipse1}
        />
        <Image
          source={images.elipse}
          resizeMode="contain"
          style={styles.elipse2}
        />
        <Image
          source={images.elipse}
          resizeMode="contain"
          style={styles.elipse3}
        />
      </View>
    )
  }

  /**
   * Render icome statistics
   */

  const renderIcomeStatistics = () => {
    return (
      <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 32 }}>
            <View style={{ height: 16, width: 16, borderRadius: 999, backgroundColor: COLORS.purple }} />
            <Text style={{ ...FONTS.h3, marginLeft: 10 }}>Income</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ height: 16, width: 16, borderRadius: 999, backgroundColor: COLORS.primary }} />
            <Text style={{ ...FONTS.h3, marginLeft: 10 }}>Withdraw</Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: 88,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: COLORS.black,
            flexDirection: "row"
          }}>
          <Text style={{ ...FONTS.h3, marginRight: 8 }}>Week</Text>
          <Feather name="chevron-down" size={14} color={COLORS.black} />
        </TouchableOpacity>
      </View>
      <View style={{
        height: 220,
        marginVertical: 16,
        width: SIZES.width - 32,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <BarChart
        data={data}
        width={SIZES.width - 64}
        height={220}
        yAxisLabel="Count"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(107, 66, 221, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
      />
      </View>
      </View>
    )
  }

  /**
   * Render Ticket Statistics
   */

  const renderTicketStatistics = ()=>{
    return (
      <View>
         <TicketStatsItem
           title="Ticket Sold" 
           subtitle="100/500 Ticket"
           percentage={50}
         />
          <TicketStatsItem
           title="VIP Ticket For Table" 
           subtitle="100/500 Ticket"
           percentage={50}
         />
          <TicketStatsItem
           title="Business Ticket Table" 
           subtitle="100/500 Ticket"
           percentage={10}
         />
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Earning" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderCardContainer()}
          {renderIcomeStatistics()}
          {renderTicketStatistics()}
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
    padding: 16
  },
  cardContainer: {
    height: 200,
    width: SIZES.width - 32,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    marginVertical: 22,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  balance: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: COLORS.white
  },
  amount: {
    fontSize: 32,
    fontFamily: "Roboto Bold",
    color: COLORS.white,
    marginVertical: 12
  },
  cardNumber: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.white
  },
  cardLastNumber: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: COLORS.white,
    marginLeft: 52
  },
  cardText: {
    color: "#F3F3F3",
    fontSize: 12,
    fontFamily: "Roboto Regular",
  },
  cardHolderName: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: COLORS.white,
    marginTop: 6
  },
  elipse1: {
    position: "absolute",
    top: - 30,
    right: -30
  },
  elipse2: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 9999
  },
  elipse3: {
    position: "absolute",
    bottom: -30,
    right: -30
  }
})

export default Earning