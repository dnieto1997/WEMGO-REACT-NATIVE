import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { SocketProvider } from './context/SocketContext';
import AppNavigation from './navigations/AppNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupNotificationHandlers } from './utils/NotificationHandler'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAutoClearImageCache } from './utils/cleanCache';
import { navigateToProfileOrFriendTimeline } from './utils/navigateToProfile';
import { navigationRef } from './utils/NavigationService';

const App = () => {
 
  useAutoClearImageCache();

useEffect(() => {
  const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permiso requerido', 'Activa las notificaciones en configuración.');
      }
    } else {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        Alert.alert('Permiso requerido', 'Activa las notificaciones en configuración.');
      }
    }
  };

  requestUserPermission();
  setupNotificationHandlers();

  Linking.getInitialURL().then(processUrl);
  const linkingListener = Linking.addEventListener('url', ({ url }) => {
    processUrl(url);
  });

  return () => {
    linkingListener.remove();
  };
}, []);


const processUrl = async (url, retry = 0) => {
  try {
    if (!url) return;

    console.log('🔗 URL recibida:', url);
    const match = url.match(/wemgo:\/\/(profile|event|chat|feed|reel)\/(\d+)/);
    if (!match) return;

    const [, type, id] = match;

 
 await navigateToProfileOrFriendTimeline(type,id);
   

   
  } catch (err) {
    console.error('❌ Error procesando el deep link:', err);
  }
};

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SocketProvider>
          <AppNavigation navigationRef={navigationRef} />
        </SocketProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
