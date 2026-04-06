import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nProvider} from '../../i18n/context';
import {createAppQueryClient} from '../../shared/api/queryClient';

const queryClient = createAppQueryClient();

export function AppProviders({children}: {children: React.ReactNode}) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>{children}</I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
