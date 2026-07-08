import { StyleSheet ,View } from 'react-native';
import React from 'react';
import MediaSongComponent from '../Components/MediaSongCOmponent';

const DeviceSongScreen = () => {
  return (
      <View style={styles.container}>
        <MediaSongComponent />
      </View>
  );
};

export default DeviceSongScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingEnd: 0,
    // paddingBottom: 200,
  },
});
