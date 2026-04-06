import React from 'react';
import {render, screen} from '@testing-library/react-native';
import App from '../App';

describe('App shell', () => {
  it('renders the signed-out entry screen', () => {
    render(<App />);

    expect(screen.getByText('BGist')).toBeTruthy();
    expect(screen.getByText('Sign in with GitHub')).toBeTruthy();
  });
});
