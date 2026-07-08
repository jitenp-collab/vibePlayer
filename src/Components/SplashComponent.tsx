import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Svg, { Path, Circle } from 'react-native-svg';

import Animated, {
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SplashComponent = () => {
  const navigation = useNavigation<any>();

  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.7);

  const ringRotate = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  const dotScale = useSharedValue(0.6);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(12);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(8);

  const lineWidth = useSharedValue(0);

  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    iconScale.value = withSpring(1, { damping: 14, stiffness: 140 });

    ringOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    ringRotate.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );

    dotScale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    lineWidth.value = withDelay(550, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));

    titleOpacity.value = withDelay(600, withTiming(1, { duration: 450 }));
    titleY.value = withDelay(600, withSpring(0, { damping: 16, stiffness: 160 }));

    subtitleOpacity.value = withDelay(780, withTiming(1, { duration: 400 }));
    subtitleY.value = withDelay(780, withSpring(0, { damping: 16, stiffness: 160 }));

    screenOpacity.value = withDelay(
      3400,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) runOnJS(goHome)();
      }),
    );
  }, []);

  const goHome = () => navigation.replace('TabComponent');

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineWidth.value }],
    opacity: interpolate(lineWidth.value, [0, 0.3, 1], [0, 1, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>

      {/* Icon area */}
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.orbitRing, ringStyle]}>
          <Svg width={148} height={148} viewBox="0 0 148 148">
            <Circle
              cx={74}
              cy={74}
              r={66}
              stroke="#7C3AED"
              strokeWidth={1}
              strokeOpacity={0.35}
              strokeDasharray="4 8"
              fill="none"
            />
            <Circle
              cx={74}
              cy={74}
              r={66}
              stroke="#A78BFA"
              strokeWidth={2}
              strokeOpacity={0.9}
              strokeDasharray="14 200"
              strokeDashoffset={-10}
              fill="none"
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.iconBadge, iconStyle]}>
          <Svg width={48} height={48} viewBox="0 0 24 24">
            <Path
              fill="#FFFFFF"
              d="M12 3a9 9 0 00-9 9v6a3 3 0 003 3h2v-7H6v-2a6 6 0 1112 0v2h-2v7h2a3 3 0 003-3v-6a9 9 0 00-9-9z"
            />
          </Svg>
        </Animated.View>
      </View>

      {/* Pulse dot */}
      <View style={styles.dotWrapper}>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>

      {/* Divider */}
      <Animated.View style={[styles.divider, lineStyle]} />

      {/* Text */}
      <Animated.Text style={[styles.title, titleStyle]}>
        Vibe Player
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        Feel every beat
      </Animated.Text>

    </Animated.View>
  );
};

export default SplashComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconContainer: {
    width: 148,
    height: 148,
    justifyContent: 'center',
    alignItems: 'center',
  },

  orbitRing: {
    position: 'absolute',
  },

  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#1E1340',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dotWrapper: {
    marginTop: 20,
    width: 6,
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },

  divider: {
    marginTop: 24,
    width: 32,
    height: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    transformOrigin: 'left',
  },

  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: '600',
    color: '#F4F4F6',
    letterSpacing: 0.4,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(244, 244, 246, 0.38)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});