import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {AppSegmentedControl} from '../../src/shared/ui/AppSegmentedControl';

test('calls onChange with the pressed option value', () => {
  const onChange = jest.fn();

  render(
    <AppSegmentedControl
      value="recent"
      onChange={onChange}
      options={[
        {label: 'Recent', value: 'recent'},
        {label: 'Starred', value: 'starred'},
        {label: 'Public', value: 'public'},
      ]}
    />,
  );

  fireEvent.press(screen.getByRole('button', {name: 'Starred'}));

  expect(onChange).toHaveBeenCalledWith('starred');
});
