import { useNavigation } from '@react-navigation/native';
import ItemList from '../ReusableComponent/ItemList';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite } from '../redux/actions/actions';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../util/theme/theme';
import RecommendedSongs from './ReconmmendationSongCOmponent';
import Header from './Header';
import { useEffect, useState } from 'react';
import { checkInternet } from '../util/checkInternet';

const Songs = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { favouriteSong, songs, } = useAppSelector(
    state => state.songs,
  );

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const online = await checkInternet();
      if (!cancelled) setIsOffline(!online);
    };

    poll();
    const interval = setInterval(poll, 8000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <ItemList
      data={songs}
      keyExtractor={item => item.id}
      getTitle={item => item.title}
      getSubtitle={item => item.artist}
      getArtwork={item => item.artwork}
      onPressItem={(item, index) =>
        navigation.navigate('PlaySong', { songIndex: index, songId: item.id })
      }
      isFavourite={item =>
        favouriteSong.some((fav: any) => fav.id === item.id)
      }
      onToggleFavourite={item => dispatch(AddFavourite(item))}
      Paddingbottom="48%"
      ListHeaderComponent={
        <>
          <Header />
          {isOffline && (
            <View style={styles.offlineBanner}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineBannerText}>No internet connection</Text>
            </View>
          )}
          <RecommendedSongs />
          <Text style={styles.sectionTitle}>All Songs</Text>
        </>
      }
    />
  );
};

export default Songs;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A22',
    borderWidth: 1,
    borderColor: '#3A3A45',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5252',
    marginRight: 8,
  },
  offlineBannerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});