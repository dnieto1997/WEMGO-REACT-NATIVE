// utils/navigateToProfile.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateWhenReady } from './NavigationService';

export const navigateToProfileOrFriendTimeline = async (type,userId) => {

  console.log(type,userId)
  try {
    const userStr = await AsyncStorage.getItem('userData');
    
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (!currentUser || !currentUser.id) {
      console.warn('⚠️ No se pudo obtener el usuario actual');
      return;
    }

    if(type=='profile'){
         if (String(currentUser.id) === String(userId)) {
      console.log('➡️ Navegando a mi perfil');
      navigateWhenReady('Profile');
    } else {
      console.log('➡️ Navegando al perfil de otro usuario (FriendTimeline)',userId);
      navigateWhenReady('FriendTimeline', { id: userId });
    }
    }else if(type=='feed'){
      navigateWhenReady('Post',{id:userId})
    }

    else if(type=='event'){
      navigateWhenReady('EventDetails',{id:userId})
    }

 
  } catch (err) {
    console.error('❌ Error obteniendo usuario para navegación:', err);
  }
};
