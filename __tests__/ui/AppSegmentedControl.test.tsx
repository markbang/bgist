import React, {useState} from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {AppSegmentedControl} from '../../src/shared/ui/AppSegmentedControl';

function SegmentedControlHarness() {
  const [value, setValue] = useState('recent');

  return (
    <AppSegmentedControl
      value={value}
      onChange={setValue}
      segments={[
        {label: 'Recent', value: 'recent'},
        {label: 'Starred', value: 'starred'},
        {label: 'Public', value: 'public'},
      ]}
    />
  );
}

test('switches the active segment when a different option is pressed', () => {
  render(<SegmentedControlHarness />);

  expect(screen.getByRole('button', {name: 'Recent'}).props.accessibilityState).toEqual({
    selected: true,
    disabled: false,
  });
  expect(screen.getByRole('button', {name: 'Starred'}).props.accessibilityState).toEqual({
    selected: false,
    disabled: false,
  });

  fireEvent.press(screen.getByRole('button', {name: 'Starred'}));

  expect(screen.getByRole('button', {name: 'Recent'}).props.accessibilityState).toEqual({
    selected: false,
    disabled: false,
  });
  expect(screen.getByRole('button', {name: 'Starred'}).props.accessibilityState).toEqual({
    selected: true,
    disabled: false,
  });
});
