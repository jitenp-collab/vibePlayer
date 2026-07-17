import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { colors } from '../util/theme/theme';
import MarqueeText from './MarqueeText';
import { ItenCardProps } from '../util/const/Type';
import FallbackImage from './FallbackImage';
import { FavouriteSVG, HeartOutlineSVG, DeletFolder } from '../assets/svg/SVGs';
import ReuseButton from './ReuseButton';

const ItemCard = ({
  item,
  index,
  getTitle,
  getSubtitle,
  getArtwork,
  onPressItem,
  onToggleFavourite,
  isFavourite,
  onDeleteItem,
  isAdded,
  onToggleAdd,
}: ItenCardProps) => {
  
  const artwork = getArtwork ? getArtwork(item) : undefined;
  const subtitle = getSubtitle ? getSubtitle(item) : undefined;
  const favourite = isFavourite ? isFavourite(item) : false;
  const added = isAdded ? isAdded(item) : false;

  const handleDelete = () => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${getTitle(item)}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteItem && onDeleteItem(item, index),
        },
      ],
    );
  };

  return (

      <ReuseButton
        style={styles.card}
        onPress={() => onPressItem && onPressItem(item, index)}
        disabled={!onPressItem}
      >
        {artwork ? (
          <FallbackImage style={styles.artwork} uri={artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkFallback]}>
            <Text style={styles.artworkFallbackText}>♪</Text>
          </View>
        )}

        <View style={styles.info} collapsable={false}>
          <MarqueeText style={styles.title}>{getTitle(item)}</MarqueeText>
          {subtitle ? (
            <MarqueeText style={styles.artist} >{subtitle}</MarqueeText>
            // <Text style={styles.artist} numberOfLines={1}>
            //   {subtitle} 
            // </Text>
          ) : null}
        </View>

        {onToggleFavourite ? (
          <ReuseButton
            onPress={() => onToggleFavourite(item, index)}
            style={styles.favouriteBtn}
          >
            {favourite ? (
              <FavouriteSVG width={23} height={23} fill={colors.primaryLight} />
            ) : (
              <HeartOutlineSVG width={23} height={23} fill="#e6e3e3" />
            )}
          </ReuseButton>
        ) : null}

        {onDeleteItem ? (
          <ReuseButton onPress={handleDelete} style={styles.deleteBtn}>
            <DeletFolder width={30} height={30} />
          </ReuseButton>
        ) : null}

        {onToggleAdd ? (
          <ReuseButton
            onPress={() => !added && onToggleAdd(item, index)}
            disabled={added}
            style={[
              styles.toggleAddBtn,
              added ? styles.toggleAddBtnAdded : styles.toggleAddBtnDefault,
            ]}
          >
            <Text
              style={[
                styles.toggleAddBtnText,
                added && styles.toggleAddBtnTextAdded,
              ]}
            >
              {added ? '✓' : '+'}
            </Text>
          </ReuseButton>
        ) : null}
      </ReuseButton>
  );
};

export default ItemCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderBottomWidth: 1.5,
    // borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 12,
  },
  artwork: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
  },
  artworkFallback: { justifyContent: 'center', alignItems: 'center' },
  artworkFallbackText: { fontSize: 22, color: colors.primaryLight },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  artist: { fontSize: 12, fontWeight: '500', color: colors.primaryLight },
  index: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDisabled,
    width: 24,
    textAlign: 'right',
  },
  favouriteBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleAddBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  toggleAddBtnDefault: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  toggleAddBtnAdded: {
    borderColor: colors.success,
    backgroundColor: colors.successFaint,
  },
  toggleAddBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 17,
  },
  toggleAddBtnTextAdded: { color: colors.success },
});
