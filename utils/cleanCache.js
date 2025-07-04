import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

const CACHE_KEY = 'lastCacheClear';

const clearCacheIfNeeded = async () => {
  try {
    const lastCleared = await AsyncStorage.getItem(CACHE_KEY);
    const now = new Date();

    if (lastCleared) {
      const lastDate = new Date(lastCleared);
      const diffMs = now - lastDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays >= 5) {
        await FastImage.clearMemoryCache();
        await FastImage.clearDiskCache();
        await AsyncStorage.setItem(CACHE_KEY, now.toISOString());
        console.log('✅ Caché de imágenes limpiada (cada 5 días)');
      } else {
        console.log(`🕒 Aún no se cumplen 5 días (${Math.floor(diffDays)} días pasados)`);
      }
    } else {
      // Primera vez
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();
      await AsyncStorage.setItem(CACHE_KEY, now.toISOString());
      console.log('✅ Caché de imágenes limpiada por primera vez');
    }
  } catch (error) {
    console.error('❌ Error limpiando caché automáticamente', error);
  }
};

export const useAutoClearImageCache = () => {
  useEffect(() => {
    clearCacheIfNeeded();
  }, []);
};
