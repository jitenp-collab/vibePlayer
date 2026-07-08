import React from 'react';
import { TouchableOpacity } from 'react-native';
import { TouchableProps } from '../util/const/Type';

const DEFAULT_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const ReuseButton = ({
  children,
  onPress,
  disabled = false,
  style,
  hitSlop = DEFAULT_HIT_SLOP,
  activeOpacity = 0.7,
  onLongPress,
}: TouchableProps) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={style}
      onLongPress={onLongPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default ReuseButton;