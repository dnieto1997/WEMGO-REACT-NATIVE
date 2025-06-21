import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'
import React from 'react'
import { COLORS, SIZES, images } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from "react-native-vector-icons/AntDesign"
import Feather from "react-native-vector-icons/Feather"
import { ScrollView } from 'react-native-virtualized-view'
import Clipboard from '@react-native-clipboard/clipboard';
import Button from '../components/Button'

const ReferAndEarn = ({ navigation }) => {
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
        <Text style={styles.headerText}>Refer & Earn</Text>
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
    const codeToCopy = 'GGTFD2565'; 

    const handleCopyCode = async () => {
      await Clipboard.setString(codeToCopy);
      Alert.alert('Code copied to clipboard!');
    };
    return (
      <View style={{ alignItems: "center" }}>
        <Image
          source={images.illustration1}
          resizeMode='contain'
          style={styles.illustration}
        />
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Refer and Earn</Text>
          <Text style={styles.cardSubtitle}>Share this code with your friend and both of you will get $12.</Text>
        </View>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{codeToCopy}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 12 }} onPress={handleCopyCode}>
              <Feather name="copy" color={COLORS.primary} size={24} />
            </TouchableOpacity>
            <Text style={styles.copyCode}>Copy Code</Text>
          </View>
        </View>
        <Button
          title="Invite Friends"
          filled
          onPress={() => navigation.navigate("Menbership")}
          style={{
            width: SIZES.width - 32
          }}
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
  illustration: {
    width: 210,
    height: 148,
    marginVertical: 48
  },
  cardContainer: {
    height: 120,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Roboto Bold",
    color: COLORS.primary,
    marginVertical: 16
  },
  cardSubtitle: {
    fontSize: 16,
    fontFamily: "Roboto Regular",
    color: "gray",
    paddingHorizontal: 22,
    textAlign: "center"
  },
  codeContainer: {
    height: 56,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    flexDirection: "row",
    paddingHorizontal: 24,
    marginVertical: 16,
    justifyContent: "space-between",
    alignItems: "center"
  },
  code: {
    fontSize: 16,
    fontFamily: "Roboto Medium",
    color: COLORS.black
  },
  copyCode: {
    fontSize: 13,
    fontFamily: "Roboto Medium",
    color: COLORS.primary
  }
})

export default ReferAndEarn