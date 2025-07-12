import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, FONTS, icons } from '../constants'
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
import LocationItem from '../components/LocationItem'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SearchLocation = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Location</Text>
        </View>
        <View style={styles.searchContainer}>
          <TouchableOpacity>
           <MaterialIcons name="search" size={24} color="#fff"  />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder='Search location'
            placeholderTextColor={COLORS.black}
          />
          <TouchableOpacity>
          <MaterialIcons
  name="close"
  size={24}
  color="#fff"

/>
          </TouchableOpacity>
        </View>
        <View style={styles.addLocationContainer}>
            <TouchableOpacity style={styles.sendIconContainer}>
            <MaterialIcons
  name="send"
  size={24}
  color="#fff"
  
/>
            </TouchableOpacity>
            <Text style={{...FONTS.body3}}>Current Location</Text>
        </View>
         {/* Render maps */}
         <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 48.8566,
                longitude: 2.3522,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
  coordinate={{
    latitude: 48.8566,
    longitude: 2.3522,
  }}
  title="Move"
  description="Address"
  onPress={() => console.log('Move to another screen')}
>
  <MaterialIcons name="location-pin" size={36} color="#d00" />

  <Callout tooltip>
    <View>
      <View style={styles.bubble}>
        <Text
          style={{
            ...FONTS.body4,
            fontWeight: 'bold',
            color: COLORS.black,
          }}
        >
          Event Address
        </Text>
      </View>
      <View style={styles.arrowBorder} />
      <View style={styles.arrow} />
    </View>
  </Callout>
</Marker>
            </MapView>
          <Text style={{...FONTS.h2, color: COLORS.black}}>Address</Text>
          <LocationItem 
            title="428 Greenwich Ave"
            subtitle="Brooklyn, NY"
            onPress={() =>navigation.navigate("Main")}
            />
             <LocationItem 
            title="285 Greenwich Village"
            subtitle="Hermosa Beach, CA"
            onPress={() =>navigation.navigate("Main")}
            />
             <LocationItem 
            title="89 Greenwich Drive"
            subtitle="Manhattan, NY"
            onPress={() =>navigation.navigate("Main")}
            />
             <LocationItem 
            title="65 Greenwich West"
            subtitle="New York, NY"
            onPress={() =>navigation.navigate("Main")}
            />
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
    right: (SIZES.width - 32) / 2 - 64,
    color: "black"
  },
  searchContainer: {
    height: 48,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginVertical: 22,
    alignItems: "center",
    paddingHorizontal: 16,
    flexDirection: "row"
  },
  searchIcon: {
    height: 20,
    width: 20,
    tintColor: COLORS.black
  },
  searchInput: {
    flex: 1,
    marginLeft: 12
  },
  closeIcon: {
    height: 12,
    width: 12,
    tintColor: COLORS.primary
  },
  addLocationContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  sendIconContainer: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "#522ED2",
    marginRight: 16,
  },
  sendIcon: {
    height: 16,
    width: 16,
    tintColor: COLORS.white
  },
  map: {
    height: 152,
    zIndex: 1,
    marginVertical: 22
  },
  // Callout bubble
  bubble: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
    width: 'auto',
  },
  // Arrow below the bubble
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#007a87',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
});

export default SearchLocation