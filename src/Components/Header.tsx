import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../util/theme/theme';
import { NotificationSVG, UserSVG } from '../assets/svg/SVGs';
import ReuseButton from '../ReusableComponent/ReuseButton';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.userProfile}>
        <View style={styles.userImage}>
          <UserSVG />
        </View>
        <View>
          <Text style={styles.welcomeText}>Hello Jeeten !</Text>
          <Text style={styles.vibePLayer}>Welcome to VibePLayer</Text>
        </View>
      </View>
      <ReuseButton style={styles.iconBg}>
        <NotificationSVG fill={colors.primary} width={24} height={24} />
      </ReuseButton>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },

  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  welcomeText: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '700',
  },

  vibePLayer: {
    color: colors.textSecondary,
  },

  iconBg: {
    borderWidth: 1,
    borderColor: colors.borderIconClr,
    borderRadius: 10,
    padding: 7,
  },

  userImage: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 100,
    padding: 4,
  },
});