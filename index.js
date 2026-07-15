/**
 * @format
 */
import 'react-native-gesture-handler'; 
import { AppRegistry } from 'react-native';
import App from "./src/App"
import { name as appName } from './app.json';
import playbackService from './src/util/trackPlayerService';
import TrackPlayer from '@rntp/player';

// console.log('registerBackgroundEventHandler is:', typeof TrackPlayer.registerBackgroundEventHandler);

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerBackgroundEventHandler(() => playbackService);