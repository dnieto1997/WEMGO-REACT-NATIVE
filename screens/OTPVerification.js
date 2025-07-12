import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../components/Button'
import OTPTextInput from 'react-native-otp-textinput';
import { COLORS, SIZES, icons } from '../constants'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const OTPVerification = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Render Resend Code Modal
  const renderResendCodeModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}>
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalSubContainer}>
              <Text style={styles.modalTitle}>Have you not receive Verification</Text>
              <Text style={styles.modalTitle}>Codes OTP</Text>

              <View style={styles.modalMiddleContainer}>
                <Text style={styles.modalMiddleTitle}>An authentication code has been sent to</Text>
                <Text style={styles.modalMiddleTitleBold}>(+880) 111 222 333</Text>
              </View>
              <View style={styles.modalBottomContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                  }}
                  style={styles.btnCancel}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("ForgetPasswordEmailCode")
                  }
                  }
                  style={styles.btnOkay}>
                  <Text style={styles.btnOkayText}>OK</Text>
                </TouchableOpacity>
              </View>
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
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OTP Verification</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>An authentication code has been sent to</Text>
          <Text style={styles.title}>(+880) 111 222 333</Text>
          <View style={{ marginVertical: 22 }}>
            <OTPTextInput
              textInputStyle={styles.OTPStyle}
              inputCount={4}
              tintColor={COLORS.primary}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Text style={styles.title}>I didn't receive code.</Text>
            <TouchableOpacity onPress={() => { setModalVisible(true) }}>
              <Text style={styles.boldTitle}>{" "}Resend Code</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.time}>1:20 Sec left</Text>
        </View>
        <Button
          title="Verify Now"
          filled
          onPress={() => navigation.navigate("CreatePassword")}
        />
      </View>
      {renderResendCodeModal()}
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
    right: (SIZES.width - 32) / 2 - 64,
    color: "black"
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginVertical: 32,
    padding: 22
  },
  boldTitle: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.primary,
    textAlign: "center"
  },
  title: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
    textAlign: "center"
  },
  OTPStyle: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
    borderRadius: 9999,
    height: 58,
    width: 58,
    backgroundColor: COLORS.secondaryWhite,
    borderBottomColor: "transparent"
  },
  time: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.tertiary,
    textAlign: "center",
    marginTop: 10
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalSubContainer: {
    height: 220,
    width: SIZES.width * 0.86,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.primary,
    textAlign: "center"
  },
  modalMiddleContainer: { 
    marginVertical: 16, 
    alignItems: "center" 
  },
  modalMiddleTitle: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: COLORS.black
  },
  modalMiddleTitleBold: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.black
  },
  modalBottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16
  },
  btnCancel: {
    height: 40,
    width: 130,
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 20
  },
  btnCancelText: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.black
  },
  btnOkay: {
    height: 40,
    width: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 20
  },
  btnOkayText: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.white
  }
})
export default OTPVerification