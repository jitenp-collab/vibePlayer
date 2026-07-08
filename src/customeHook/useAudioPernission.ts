import { useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAudioPermission, requestAudioPermission } from '../util/userPermission';
import { isPermission } from '../util/const/ConstName';

export const useAudioPermission = () => {
  const [isAllowed, setIsAllowed] = useState(false);
  const appState = useRef(AppState.currentState);

  const markGranted = async () => {
    setIsAllowed(true);
    await AsyncStorage.setItem(isPermission, 'true');
  };

  // On mount: check stored value, or auto-trigger the popup if not yet granted
  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem(isPermission);
      if (stored === 'true') {
        setIsAllowed(true);
        return;
      }

      const granted = await requestAudioPermission();
      if (granted) {
        await markGranted();
      } else {
        setIsAllowed(false);
      }
    };
    init();
  }, []);

  // On returning from background (e.g. from Settings): silently re-check
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      const cameToForeground =
        appState.current.match(/inactive|background/) && nextState === 'active';
      appState.current = nextState;

      if (cameToForeground && !isAllowed) {
        const granted = await checkAudioPermission();
        if (granted) {
          await markGranted();
        }
      }
    });

    return () => subscription.remove();
  }, [isAllowed]);

  const openSettings = () => {
    Linking.openSettings();
  };

  return {
    isAllowed,
    openSettings,
  };
};