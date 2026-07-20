import React from 'react';
import { StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatusBarBackground = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        // backgroundColor="transparent"
        backgroundColor={'#09090F'}
        translucent
        barStyle={'default'}
      />
      <View style={{ height: insets.top, backgroundColor: '#09090F' }} />
    </>
  );
};

export default StatusBarBackground;