import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ItemCard from '../ReusableComponent/ItemCard';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite } from '../redux/actions/actions';
import { colors } from '../util/theme/theme';

const ROWS_PER_PAGE = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;

const chunk = (arr: any[], size: number): any[][] => {
  const result: any[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const RecommendedSongs = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { favouriteSong, songs, recommendedSong } = useAppSelector(
    state => state.songs,
  );
  const [activePage, setActivePage] = useState(0);



  const pages = useMemo(
    () => chunk(recommendedSong ?? [], ROWS_PER_PAGE),
    [recommendedSong],
  );

  if (!recommendedSong || recommendedSong.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended For You</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const page = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setActivePage(page);
        }}
      >
        {pages.map((page: any[], pageIndex: number) => (
          <View
            key={`page-${pageIndex}`}
            style={[styles.page, { width: SCREEN_WIDTH }]}
          >
            {page.map((item: any, index: number) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                getTitle={(i: any) => i.title}
                getSubtitle={(i: any) => i.artist}
                getArtwork={(i: any) => i.artwork}
                onPressItem={(i: any) =>
                  navigation.navigate('PlaySong', {
                    songIndex: songs.findIndex((s: any) => s.id === i.id),
                    songId: i.id,
                    source: 'Reccomandation',
                  })
                }
                isFavourite={(i: any) =>
                  favouriteSong.some((fav: any) => fav.id === i.id)
                }
                onToggleFavourite={(i: any) => dispatch(AddFavourite(i))}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {pages.length > 1 && (
        <View style={styles.dotsContainer}>
          {pages.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                i === activePage ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default RecommendedSongs;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  page: {
    // paddingHorizontal: 16,
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
      width: 6,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor:"rgba(124, 58, 237, 0.45)",
  },
});