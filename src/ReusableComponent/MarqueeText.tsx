import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Animated, Easing } from 'react-native';
import { MarqueeTextProps } from '../util/const/Type';

const MarqueeText = ({
  children,
  style,
  duration = 20000,
  loop = true,
  bounce = false,
  repeatSpacer = 70,
  marqueeDelay = 2000,
  scrollSpeed,
}: MarqueeTextProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const runningSignature = useRef<string | null>(null);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setContainerWidth(prev => (Math.abs(prev - w) > 2 ? w : prev));
  }, []);

  const onTextLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setTextWidth(prev => (Math.abs(prev - w) > 2 ? w : prev));
  }, []);

  const isOverflowing = textWidth > 0 && containerWidth > 0 && textWidth > containerWidth;

  useEffect(() => {
    if (!isOverflowing) {
      animationRef.current?.stop();
      runningSignature.current = null;
      translateX.setValue(0);
      return;
    }

    const distance = bounce ? textWidth - containerWidth : textWidth + repeatSpacer;
    const computedDuration = scrollSpeed ? (distance / scrollSpeed) * 1000 : duration;
    const signature = `${bounce}-${Math.round(distance / 4)}-${Math.round(computedDuration / 50)}-${loop}-${marqueeDelay}-${repeatSpacer}`;

    if (runningSignature.current === signature) return;
    runningSignature.current = signature;

    animationRef.current?.stop();
    translateX.setValue(0);

    const singleCycle = bounce
      ? Animated.sequence([
          Animated.delay(marqueeDelay),
          Animated.timing(translateX, {
            toValue: -distance,
            duration: computedDuration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(marqueeDelay),
          Animated.timing(translateX, {
            toValue: 0,
            duration: computedDuration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      : Animated.sequence([
          Animated.delay(marqueeDelay),
          Animated.timing(translateX, {
            toValue: -distance,
            duration: computedDuration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]);

    const anim = loop ? Animated.loop(singleCycle, { iterations: -1 }) : singleCycle;
    animationRef.current = anim;
    anim.start();
  }, [isOverflowing, containerWidth, textWidth, duration, scrollSpeed, loop, bounce, repeatSpacer, marqueeDelay, translateX]);

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  return (
    <View style={localStyles.container} onLayout={onContainerLayout} collapsable={false}>
      <Text
        style={[style, localStyles.measureText]}
        onLayout={onTextLayout}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {children}
      </Text>

      <Animated.View
        style={[
          localStyles.row,
          isOverflowing ? { transform: [{ translateX }] } : null,
        ]}
      >
        <Text style={[style, localStyles.text]} numberOfLines={1} ellipsizeMode="clip">
          {children}
        </Text>

        {isOverflowing && !bounce ? (
          <Text
            style={[style, localStyles.text, { marginLeft: repeatSpacer }]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {children}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  text: {
    flexShrink: 0,
  },
  measureText: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    flexShrink: 0,
  },
});

export default React.memo(MarqueeText);