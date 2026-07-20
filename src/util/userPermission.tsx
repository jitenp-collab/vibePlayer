import { PermissionsAndroid, Platform } from 'react-native';

const getPermissionType = () => {
  const androidVersion = Number(Platform.Version);
  return androidVersion >= 33
    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
};

export const checkAudioPermission = async () => {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(getPermissionType());
};

export const requestAudioPermission = async () => {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS !== 'android') return false;
  const granted = await PermissionsAndroid.request(getPermissionType());
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};
