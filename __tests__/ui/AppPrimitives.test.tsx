import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {appTheme} from '../../src/app/theme/tokens';
import {AppButton} from '../../src/shared/ui/AppButton';
import {AppCodeBlock} from '../../src/shared/ui/AppCodeBlock';
import {AppEmptyState} from '../../src/shared/ui/AppEmptyState';
import {AppErrorState} from '../../src/shared/ui/AppErrorState';
import {AppInput} from '../../src/shared/ui/AppInput';
import {AppLoadingState} from '../../src/shared/ui/AppLoadingState';

test('AppButton forwards standard Pressable props', () => {
  const onLongPress = jest.fn();

  render(
    <AppButton
      label="Save"
      testID="save-button"
      accessibilityHint="Saves changes"
      hitSlop={12}
      onLongPress={onLongPress}
    />,
  );

  const button = screen.getByTestId('save-button');

  expect(button.props.accessibilityHint).toBe('Saves changes');
  expect(button.props.hitSlop).toBe(12);

  fireEvent(button, 'longPress');

  expect(onLongPress).toHaveBeenCalledTimes(1);
});

test('AppInput uses themed defaults and derives accessibility metadata', () => {
  render(
    <AppInput
      testID="email-input"
      label="Email"
      helperText="Used to sign in"
      placeholder="name@example.com"
    />,
  );

  const input = screen.getByTestId('email-input');

  expect(input.props.placeholderTextColor).toBe(appTheme.colors.textSecondary);
  expect(input.props.selectionColor).toBe(appTheme.colors.accent);
  expect(input.props.accessibilityLabel).toBe('Email');
  expect(input.props.accessibilityHint).toBe('Used to sign in');
});

test('AppInput preserves caller accessibility and color props', () => {
  render(
    <AppInput
      testID="token-input"
      label="Token"
      helperText="Paste a token"
      errorMessage="Token is invalid"
      accessibilityLabel="Personal access token"
      accessibilityHint="Custom hint"
      placeholderTextColor="#123456"
      selectionColor="#abcdef"
    />,
  );

  const input = screen.getByTestId('token-input');

  expect(input.props.placeholderTextColor).toBe('#123456');
  expect(input.props.selectionColor).toBe('#abcdef');
  expect(input.props.accessibilityLabel).toBe('Personal access token');
  expect(input.props.accessibilityHint).toBe('Custom hint');
});

test('AppCodeBlock keeps each code line on a single row', () => {
  const longLine = 'const path = "/a/really/long/path/that/should/not/wrap/in/the/code/block";';

  render(<AppCodeBlock filename="gist.ts" content={longLine} />);

  expect(screen.getByText(longLine).props.numberOfLines).toBe(1);
});

test('state primitives render compact panel content and actions', () => {
  const onRetry = jest.fn();

  render(
    <>
      <AppEmptyState
        title="No gists yet"
        description="Create one to get started."
        actionLabel="Create"
        onAction={onRetry}
      />
      <AppLoadingState label="Loading gists" description="Fetching latest changes." />
      <AppErrorState title="Could not load" description="Retry in a moment." onRetry={onRetry} />
    </>,
  );

  expect(screen.getByText('No gists yet')).toBeTruthy();
  expect(screen.getByText('Loading gists')).toBeTruthy();
  expect(screen.getByText('Could not load')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Create'}));
  fireEvent.press(screen.getByRole('button', {name: 'Try again'}));

  expect(onRetry).toHaveBeenCalledTimes(2);
});
