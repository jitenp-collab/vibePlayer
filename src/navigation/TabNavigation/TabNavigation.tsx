import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../Screens/HomeScreen';
import FavouritesScreen from '../../Screens/FavouriteScreen';
import TabNavigationComponent from '../TabNavigation/TabNavigationComponent';
import DeviceSongScreen from '../../Screens/DeviceSongScreen';
import MiniPlayer from '../../Components/Miniplayer';
import { StyleSheet, View } from 'react-native';
import PlayListScreen from '../../Screens/PlayListScreen';

const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <View style={styles.container}>
    <MiniPlayer />
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => {
        const activeTab =
          props.state.routes[props.state.index].name.toLowerCase();

        const handleTabPress = (key: string) => {
          const route = props.state.routes.find(
            r => r.name.toLowerCase() === key,
          );
          if (route) props.navigation.navigate(route.name);
        };

        return (
          <TabNavigationComponent
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        );
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favourites" component={FavouritesScreen} />
      <Tab.Screen name="DeviceSong" component={DeviceSongScreen} />
      <Tab.Screen name="PlayList" component={PlayListScreen} />
    </Tab.Navigator>
  </View>
);

export default AppTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
