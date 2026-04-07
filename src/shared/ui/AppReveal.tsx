import React from 'react';
import {Animated, Easing, StyleProp, ViewStyle} from 'react-native';

interface AppRevealProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
  distance?: number;
}

export function AppReveal({
  children,
  style,
  delay = 0,
  duration = 220,
  distance = 16,
}: AppRevealProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(distance)).current;

  React.useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(distance);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration + 40,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, distance, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{translateY}],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
