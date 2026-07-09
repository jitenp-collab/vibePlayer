import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../util/theme/theme';
import {
  PlaySongSVG,
  PauseSongSVG,
  NextSVG,
  PreviousSVG,
} from '../assets/svg/SVGs';
import MarqueeText from '../ReusableComponent/MarqueeText';
import { useAppSelector } from '../redux/hook';
import { useMiniPlayer } from '../customeHook/useMiniPlayer';
import FallbackImage from '../ReusableComponent/FallbackImage';
import ReuseButton from '../ReusableComponent/ReuseButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const MiniPlayer = () => {
  const navigation = useNavigation<any>();
  const { songs, deviceSong, favouriteSong, PlayList } = useAppSelector(
    state => state.songs,
  );

  const {
    song,
    lastPlayed,
    playing,
    progressPercent,
    togglePlay,
    handleNext,
    handlePrev,
  } = useMiniPlayer(songs, deviceSong, favouriteSong, PlayList);

  if (!song || !lastPlayed) return null;

  const openFullPlayer = () => {
    navigation.navigate('PlaySong', {
      songIndex: lastPlayed.songIndex,
      songId: song.id,
      startPosition: lastPlayed.position,
      source: lastPlayed.source,
      playlistId: lastPlayed.playlistId,
    });
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <ReuseButton
        style={styles.container}
        onPress={openFullPlayer}
        activeOpacity={0.95}
      >
        <FallbackImage uri={song.artwork} style={styles.artwork} />

        <View style={styles.info}>
          <MarqueeText style={styles.title}>{song.title}</MarqueeText>
          <Text style={styles.artist} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>
        <ReuseButton
          onPress={handlePrev}
          style={styles.controlBtn}
          hitSlop={10}
        >
          <PreviousSVG width={22} height={22} fill="#fff" />
        </ReuseButton>
        <ReuseButton onPress={togglePlay} style={styles.playBtn} hitSlop={10}>
          {playing ? (
            <PauseSongSVG width={28} height={28} fill="#fff" />
          ) : (
            <PlaySongSVG width={28} height={28} fill="#fff" />
          )}
        </ReuseButton>
        <ReuseButton
          onPress={handleNext}
          style={styles.controlBtn}
          hitSlop={10}
        >
          <NextSVG width={22} height={22} fill="#fff" />
        </ReuseButton>
      </ReuseButton>
    </SafeAreaView>
  );
};
export default MiniPlayer;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 85,
    zIndex: 10,
    width: '100%',
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '100%',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.primaryLight,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },
  info: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  controlBtn: {
    padding: 6,
  },
  playBtn: {
    padding: 6,
    marginHorizontal: 4,
  },
});
