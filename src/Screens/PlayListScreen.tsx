import { StyleSheet, View } from 'react-native';
import React from 'react';
import PlayListComponent from '../Components/PlayListComponent';

const PlayListScreen = () => {
  return (
    <View style={styles.container}>
      <PlayListComponent />
    </View>
  );
};

export default PlayListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
  },
});
