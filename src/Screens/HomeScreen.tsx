import { StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '../util/theme/theme';
import Songs from '../Components/Songs';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Songs />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});