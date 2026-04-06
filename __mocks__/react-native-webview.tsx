import React from 'react';
import {View} from 'react-native';

type MockWebViewProps = React.ComponentProps<typeof View> & {
  children?: React.ReactNode;
  nestedScrollEnabled?: boolean;
  originWhitelist?: string[];
  source?: unknown;
};

export const WebView = React.forwardRef<View, MockWebViewProps>(
  ({children, ...props}, ref) => (
    <View ref={ref} {...props}>
      {children}
    </View>
  ),
);

WebView.displayName = 'MockWebView';

export default WebView;
