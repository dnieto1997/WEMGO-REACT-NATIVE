import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, images } from '../constants'
import Button from '../components/Button'

const PaymentSuccessful = ({ navigation }) => {
  return (
   <SafeAreaView style={styles.area}>
      <View style={styles.container}>
          <Image
            source={images.successIllustration}
            resizeMode='contain'
            style={styles.successIllustration}
          />
          <View style={styles.successCard}>
             <Text style={styles.title}>Payment successful!</Text>
             <Text style={styles.subtitle}>We will Start Work on time.</Text>
             <Text style={styles.subtitle}>Thank you!</Text>
             <Button
               title="Done"
               filled
               style={styles.doneBtn}
             />
              <Button
               title="Back To Home"
               filled
               style={styles.homeBtn}
               onPress={()=>navigation.navigate("Main")}
             />
          </View>
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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIllustration: {
    width: 240,
    height: 190
  },
  title: {
    fontSize: 22,
    fontFamily: "Roboto Bold",  
    color: COLORS.black,
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: "gray"
  },
  successCard: { 
    alignItems: "center", 
    marginVertical: 32
  },
  doneBtn: {
    width: SIZES.width - 64,
    marginTop: 32
   },
   homeBtn: {
    width: SIZES.width - 64,
    marginTop: 12,
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple
   }
})
export default PaymentSuccessful