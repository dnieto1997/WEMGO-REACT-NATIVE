import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import notifee, { AndroidImportance } from '@notifee/react-native';

// ✅ Manejo de notificaciones en segundo plano
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📥 Mensaje FCM recibido en segundo plano:', remoteMessage);

  // ✅ Crear canal si no existe
  const channelId = await notifee.createChannel({
    id: 'messages_channel',
    name: 'Mensajes',
    importance: AndroidImportance.HIGH,
  });

  // ✅ Mostrar notificación usando data o notification
  await notifee.displayNotification({
    title: remoteMessage.data?.title || remoteMessage.notification?.title ,
    body: remoteMessage.data?.body || remoteMessage.notification?.body ,
      android: {
      channelId,
      importance: AndroidImportance.HIGH,
      sound: 'default',
      smallIcon: 'ic_notification',
      color: '#FF4500',
      pressAction: {
        id: 'default',
      },
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
