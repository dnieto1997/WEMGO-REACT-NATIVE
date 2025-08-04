import {View, Text, Platform} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  CreateEvent,
  CreateEventV2,
  HomeV1,
  HomeV2,
  Profile,
  ProfileV2,
  Reels,
  SearchEvent,
  ShareTypeScreen,
  TodoList,
} from '../screens';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {COLORS} from '../constants';

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: Platform.OS === 'ios' ? 80 : 70,
    backgroundColor: COLORS.white,
    borderRadius: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    paddingHorizontal: 10,
    borderTopWidth: 0,
  },
};

const BottomTabNavigation = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions} initialRouteName="Event">

      <Tab.Screen
        name="Event"
        component={HomeV1}
        listeners={({navigation, route}) => ({
    tabPress: e => {
      // Permite la navegación normal
      navigation.navigate('Event', { refresh: Date.now() });
    },
  })}
        options={{
          unmountOnBlur: false,
          tabBarIcon: ({focused}) => {
            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialCommunityIcons
                  name="home"
                  color={focused ? '#944af5' : COLORS.black}
                  size={30}
                />
              </View>
            );
          },
        }}
      />

            <Tab.Screen
        name="Explore"
        component={SearchEvent}
        options={{
          unmountOnBlur: false,
          tabBarIcon: ({focused}) => {
            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  color={focused ? '#944af5' : COLORS.black}
                  size={30}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="ShareTypeScreen"
        component={ShareTypeScreen}
        options={{
          unmountOnBlur: true,
           tabBarStyle: { display: 'none' },
          tabBarIcon: () => {
            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#9550f3',
                  height: Platform.OS == 'ios' ? 60 : 50,
                  width: Platform.OS == 'ios' ? 60 : 50,
                  top: Platform.OS == 'ios' ? -6 : -8,
                  borderRadius: Platform.OS == 'ios' ? 35 : 30,
                  borderWidth: 2,
                  borderColor: COLORS.white,
                  top: 0.5,
                }}>
                <Entypo name="plus" size={30} color={COLORS.white} />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Reels"
        component={Reels}
        options={{
          unmountOnBlur: false,
           tabBarStyle: { display: 'none' },
          tabBarIcon: ({focused}) => {
            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialCommunityIcons
                  name="motion-play"
                  color={focused ? '#944af5' : COLORS.black}
                  size={30}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          unmountOnBlur: false,
          tabBarIcon: ({focused}) => {
            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialCommunityIcons
                  name="account-edit"
                  color={focused ? '#944af5' : COLORS.black}
                  size={30}
                />
              </View>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
