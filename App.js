import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { SocketProvider } from './context/SocketContext';
import AppNavigation from './navigations/AppNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupNotificationHandlers } from './utils/NotificationHandler'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const App = () => {
  useEffect(() => {
    const requestUserPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso requerido', 'Necesitamos permisos para enviar notificaciones. Por favor, habilítelos en la configuración.');
        }
      } else {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          Alert.alert('Permiso requerido', 'Necesitamos permisos para enviar notificaciones. Por favor, habilítelos en la configuración.');
        }
      }
    };

    requestUserPermission();
    setupNotificationHandlers(); 

  }, []);

 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      
      <SocketProvider>
        <AppNavigation />
      </SocketProvider>
     
    </SafeAreaProvider>
   </GestureHandlerRootView>
  );
};

export default App;