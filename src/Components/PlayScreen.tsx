import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../util/theme/theme';
import { usePlayer } from '../customeHook/usePlayer';
import { formatTime } from '../customeHook/usePlayer';
import {
  AddtoPLayListIcon,
  FavouriteSVG,
  ForwerdSongSvg,
  Goback,
  HeartOutlineSVG,
  NextSVG,
  PauseSongSVG,
  PlaySongSVG,
  PreviousSVG,
  RewindSongSVG,
  SkipSongSVG,
} from '../assets/svg/SVGs';
import MarqueeText from '../ReusableComponent/MarqueeText';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import FallbackImage from '../ReusableComponent/FallbackImage';
import { AddFavourite } from '../redux/actions/actions';
import FavouriteSOngCOmponent from './FavouriteSOngCOmponent';
import PlayListComponent from './PlayListComponent';
import { PlaylistProp } from '../util/const/Type';
import AppModal from '../ReusableComponent/AppMOdal';
import ReuseButton from '../ReusableComponent/ReuseButton';
import { shallowEqual } from 'react-redux';

const PlayerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const [showFavourite, setshowFavourite] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const {
    songIndex,
    songId,
    startPosition,
    source = 'offline',
    playlistId,
    mood,
  } = route.params as {
    songIndex: number;
    songId?: string;
    startPosition?: number;
    source?:
      | 'offline'
      | 'device'
      | 'favourite'
      | 'playList'
      | 'Reccomandation'
      | 'MoodSongs';
    playlistId: string;
    mood?: string;
  };
  const songs = useAppSelector(state => state.songs.songs);
  const deviceSong = useAppSelector(state => state.songs.deviceSong);
  const favouriteSong = useAppSelector(state => state.songs.favouriteSong);
  const PlayList = useAppSelector(state => state.songs.PlayList);
  const recommendedSong = useAppSelector(state => state.songs.recommendedSong);
  const songMoods = useAppSelector(state => state.songs.songMoods);

  const [isSkipLocked, setIsSkipLocked] = useState(false);

  const moodFilteredSongs = useMemo(
    () =>
      source === 'MoodSongs' && mood
        ? deviceSong.filter((s: any) => songMoods[s.id]?.mood === mood)
        : [],
    [source, mood, deviceSong, songMoods],
  );

  const playListSong =
    PlayList?.find((s: PlaylistProp) => s.id === playlistId)?.songs ?? [];

  const selectedSong =
    (source === 'device'
      ? deviceSong
      : source === 'favourite'
      ? favouriteSong
      : source === 'playList'
      ? playListSong
      : source === 'Reccomandation'
      ? recommendedSong
      : source === 'MoodSongs'
      ? moodFilteredSongs
      : songs) ?? [];

  const foundIndex = songId ? selectedSong.findIndex(s => s.id === songId) : -1;
  const initialIndex = foundIndex !== -1 ? foundIndex : songIndex;
  const {
    playing,
    currentIndex,
    position,
    duration,
    isSeeking,
    setIsSeeking,
    togglePlay,
    handleNext,
    handlePrev,
    handleSeekComplete,
    handleSeekBackward,
    handleSeekForward,
    handleSkipForward,
    panHandlers,
    isBuffering,
  } = usePlayer(
    selectedSong,
    initialIndex,
    startPosition,
    source,
    playlistId,
    mood,
  );

  const currentSong = selectedSong[currentIndex];

  useEffect(() => {
    if (source !== 'favourite') return;

    if (favouriteSong.length === 0) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabComponent' }],
      });
      return;
    }

    if (
      currentSong &&
      !favouriteSong.some((s: any) => s.id === currentSong.id)
    ) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabComponent' }],
        });
      }
    }
  }, [source, favouriteSong, currentSong, navigation]);

  if (!currentSong) {
    return null;
  }

  const isFavourite = favouriteSong.some(
    (data: any) => data.id === currentSong.id,
  );

  const isInPlaylist = PlayList?.some((pl: PlaylistProp) =>
    pl.songs?.some((s: any) => s.id === currentSong.id),
  );

  const handleToggleFavourite = useCallback(async () => {
    try {
      await dispatch(AddFavourite(currentSong)).unwrap();
    } catch (error) {
      console.log('Failed to toggle favourite', error);
    }
  }, [dispatch, currentSong]);

  const guardedNext = useCallback(() => {
    if (isSkipLocked) return;
    setIsSkipLocked(true);
    handleNext();
    setTimeout(() => setIsSkipLocked(false), 400);
  }, [isSkipLocked, handleNext]);

  const guardedPrev = useCallback(() => {
    if (isSkipLocked) return;
    setIsSkipLocked(true);
    handlePrev();
    setTimeout(() => setIsSkipLocked(false), 400);
  }, [isSkipLocked, handlePrev]);

  return (
    <View style={styles.container} {...panHandlers}>
      <View style={styles.buttons}>
        <ReuseButton onPress={() => navigation.goBack()}>
          <Goback fill={colors.primary} height={28} width={28} />
        </ReuseButton>

        <ReuseButton
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleToggleFavourite}
          onLongPress={() => setshowFavourite(true)}
        >
          {isFavourite ? (
            <FavouriteSVG width={26} height={26} fill={colors.primaryLight} />
          ) : (
            <HeartOutlineSVG width={26} height={26} fill="#fff" />
          )}
        </ReuseButton>
      </View>

      {currentSong.artwork ? (
        <FallbackImage style={styles.artwork} uri={currentSong.artwork} />
      ) : (
        <View style={[styles.artwork, styles.artworkFallback]}>
          <Text style={styles.artworkFallbackText}>♪</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={{ flex: 1 }}>
          <MarqueeText key={currentSong.id} style={styles.title}>{currentSong.title}</MarqueeText>
          <Text style={styles.artist} numberOfLines={1}>
            Artist Name : {currentSong.artist}
          </Text>
          <Text style={styles.artist}>Movie name : {currentSong.movie} </Text>
        </View>
        <Text style={styles.counter}>
          {currentIndex + 1}/{selectedSong.length}
        </Text>
        <ReuseButton
          style={styles.AddtoPLayListButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setShowPlaylistModal(true)}
        >
          <AddtoPLayListIcon
            fill={isInPlaylist ? colors.primaryLight : '#fff'}
          />
        </ReuseButton>
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={isSeeking ? undefined : position}
          minimumTrackTintColor={colors.primaryLight}
          maximumTrackTintColor={'#ffffff'}
          thumbTintColor={colors.primaryLight}
          onSlidingStart={() => setIsSeeking(true)}
          onSlidingComplete={handleSeekComplete}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>
            -{formatTime(duration - position)}{' '}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <ReuseButton onPress={guardedPrev} style={styles.controlBtn} disabled={isSkipLocked}>
          <PreviousSVG />
        </ReuseButton>
        <ReuseButton onPress={guardedNext} style={styles.controlBtn} disabled={isSkipLocked}>
          <RewindSongSVG />
        </ReuseButton>
        <ReuseButton
          onPress={togglePlay}
          style={styles.playBtn}
          disabled={isBuffering}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : playing ? (
            <PauseSongSVG fill="#000" />
          ) : (
            <PlaySongSVG fill="#000" />
          )}
        </ReuseButton>
        <ReuseButton onPress={handleSeekForward} style={styles.controlBtn}>
          <ForwerdSongSvg />
        </ReuseButton>
        <ReuseButton onPress={handleNext} style={styles.controlBtn}>
          <NextSVG />
        </ReuseButton>
      </View>

      <ReuseButton onPress={handleSkipForward} style={styles.skipButton}>
        <SkipSongSVG />
      </ReuseButton>

      <AppModal visible={showFavourite} onClose={() => setshowFavourite(false)}>
        <FavouriteSOngCOmponent
          onSelectSong={() => setshowFavourite(false)}
          hidePad={showFavourite}
        />
      </AppModal>

      <AppModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      >
        <PlayListComponent mode="addSong" songToAdd={currentSong} />
      </AppModal>
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090F',
    paddingHorizontal: 15,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 20,
    marginBottom: 36,
    marginHorizontal: 'auto',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  artist: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primaryLight,
    marginTop: 4,
  },
  counter: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sliderWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  controlBtn: {
    padding: 8,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    marginTop: 50,
  },
  artworkFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkFallbackText: {
    fontSize: 22,
    color: colors.primaryLight,
  },

  AddtoPLayListButton: {
    padding: 4,
  },
});
