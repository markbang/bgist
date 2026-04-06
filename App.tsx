import React from 'react';
import ErrorBoundary from './src/components/ErrorBoundary';
import {RootNavigator} from './src/app/navigation/RootNavigator';
import {AppProviders} from './src/app/providers/AppProviders';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}
