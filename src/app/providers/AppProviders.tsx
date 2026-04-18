import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nProvider} from '../../i18n/context';
import {createAppQueryClient} from '../../shared/api/queryClient';
import {SessionProvider} from '../../features/auth/session/SessionProvider';
import {AppUpdateProvider} from '../../features/updates/context/AppUpdateProvider';
import {useOnlineManager} from '../../shared/hooks/useOnlineManager';
import {useAppStateFocus} from '../../shared/hooks/useAppStateFocus';
import {ThemeProvider} from '../theme/context';

export function AppProviders({children}: {children: React.ReactNode}) {
  useOnlineManager();
  useAppStateFocus();

  const [queryClient] = React.useState(() => createAppQueryClient());

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <AppUpdateProvider>
              <SessionProvider>{children}</SessionProvider>
            </AppUpdateProvider>
          </I18nProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
