import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import ItemList from '../ReusableComponent/ItemList';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../util/theme/theme';
import { AddFavourite } from '../redux/actions/actions';
import ReuseButton from '../ReusableComponent/ReuseButton';

const FavouriteSOngCOmponent = ({
  onSelectSong,
  hidePad,
}: {
  onSelectSong?: () => void;
  hidePad?: boolean;
}) => {
  const { favouriteSong } = useAppSelector(state => state.songs);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();


  return (
    <View style={[{ paddingBottom: hidePad ? 0 : 0 }, styles.container]}>
      <Text style={styles.allMedia}>All Favourit Song</Text>

      {favouriteSong.length > 0 ? (
        <ItemList
          data={favouriteSong}
          keyExtractor={item => item.id}
          getTitle={item => item.title}
          getSubtitle={item => item.artist}
          getArtwork={item => item.artwork}
          onPressItem={(item, index) => {
            onSelectSong?.();
            navigation.navigate('PlaySong', {
              songIndex: index,
              songId: item.id,
              source: 'favourite',
            });
          }}
          isFavourite={item =>
            favouriteSong.some((fav: any) => fav.id === item.id)
          }
          onToggleFavourite={item => dispatch(AddFavourite(item))}
          Paddingbottom={hidePad === undefined ? 180 : 0}
        />
      ) : (
        <View style={styles.buttonBox}>
          <ReuseButton
            onPress={() => navigation.replace('TabComponent')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              To Get FavouriteSong Go to song
            </Text>
          </ReuseButton>
        </View>
      )}
    </View>
  );
};

export default FavouriteSOngCOmponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  allMedia: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    paddingStart: 15,
    paddingTop: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 3,
  },
  buttonBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  searchBar: {
    marginHorizontal: 5,
    marginTop: 12,
    marginBottom: 15,
  },
});