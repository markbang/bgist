import React from 'react';
import {onlineManager} from '@tanstack/react-query';

type NetInfoModule = {
  addEventListener: (
    listener: (state: {
      isConnected: boolean | null;
      isInternetReachable: boolean | null;
    }) => void,
  ) => () => void;
};

export function useOnlineManager() {
  React.useEffect(() => {
    let unsubscribe = () => {};

    try {
      const netInfoModule = require('@react-native-community/netinfo') as {
        default?: NetInfoModule;
      } & NetInfoModule;
      const netInfo = netInfoModule.default ?? netInfoModule;

      unsubscribe = netInfo.addEventListener(state => {
        const isOnline = state.isInternetReachable ?? state.isConnected ?? true;
        onlineManager.setOnline(isOnline);
      });
    } catch {
      onlineManager.setOnline(true);
    }

    return unsubscribe;
  }, []);
}
