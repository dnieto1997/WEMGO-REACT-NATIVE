import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native'
import React from 'react'
import { COLORS, images } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import { featuredEvents } from '../data'
import FeaturedEventCard from '../components/FeaturedEventCard'
import { ScrollView } from 'react-native-virtualized-view'

const btnNav = [
  {
    id: "1",
    name: "Post"
  },
  {
    id: "2",
    name: "Favorite"
  },
  {
    id: "3",
    name: "Like you"
  },
  {
    id: "4",
    name: "Save"
  }
]
const ProfileV2 = ({ navigation }) => {
  /**
   * Render Header
   */

  const renderProfileCard = () => {
    return (
      <View style={styles.profileCardContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={()=>navigation.navigate("FindFriends")}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={24}
              color={COLORS.black}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={()=>navigation.navigate("Message")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={COLORS.black}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={styles.avatarContainer}>
            <Image
              source={images.avatar3}
              resizeMode='contain'
              style={styles.avatar}
            />
          </View>
          <Text style={styles.avatarName}>Jenifer Lopez</Text>
          <TouchableOpacity style={styles.professionContainer}>
            <Text style={styles.profession}>Actress</Text>
          </TouchableOpacity>
          <View style={styles.summaryContainer}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.itemNum}>735</Text>
              <Text style={styles.itemName}>Post</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.itemNum}>876</Text>
              <Text style={styles.itemName}>Following</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.itemNum}>568</Text>
              <Text style={styles.itemName}>Followers</Text>
            </View>
          </View>
          <TouchableOpacity 
          onPress={()=>navigation.navigate("Followers") }
          style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  /**
   * Render button selector
   */

  const renderBtnSelector = ()=>{
    return (
      <View>
        <View style={{
          alignItems: "center",
          marginVertical: 12
        }}>
        <FlatList
          horizontal
          data={btnNav}
          keyExtractor={item=>item.id}
          renderItem={({ item })=>(
            <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>{item.name}</Text>
        </TouchableOpacity>
          )}
        />
        </View>
      </View>
    )
  }

  /**
   * render user posts
   */

  const renderUserPosts = ()=>{
    return (
      <View>
          <View style={{padding: 16}}>
         <FlatList
           data={featuredEvents}
           horizontal
           showsHorizontalScrollIndicator={false}
           keyExtractor={item=>item.id}
           renderItem={({ item })=>(
            <FeaturedEventCard
              eventImage={item.eventImage}
              eventTitle={item.eventTitle}
              eventAddress={item.eventTitle}
              days={item.days}
              months={item.months}
              attenderImage1={item.attenderImage1}
              attenderImage2={item.attenderImage2}
              attenderImage3={item.attenderImage3}
              attenderImage4={item.attenderImage4}
            />
           )}
         />
      </View>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileCard()}
        {renderBtnSelector()}
        {renderUserPosts()}
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
  },
  itemNum: {
    fontSize: 20,
    fontFamily: "Roboto Bold",
    color: COLORS.black,
  },
  itemName: {
    fontSize: 10,
    fontFamily: "Roboto Regular",
    color: COLORS.black
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 8
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.black
  },
  profileCardContainer: {
    backgroundColor: COLORS.white,
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  avatarContainer: {
    height: 110,
    width: 110,
    borderWidth: 6,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999
  },
  avatar: {
    height: 106,
    width: 106,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.white
  },
  avatarName: {
    fontSize: 25,
    fontFamily: "Roboto Bold",
    color: COLORS.black,
    marginVertical: 16
  },
  professionContainer: {
    width: 74,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    marginBottom: 22
  },
  profession: {
    fontSize: 12,
    fontFamily: "Roboto Medium",
    color: COLORS.white
  },
  summaryContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: 270
  },
  followBtn: {
    width: 160,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    marginTop: 20,
    marginBottom: 4
  },
  followBtnText: {
    fontSize: 13,
    fontFamily: "Roboto Bold",
    color: COLORS.white
  }
})
export default ProfileV2