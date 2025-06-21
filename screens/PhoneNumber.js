import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, TouchableWithoutFeedback, FlatList, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../components/Button'
import { COLORS, SIZES, icons } from '../constants'
import { useNavigation } from '@react-navigation/native'

const PhoneNumber = ({ navigation, route }) => {
  const { email } = route.params; 
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { navigate } = useNavigation();

  // fectch codes from rescountries api
  useEffect(() => {
    fetch("https://restcountries.com/v2/all")
      .then(response => response.json())
      .then(data => {
        let areaData = data.map((item) => {
          return {
            code: item.alpha2Code,
            item: item.name,
            callingCode: `+${item.callingCodes[0]}`,
            flag: `https://flagsapi.com/${item.alpha2Code}/flat/64.png`
          }
        });

        setAreas(areaData);
        if (areaData.length > 0) {
          let defaultData = areaData.filter((a) => a.code == "US");

          if (defaultData.length > 0) {
            setSelectedArea(defaultData[0])
          }
        }
      })
  }, [])

   // render countries codes modal
   function renderAreasCodesModal() {

    const renderItem = ({ item }) => {
      return (
        <TouchableOpacity
          style={{
            padding: 10,
            flexDirection: "row"
          }}
          onPress={() => {
            setSelectedArea(item),
              setModalVisible(false)
          }}
        >
          <Image
            source={{ uri: item.flag }}
            contentFit='contain'
            style={{
              height: 30,
              width: 30,
              marginRight: 10
            }}
          />
          <Text style={{ fontSize: 16, color: "#fff" }}>{item.item}</Text>
        </TouchableOpacity>
      )
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <View
              style={{
                height: 400,
                width: SIZES.width * 0.8,
                backgroundColor: COLORS.primary,
                borderRadius: 12
              }}
            >
              <FlatList
                data={areas}
                renderItem={renderItem}
                horizontal={false}
                keyExtractor={(item) => item.code}
                style={{
                  padding: 20,
                  marginBottom: 20
                }}
              />
               </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
         <View style={styles.headerContainer}>
            <TouchableOpacity 
              onPress={()=>navigation.goBack()}
              style={styles.headerIconContainer}>
                <Image
                  source={icons.back}
                  style={styles.back}
                />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Phone Number</Text>
         </View>
         <View style={styles.formContainer}>
          <Text style={styles.title}>Simply enter your phone number to login or create an account.</Text>
         <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.selectFlagContainer}
              onPress={() => setModalVisible(true)}>
              <View style={{ justifyContent: "center" }}>
                <Image
                  source={icons.down}
                  resizeMode='contain'
                  style={styles.downIcon}
                />
              </View>
              <View style={{ justifyContent: "center", marginLeft: 5 }}>
                <Image
                  source={{ uri: selectedArea?.flag }}
                  contentFit="contain"
                  style={styles.flagIcon}
                />
              </View>
              <View style={{ justifyContent: "center", marginLeft: 5 }}>
                <Text style={{ color: "#111", fontSize: 12 }}>{selectedArea?.callingCode}</Text>
              </View>
            </TouchableOpacity>
            {/* Phone Number Text Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.black}
              selectionColor="#111"
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.boldTitle}>By using our mobile app, you agree to our</Text>
          <Text style={styles.title}>and Privacy Policy and Terms of Use</Text>
         </View>
         <Button
           title="Continue"
           filled
           onPress={()=>navigation.navigate("OTPVerification")}
         />
      </View>
      {renderAreasCodesModal()}
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
   right: (SIZES.width - 32)/2 - 64,
   color: "black"
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginVertical: 32,
    padding: 22
  },
  inputContainer: {
    flexDirection: "row",
    borderColor: COLORS.secondaryWhite,
    borderWidth: .4,
    borderRadius: 6,
    height: 58,
    width: SIZES.width - 64,
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: COLORS.secondaryWhite,
  },
  downIcon: { 
    width: 10, 
    height: 10, 
    tintColor: "#111"
   },
   selectFlagContainer: {
    width: 90,
    height: 50,
    marginHorizontal: 5,
    flexDirection: "row",
  },
  flagIcon: {
    width: 30,
    height: 30
  },
  input: {
    flex: 1,
    marginVertical: 10,
    height: 40,
    fontSize: 14,
    color: "#111"
  },
  boldTitle: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.black,
    textAlign: "center"
  },
  title: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
    textAlign: "center"
  }
})

export default PhoneNumber