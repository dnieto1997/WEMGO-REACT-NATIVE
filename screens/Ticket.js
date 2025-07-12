import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native-virtualized-view'
import { COLORS, SIZES, FONTS, icons, images } from '../constants'
import Button from '../components/Button'


const Ticket = ({ navigation }) => {
  const [basicTicketQuantity, setBasicTicketQuantity] = useState(0);
  const [vipTicketQuantity, setVipTicketQuantity] = useState(0);
  const [businessTicketQuantity, setBusinessTicketQuantity] = useState(0)
 
  return (
    <SafeAreaView style={styles.area}>
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconContainer}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
         <View style={styles.ticketContainer}>
            <Image
              source={images.event3}
              resizeMode='cover'
              style={styles.eventImage}
            />
            <View>
               <Text style={styles.eventTitle}>Seraton Food Explore Event</Text>
               <Text style={styles.eventAddress}>Town Hall Islington London</Text>
               <Text style={styles.eventDate}>Sat, Dec 2022, at 12.00 PM</Text>
            </View>
         </View>
         <View style={styles.view}>
            <Text style={styles.viewLeft}>Total: BVBx1x2x3</Text>
            <Text style={styles.viewRight}>$60.00</Text>
         </View>
         <View style={styles.ticketItemContainer}>
            <View style={{ marginLeft: 12}}>
              <Text style={styles.ticketTitle}>Basic Ticket</Text>
              <Text style={styles.ticketPrice}>Per Ticket $20.00</Text>
            </View>
            <View style={{ flexDirection: "row" , alignItems: "center", marginRight: 16}}>
              <Text style={{...FONTS.h4}}>Qty:{"   "}</Text>
              <View style={styles.qtyBtn}>
                 <TouchableOpacity
                  onPress={()=>{
                    if(basicTicketQuantity > 0) {
                      setBasicTicketQuantity(basicTicketQuantity - 1); //
                    }
                  }}
                 >
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={{...FONTS.h4}}>{basicTicketQuantity}</Text>
                <TouchableOpacity
                  onPress={()=>{
                      setBasicTicketQuantity(basicTicketQuantity+ 1); //
                  }}
                >
                 <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
         </View>
         <View style={[styles.ticketItemContainer, { borderLeftColor: COLORS.blue }]}>
            <View style={{ marginLeft: 12}}>
              <Text style={styles.ticketTitle}>VIP Ticket</Text>
              <Text style={styles.ticketPrice}>Per Ticket $30.00</Text>
            </View>
            <View style={{ flexDirection: "row" , alignItems: "center", marginRight: 16}}>
              <Text style={{...FONTS.h4}}>Qty:{"   "}</Text>
              <View style={styles.qtyBtn}>
                 <TouchableOpacity
                  onPress={()=>{
                    if(vipTicketQuantity > 0) {
                      setVipTicketQuantity(vipTicketQuantity - 1); //
                    }
                  }}
                 >
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={{...FONTS.h4}}>{vipTicketQuantity}</Text>
                <TouchableOpacity
                  onPress={()=>{
                      setVipTicketQuantity(vipTicketQuantity+ 1); //
                  }}
                >
                 <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
         </View>
         <View style={[styles.ticketItemContainer, { borderLeftColor: COLORS.purple}]}>
            <View style={{ marginLeft: 12}}>
              <Text style={styles.ticketTitle}>Business Ticket</Text>
              <Text style={styles.ticketPrice}>Per Ticket $40.00</Text>
            </View>
            <View style={{ flexDirection: "row" , alignItems: "center", marginRight: 16}}>
              <Text style={{...FONTS.h4}}>Qty:{"   "}</Text>
              <View style={styles.qtyBtn}>
                 <TouchableOpacity
                  onPress={()=>{
                    if(businessTicketQuantity > 0) {
                      setBusinessTicketQuantity(businessTicketQuantity - 1);
                    }
                  }}
                 >
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={{...FONTS.h4}}>{businessTicketQuantity}</Text>
                <TouchableOpacity
                  onPress={()=>{
                      setBusinessTicketQuantity(businessTicketQuantity + 1); 
                  }}
                >
                 <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
         </View>
         <Button
           title="Payment Process"
           onPress={()=>navigation.navigate("TickerOrderDetails")}
           filled
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
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: SIZES.width - 32
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    height: 16,
    width: 16,
    tintColor: COLORS.black
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Roboto Black",
    position: "absolute",
    right: (SIZES.width - 32) / 2 - 32,
    color: "black"
  },
  title: {
    fontSize: 18,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
    marginVertical: 22
  },
  ticketContainer: {
    height: 108,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center"
  },
  eventImage: {
    height: 80,
    width: 80,
    borderRadius: 10,
    marginRight: 16
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.black,
  },
  eventAddress: {
    fontSize: 14,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
    marginVertical: 6
  },
  eventDate: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: COLORS.primary
  },
  viewLeft: {
    fontFamily: "Roboto Bold",
    color: COLORS.black,
    fontSize: 16,
  },
  viewRight: {
    fontFamily: "Roboto Bold",
    color: COLORS.primary,
    fontSize: 16,
  },
  view: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    marginVertical: 22
  },
  ticketItemContainer: {
    height: 70,
    width: SIZES.width - 32,
    borderRadius: 10,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 10,
    marginBottom: 22,
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },
  ticketTitle: {
    fontFamily: "Roboto Bold",
    color: COLORS.black,
    fontSize: 16,
    marginBottom: 8
  },
  ticketPrice: {
    fontFamily: "Roboto Regular",
    color: COLORS.black,
    fontSize: 14
  },
  qtyBtn: {
    width: 56,
    height: 30,
    borderRadius: 14.5,
    borderWidth: 1,
    borderColor: COLORS.black,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12
  }
});

export default Ticket