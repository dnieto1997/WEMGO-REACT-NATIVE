
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('Navigation is not ready');
  }
}


export function push(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  } else {
    console.warn('Navigation is not ready');
  }
}