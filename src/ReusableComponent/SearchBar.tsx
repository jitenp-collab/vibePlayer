import React, { useRef, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ClearSVG, SearchSVG } from '../assets/svg/SVGs';
import { colors } from '../util/theme/theme';
import { SearchBarProps } from '../util/const/Type';
import ReuseButton from './ReuseButton';
import ReuseInput from './ReuseInput';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  onClear,
  autoFocus = false,
  editable = true,
  style,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.borderStrong],
  });

  return (
    <Animated.View
      style={[styles.container, { borderColor: animatedBorderColor }, style]}
    >
      <SearchSVG fill={isFocused ? colors.primaryLight : colors.textSecondary} />

      <ReuseInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <ReuseButton onPress={handleClear} style={styles.clearButton}>
          <ClearSVG color={colors.textMuted} />
        </ReuseButton>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
});