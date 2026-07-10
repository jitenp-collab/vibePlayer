import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import ItemList from '../ReusableComponent/ItemList';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite } from '../redux/actions/actions';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../util/theme/theme';
import RecommendedSongs from './ReconmmendationSongCOmponent';
import Header from './Header';

const Songs = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { favouriteSong, songs, recommendedSong } = useAppSelector(
    state => state.songs,
  );

  useEffect(() => {
    console.log('Recommended song', recommendedSong);
  }, [recommendedSong]);

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
});