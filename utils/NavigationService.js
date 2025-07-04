// NavigationService.js
import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Navegación normal
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('Navigation is not ready');
  }
}

// Navegación con push
export function push(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  } else {
    console.warn('Navigation is not ready');
  }
}

// Navegación segura con reintentos
export function navigateWhenReady(name, params, retries = 10) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else if (retries > 0) {
    setTimeout(() => {
      navigateWhenReady(name, params, retries - 1);
    }, 300);
  } else {
    console.warn(`❌ Navigation still not ready after ${10} attempts`);
  }
}
