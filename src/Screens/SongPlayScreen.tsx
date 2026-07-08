import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import PlayerScreen from '../Components/PlayScreen';

const SongPlayScreen = () => {
  return (
    <View style={styles.container}>
      <PlayerScreen />
    </View>
  );
};

export default SongPlayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
