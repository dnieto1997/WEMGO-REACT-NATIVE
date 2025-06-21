import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigate } from './NavigationService';

// Maneja clic en la notificación
const onNotificationClick = async data => {
  if (!data) return;
  console.log('🔗 Clic en notificación:', data);

  let extraData = {};
  try {
    extraData = JSON.parse(data.extraData || data.extradata || '{}');
  } catch (e) {
    extraData = {};
  }

  const { type, ...params } = data;

  switch (type) {
    case 'message':
      navigate('MessageDetails', { id: extraData.senderId });
      break;
    case 'event':
      navigate('EventDetails', { ...params, ...extraData });
      break;
    case 'comment':
      navigate('Comments', { ...params, ...extraData });
      break;
    case 'feed_notification':
      navigate('Post', { id: extraData.id });
      break;
    default:
      navigate('Home', { ...params, ...extraData });
      break;
  }
};

// Mostrar notificación local solo si tiene contenido
export const showLocalNotification = async remoteMessage => {
  await notifee.requestPermission();

  const { title, body } = remoteMessage.notification || {};
  const { data } = remoteMessage;

  if (!title && !body) {
    console.warn('🚫 Notificación sin contenido, no se muestra');
    return;
  }

  const channelId = await notifee.createChannel({
    id: 'messages_channel',
    name: 'Mensajes',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: title || 'Nuevo Mensaje',
    body: body || 'Tienes un nuevo mensaje.',
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
    data,
  });
};

// Configura todos los listeners
export const setupNotificationHandlers = () => {
  // App abierta desde notificación (background)
  messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage?.data) {
      onNotificationClick(remoteMessage.data);
    }
  });

  // App inicia desde cerrado (kill)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.data) {
        console.log('🔄 App abierta desde estado cerrado:', remoteMessage);
        onNotificationClick(remoteMessage.data); // solo navegación
      }
    });

  // Primer plano: mostrar manualmente
  messaging().onMessage(async remoteMessage => {
    console.log('📩 Notificación en primer plano:', remoteMessage);
    await showLocalNotification(remoteMessage);
  });

  // Segundo plano (background): también mostrar manualmente
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📥 Segundo plano: mensaje recibido:', remoteMessage);
    await showLocalNotification(remoteMessage);
  });

  // Detecta clics en primer plano (notifee)
  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('🖱️ Foreground: usuario tocó notificación:', detail.notification?.data);
      onNotificationClick(detail.notification?.data);
    }
  });
};
