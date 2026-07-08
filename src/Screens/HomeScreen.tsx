import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../util/theme/theme';
import Header from '../Components/Header';
import Songs from '../Components/Songs';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Songs</Text>
      </View>
      <Songs />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // paddingBottom: 190,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    // paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },

  sectionCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
