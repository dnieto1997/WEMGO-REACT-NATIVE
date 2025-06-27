import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {navigate, push} from './NavigationService';

// 🔗 Maneja el clic en la notificación
const onNotificationClick = async data => {
  if (!data) return;

  let extraData = {};
  try {
    extraData = JSON.parse(data.extraData || data.extradata || '{}');
  } catch (e) {
    extraData = {};
  }
  console.log(extraData);
  const {type, ...params} = data;

  switch (type) {
    case 'message':
      navigate('MessageDetails', {id: extraData.senderId});
      break;
    case 'event':
      navigate('EventDetails', {...params, ...extraData});
      break;

    case 'feed_notification':
      navigate('Post', {id: extraData.id});
      break;
    case 'reaction_feed':
      push('Post', {id: extraData.feedId});
      break;
    case 'follow_user':
      navigate('FriendTimeline', {id: extraData.follower.id});
      break;
    case 'comment':
      navigate('Post', {
        id: extraData.feedId,
        commentId: extraData.commentId,
      });
      break;

    case 'invitation_parche':
      navigate('DetailsParches', {id: extraData.parchId});
      break;
      case 'invitation_parche':
      navigate('DetailsParches', {id: extraData.parchId});
      break;
        case 'PARCHE_MESSAGE':
      navigate('ChatParche', {id: extraData.id});
      break;
    default:
      navigate('Home', {...params, ...extraData});
      break;
  }
};

// 🔔 Muestra la notificación local (evita duplicados usando ID fijo)
const showLocalNotification = async remoteMessage => {
  await notifee.requestPermission();

  const {title, body} = remoteMessage.notification || {};
  const {data} = remoteMessage;

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
    id: 'feed_notification', // ✅ ID fijo evita acumulación de notificaciones duplicadas
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

// 📥 Configura todos los listeners
export const setupNotificationHandlers = () => {
  // Usuario toca notificación con app en segundo plano
  messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage?.data) {
      onNotificationClick(remoteMessage.data);
    }
  });

  // App abierta desde estado cerrado por notificación
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.data) {
        console.log('🔄 App abierta desde estado cerrado:', remoteMessage);
        onNotificationClick(remoteMessage.data);
      }
    });

  // Mensaje en primer plano: mostrar notificación manualmente
  messaging().onMessage(async remoteMessage => {
    console.log('📩 Primer plano: mensaje recibido:', remoteMessage);
    await showLocalNotification(remoteMessage);
  });

  // Mensaje recibido en segundo plano (con app abierta o minimizada)
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📥 Segundo plano: mensaje recibido:', remoteMessage);

    // Evitar duplicar si FCM ya mostró la notificación (cuando viene con "notification" en el payload)
    if (remoteMessage.notification) {
      console.log('🛑 FCM ya mostró notificación. No se duplica.');
      return;
    }

    await showLocalNotification(remoteMessage);
  });

  // Usuario toca notificación mientras app está en primer plano
  notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.PRESS) {
      console.log('🖱️ Foreground: usuario tocó notificación');
      onNotificationClick(detail.notification?.data);
    }
  });
};

// 🧠 Usuario toca notificación con la app cerrada (background event)
notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    console.log('🖱️ Background: usuario tocó notificación');
    await onNotificationClick(detail.notification?.data);
  }
});
