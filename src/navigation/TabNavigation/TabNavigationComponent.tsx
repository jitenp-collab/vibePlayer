import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  HomeSVG,
  FavouriteSVG,
  TabFolderSVG,
  PLayListSVG,
} from '../../assets/svg/SVGs';
import { colors } from '../../util/theme/theme';
import { TabPrope } from '../../util/const/Type';
import ReuseButton from '../../ReusableComponent/ReuseButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = [
  {
    key: 'home',
    icon: (color: string) => <HomeSVG color={color} />,
  },
  {
    key: 'favourites',
    icon: (color: string) => <FavouriteSVG fill={color} />,
  },
  {
    key: 'devicesong',
    icon: (color: string) => <TabFolderSVG color={color} />,
  },
  {
    key: 'playlist',
    icon: (color: string) => (
      <PLayListSVG color={color} height={24} width={24} />
    ),
  },
];

const TabNavigationComponent = ({
  activeTab = 'home',
  onTabPress,
}: TabPrope) => {
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;

          return (
            <ReuseButton
              key={tab.key}
              onPress={() => onTabPress?.(tab.key)}
              activeOpacity={0.75}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              {tab.icon(isActive ? colors.primaryLight : colors.textMuted)}
            </ReuseButton>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default TabNavigationComponent;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 14,
    paddingHorizontal: 24,
  },

  container: {
    flexDirection: 'row',
    backgroundColor: colors.tabBg,
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 34,
  },

  tabActive: {
    backgroundColor: 'rgb(124, 58, 237)',
  },
});
