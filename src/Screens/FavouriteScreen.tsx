import { StyleSheet, View } from 'react-native';
import React from 'react';
import FavouriteSOngCOmponent from '../Components/FavouriteSOngCOmponent';

const FavouriteScreen = () => {
  return (
    <View style={styles.container}>
      <FavouriteSOngCOmponent />
    </View>
  );
};

export default FavouriteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
