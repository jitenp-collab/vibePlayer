import React from 'react';
import { TextInput, Platform, StyleSheet } from 'react-native';
import { colors } from '../util/theme/theme';
import { ReuseInputProps } from '../util/const/Type';

const ReuseInput = ({
  value,
  onChangeText,
  placeholder,
  style,
  onFocus,
  onBlur,
  onSubmitEditing,
  autoFocus = false,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
  returnKeyType = 'default',
  multiline = false,
  maxLength,
}: ReuseInputProps) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={[styles.input, style]}
      onFocus={onFocus}
      onBlur={onBlur}
      onSubmitEditing={onSubmitEditing}
      autoFocus={autoFocus}
      editable={editable}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      returnKeyType={returnKeyType}
      multiline={multiline}
      maxLength={maxLength}
      selectionColor={colors.primary}
    />
  );
};

export default ReuseInput;

const styles = StyleSheet.create({
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    ...Platform.select({
      ios: { paddingVertical: 0 },
      android: { paddingVertical: 4 },
    }),
  },
});