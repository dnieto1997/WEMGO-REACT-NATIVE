// AppNavigation.js
import React, {useState, useEffect, useContext} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../context/SocketContext';

// Importa tus screens
import {
  AddNewCard,
  Call,
  AddStory,
  ChangePassword,
  CreateEvent,
  CreateEventV2,
  CreatePassword,
  Dashboard,
  Earning,
  EventDetails,
  EventGoing,
  EventsYouJoined,
  FavouriteEvent,
  FeaturedEvents,
  FindFriends,
  Followers,
  ForgetPassword,
  ForgetPasswordEmailCode,
  FriendTimeline,
  Gender,
  GroupVideoCall,
  Interests,
  Login,
  Menbership,
  MessageDetails,
  MessageV1,
  MessageV2,
  OTPVerification,
  Onboarding,
  Onboarding2,
  Onboarding3,
  PaymentMethod,
  PaymentSuccessful,
  PhoneNumber,
  Profile,
  ProfileDetails,
  ReferAndEarn,
  Review,
  SearchEvent,
  SearchLocation,
  SelectLocation,
  SelectPaymentMethod,
  Settings,
  Signup,
  SuccessAccount,
  TickerOrderDetails,
  Ticket,
  TodoList,
  UpcomingEvents,
  Welcome,
  YourEvent,
  OTPVerification2,
  ChangePassword2,
  ViewStories,
  Post,
  Notifications,
  EditFeed,
  EditEvent,
  Following,
  PrivacySettings,
  PublicPatchScreen,
  PrivatePatchScreen,
  Parches,
  DetailsParches,
  ChatParche,
  AddPublicParche,
} from '../screens';
import BottomTabNavigation from './BottomTabNavigation';
import {navigationRef} from '../utils/NavigationService';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        const launch = await AsyncStorage.getItem('alreadyLaunched');
        const userData = await AsyncStorage.getItem('userData');

        if (launch === null) {
          // Primera vez en la app
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setIsFirstLaunch(true);
          setIsLoggedIn(false);
        } else {
          setIsFirstLaunch(false);
          if (userData) {
            setIsLoggedIn(true); // ya tiene login guardado
          } else {
            setIsLoggedIn(false); // no hay login guardado
          }
        }
      } catch (error) {
        console.error('Error al verificar estado de la app:', error);
        setIsFirstLaunch(true);
        setIsLoggedIn(false);
      }

      setIsLoading(false);
    };

    checkAppStatus();
  }, []);

  if (isLoading) return null;

  let initialRoute;

  if (isFirstLaunch === true) {
    initialRoute = 'Login';
  } else if (isLoggedIn === true) {
    initialRoute = 'Main';
  } else {
    initialRoute = 'Login';
  }



  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={initialRoute}>
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="ChangePassword2" component={ChangePassword2} />
        <Stack.Screen name="CreateEvent" component={CreateEvent} />
        <Stack.Screen name="AddStory" component={AddStory} />
        <Stack.Screen name="ViewStories" component={ViewStories} />
        <Stack.Screen name="Post" component={Post} />
        <Stack.Screen name="CreateEventV2" component={CreateEventV2} />
        <Stack.Screen name="CreatePassword" component={CreatePassword} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Earning" component={Earning} />
        <Stack.Screen name="EventDetails" component={EventDetails} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="FindFriends" component={FindFriends} />
        <Stack.Screen name="Followers" component={Followers} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
         <Stack.Screen name="PublicPatchScreen" component={PublicPatchScreen} />
          <Stack.Screen name="PrivatePatchScreen" component={PrivatePatchScreen} />
           <Stack.Screen name="DetailsParches" component={DetailsParches} />
             <Stack.Screen name="ChatParche" component={ChatParche} />
               <Stack.Screen name="AddPublicParche" component={AddPublicParche} />
        <Stack.Screen
          name="ForgetPasswordEmailCode"
          component={ForgetPasswordEmailCode}
        />
         <Stack.Screen name="Parches" component={Parches} />
        <Stack.Screen name="FriendTimeline" component={FriendTimeline} />
        <Stack.Screen name="Gender" component={Gender} />
        <Stack.Screen name="GroupVideoCall" component={GroupVideoCall} />
        <Stack.Screen name="Interests" component={Interests} />

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Menbership" component={Menbership} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
        <Stack.Screen name="MessageDetails" component={MessageDetails} />
        <Stack.Screen name="Message" component={MessageV2} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="OTPVerification2" component={OTPVerification2} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
        <Stack.Screen name="PaymentSuccessful" component={PaymentSuccessful} />
        <Stack.Screen name="PhoneNumber" component={PhoneNumber} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
        <Stack.Screen name="ReferAndEarn" component={ReferAndEarn} />
        <Stack.Screen name="Review" component={Review} />
        <Stack.Screen name="SearchEvent" component={SearchEvent} />
        <Stack.Screen name="SearchLocation" component={SearchLocation} />
        <Stack.Screen
          name="SelectPaymentMethod"
          component={SelectPaymentMethod}
        />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="SuccessAccount" component={SuccessAccount} />
        <Stack.Screen
          name="TickerOrderDetails"
          component={TickerOrderDetails}
        />
        <Stack.Screen name="Ticket" component={Ticket} />
        <Stack.Screen name="TodoList" component={TodoList} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="YourEvent" component={YourEvent} />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        <Stack.Screen name="Onboarding3" component={Onboarding3} />
        <Stack.Screen name="SelectLocation" component={SelectLocation} />
        <Stack.Screen name="Main" component={BottomTabNavigation} />
        <Stack.Screen name="FeaturedEvents" component={FeaturedEvents} />
        <Stack.Screen name="UpcomingEvents" component={UpcomingEvents} />
        <Stack.Screen name="EventsYouJoined" component={EventsYouJoined} />
        <Stack.Screen name="FavouriteEvent" component={FavouriteEvent} />
        <Stack.Screen name="EventGoing" component={EventGoing} />
        <Stack.Screen name="AddNewCard" component={AddNewCard} />
        <Stack.Screen name="EditFeed" component={EditFeed} />
        <Stack.Screen name="EditEvent" component={EditEvent} />
        <Stack.Screen name="Following" component={Following} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
