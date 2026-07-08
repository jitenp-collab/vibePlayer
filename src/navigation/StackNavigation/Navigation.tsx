import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import StatusBarBackground from '../../Components/StatusBarCOmponent';
import SplashScreen from '../../Screens/SplashScreen';
import AppTabs from '../TabNavigation/TabNavigation';
import SongPlayScreen from '../../Screens/SongPlayScreen';
import PlayListDetailScreen from '../../Screens/PlayListDetailScreen';

const Navigation = ({ children }: any) => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#09090F',
        },
      }}
    >
      <StatusBarBackground />
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#09090F' },
        }}
      >
        {children}
        <Stack.Screen component={SplashScreen} name="SplashScreen" />
        <Stack.Screen component={AppTabs} name="TabComponent" />
        <Stack.Screen
          component={SongPlayScreen}
          name="PlaySong"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          options={{ animation: 'fade_from_bottom' }}
          name="PlayListDetail"
          component={PlayListDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
