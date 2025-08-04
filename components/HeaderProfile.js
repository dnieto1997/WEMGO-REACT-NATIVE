// components/HeaderProfile.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import HeaderSinlogo from './HeaderSinlogo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HeaderProfile = ({
  user,
  isFollowing,
  Followers,
  Following,
  countFeed,
  onFollow,
  onOpenImage,
  navigation,
  userId,
  onRefresh,
  onShare
}) => {
  const screenWidth = Dimensions.get('window').width ;
  return (
    <View style={styles.profileContainer}>
      <View style={{ top: 10 }}>
        <HeaderSinlogo onRefresh={onRefresh} />
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 25 }}>
        <TouchableOpacity onPress={onOpenImage}>
          <Image source={{ uri: String(user.img) }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={{ marginLeft: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>{user.first_name + ' ' + user.last_name}</Text>
            {user.checked == '1' && (
              <MaterialIcons name="verified" size={18} color="#3897f0" style={{ marginLeft: 6 }} />
            )}
          </View>
        <View style={{...styles.followRow,width:screenWidth-140}}>
  <TouchableOpacity style={styles.statItem}>
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.numItem}>{countFeed ?? 0}</Text>
      <Text style={styles.nameItem}>MomentGo</Text>
    </View>
  </TouchableOpacity>

  <View style={styles.line} />

  <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Followers', { id: userId })}>
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.numItem}>{Followers ?? 0}</Text>
      <Text style={styles.nameItem}>Seguidores</Text>
    </View>
  </TouchableOpacity>

  <View style={styles.line} />

  <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Following', { id: userId })}>
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.numItem}>{Following ?? 0}</Text>
      <Text style={styles.nameItem}>Siguiendo</Text>
    </View>
  </TouchableOpacity>
</View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text style={styles.address} numberOfLines={4}>{user.description || ''}</Text>
      </View>
      <View style={styles.buttonContainerFull}>
        <TouchableOpacity
          style={[styles.fullButton, isFollowing ? styles.following : styles.notFollowing]}
          onPress={onFollow}>
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name={isFollowing ? 'account-remove' : 'account-check'} color={COLORS.black} size={24} />
            <Text style={styles.buttonText}>{isFollowing ? 'Dejar de seguir' : 'Seguir'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fullButton, styles.messageButton]}
          onPress={() => navigation.navigate('MessageDetails', { id: userId })}>
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="message-plus-outline" color={COLORS.black} size={24} />
            <Text style={styles.buttonText}>Mensaje</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[]}
          onPress={onShare}>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    paddingBottom: 16,
    backgroundColor: '#200f39',
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcon: {
    height: 42,
    width: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  address: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#ccc',
    marginTop: 8,
  },
  numItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameItem: {
    fontSize: 13,
    color: '#aaa',
  },
  line: {
    width: 1,
    backgroundColor: '#444',
    marginHorizontal: 12,
  },
  followRow: {
    flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
 
  paddingHorizontal: 10,
  marginTop: 8,
  },
  buttonContainerFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  fullButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#a277f8',
  },
  following: {
    backgroundColor: '#999',
  },
  notFollowing: {
    backgroundColor: '#a277f8',
  },
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
});

export default HeaderProfile;