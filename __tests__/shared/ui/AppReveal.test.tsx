import React from 'react';
import {Text} from 'react-native';
import {render, screen} from '@testing-library/react-native';
import {AppReveal} from '../../../src/shared/ui/AppReveal';

test('renders children inside the animated reveal container', () => {
  render(
    <AppReveal>
      <Text>Native reveal</Text>
    </AppReveal>,
  );

  expect(screen.getByText('Native reveal')).toBeTruthy();
});
