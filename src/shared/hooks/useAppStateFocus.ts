import React from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {focusManager} from '@tanstack/react-query';

export function useAppStateFocus() {
  React.useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };

    onAppStateChange(AppState.currentState);

    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
}
