import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { COLORS } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import { messsagesData, newsData, onlineFriends } from '../data'
import NewsCard from '../components/NewsCard'
import ConversationCard from '../components/ConversationCard'
import { ScrollView } from 'react-native-virtualized-view'

const MessageV1 = () => {

  const renderNews = () => {
    return (
      <View>
         <View style={styles.newsHeaderContainer}>
            <Text style={styles.newsHeaderLeft}>What's New</Text>
            <Text style={styles.newsHeaderRight}>Show all</Text>
         </View>
         <View>
         <FlatList
           data={newsData}
           horizontal
           keyExtractor={item=>item.id}
           showsHorizontalScrollIndicator={false}
           renderItem={({ item })=>(
            <NewsCard
              avatar={item.avatar}
              firstName={item.firstName}
              lastName={item.lastName}
              onPress={()=>console.log(item)}
            />
           )}
         />
         </View>
      </View>
    )
  }

  /**
   * Friends online
   */

  const renderFriendsOnline = ()=>{
    return (
      <View style={{ marginVertical: 22 }}>
         <Text style={styles.onlineTitle}>50 Friends online</Text>
         <FlatList
           data={onlineFriends}
           keyExtractor={item=>item.id}
           horizontal={true}
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={{ marginTop: 12 }}
           renderItem={({ item })=>(
            <TouchableOpacity>
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 12,
                  height: 10,
                  width: 10,
                  borderRadius: 999,
                  backgroundColor: COLORS.green,
                  zIndex: 9999,
                  borderColor: COLORS.white,
                  borderWidth: 1
                }}
              />
              <Image
                source={item.avatar}
                resizeMode='contain'
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 999,
                  marginRight: 12
                }}
              />
            </TouchableOpacity>
           )}
         />
      </View>
    )
  }

  /**
   * Render recent conversations
   */

  const renderRecentConversations = ()=>{
    return (
      <View>
         <Text style={styles.onlineTitle}>Recent Conversations</Text>
         <FlatList
           data={messsagesData}
           keyExtractor={item=>item.id}
           renderItem={({ item })=>(
            <ConversationCard
              fullName={item.fullName}
              lastMessage={item.lastMessage}
              lastTime={item.lastMessageTime}
              avatar={item.userImg}
              onPress={()=>console.log(item)}
            />
           )}
         />
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Message"/>
        <ScrollView showsVerticalScrollIndicator={false}>
        {renderNews()}
        {renderFriendsOnline()}
        {renderRecentConversations()}
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
  newsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 12
   },
   newsHeaderLeft: {
    fontSize: 20,
    fontFamily: "Roboto Bold",
    color: COLORS.black
   },
   newsHeaderRight: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: "#8A8A8F"
   },
   onlineTitle: {
    fontSize: 16,
    fontFamily: "Roboto Bold",
    color: COLORS.black
   }
})

export default MessageV1