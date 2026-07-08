import { useEffect, useState, useCallback, useRef } from 'react';
import TrackPlayer, { useIsPlaying, useActiveMediaItem, Event } from '@rntp/player';
import { lastPlayedData, SongProp } from '../util/const/Type';
import { PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lastPlayedSong } from '../util/const/ConstName';

const SWIPE_THRESHOLD = 50;
const DIRECTION_LOCK_THRESHOLD = 20;

export const formatTime = (secs: number): string => {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const toMediaItem = (song: SongProp) => ({
  url: song.url,
  title: song.title,
  artist: song.artist,
  artworkUrl: song.artwork,
});

export const saveLastPlay = async (songIndex: number, position: number, source: 'offline' | 'device' | "favourite" | "playList" = 'offline', playlistId?: string,) => {
  try {
    const data: lastPlayedData = { songIndex, position, source, playlistId };
    await AsyncStorage.setItem(lastPlayedSong, JSON.stringify(data));
  } catch (error) {
    console.log('Failed to store song', error);
  }
};

export const getLastPlay = async () => {
  try {
    const raw = await AsyncStorage.getItem(lastPlayedSong);
    const result: lastPlayedData | null = raw ? JSON.parse(raw) : null;
    return result;
  } catch (error) {
    console.log('Failed to read last played song', error);
    return null;
  }
};

export const goToNext = (songs: SongProp[], currentIndex: number): number => {
  if (songs.length === 0) return currentIndex;
  if (currentIndex < songs.length - 1) {
    TrackPlayer.skipToNext();
    return currentIndex + 1;
  }
  TrackPlayer.skipToIndex(0);
  return 0;
};

export const goToPrev = (
  songs: SongProp[],
  currentIndex: number,
  position: number,
): number => {
  if (songs.length === 0) return currentIndex;
  if (position > 3) {
    TrackPlayer.seekTo(0);
    return currentIndex;
  }
  if (currentIndex > 0) {
    TrackPlayer.skipToPrevious();
    return currentIndex - 1;
  }
  TrackPlayer.skipToIndex(songs.length - 1);
  return songs.length - 1;
};

export const usePlayer = (songs: SongProp[], songIndex: number, initialPosition?: number, source: 'offline' | 'device' | "favourite" | "playList" = 'offline', playlistId?: string,) => {
  const [currentIndex, setCurrentIndex] = useState(songIndex);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLoopedRef = useRef(false);

  const playing = useIsPlaying();
  const activeItem = useActiveMediaItem();

  // load queue + resume saved position if reopening the same song
  useEffect(() => {
    if (!songs || songs.length === 0) return; // guard: nothing to load

    const init = async () => {
      const safeIndex = Math.min(Math.max(songIndex, 0), songs.length - 1);

      const activeIdx = TrackPlayer.getActiveMediaItemIndex();
      const activeQueue = TrackPlayer.getQueue();

      const alreadyLoaded =
        activeIdx !== null &&
        activeIdx === safeIndex &&
        activeQueue.length === songs.length &&
        activeQueue[safeIndex]?.url === toMediaItem(songs[safeIndex]).url;

      if (alreadyLoaded) {
        const progress = TrackPlayer.getProgress();
        setCurrentIndex(activeIdx);
        setPosition(progress.position);
        setDuration(progress.duration);
        if (!TrackPlayer.isPlaying()) {
          TrackPlayer.play();
        }
        return;
      }

      TrackPlayer.setMediaItems(songs.map(toMediaItem), safeIndex);
      setCurrentIndex(safeIndex);

      if (initialPosition && initialPosition > 0) {
        TrackPlayer.play();
        TrackPlayer.seekTo(initialPosition);
        return;
      }

      const saved = await getLastPlay();
      if (saved && saved.songIndex === safeIndex && saved.position > 0) {
        TrackPlayer.play();
        TrackPlayer.seekTo(saved.position);
        return;
      }

      TrackPlayer.play();
    };

    init();
  }, [songIndex, songs]);

  // sync index on track change
  useEffect(() => {
    const idx = TrackPlayer.getActiveMediaItemIndex();
    if (idx !== null && idx !== currentIndex) {
      setCurrentIndex(idx);
      hasLoopedRef.current = false;
    }
  }, [activeItem]);

  // poll progress + loop back to song 0 when the last song ends
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isSeeking) return;
      if (songs.length === 0) return; // guard

      const progress = TrackPlayer.getProgress();
      setPosition(progress.position);
      setDuration(progress.duration);

      const isLastSong = currentIndex === songs.length - 1;
      const nearEnd =
        progress.duration > 0 && progress.position >= progress.duration - 0.5;

      if (isLastSong && nearEnd && !hasLoopedRef.current) {
        hasLoopedRef.current = true;
        TrackPlayer.skipToIndex(0);
        TrackPlayer.play();
        setCurrentIndex(0);
      } else if (!nearEnd) {
        hasLoopedRef.current = false;
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSeeking, currentIndex, songs.length]);

  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackStateChanged, () => {
      const idx = TrackPlayer.getActiveMediaItemIndex();
      if (idx !== null) setCurrentIndex(idx);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (songs.length === 0) return; // guard: nothing playing, don't overwrite saved state
    saveLastPlay(currentIndex, 0, source, playlistId);
  }, [currentIndex, source, songs.length, playlistId]);

  const saveTickRef = useRef(0);
  useEffect(() => {
    if (songs.length === 0) return;
    saveTickRef.current += 1;
    if (saveTickRef.current % 10 === 0) {
      saveLastPlay(currentIndex, position, source, playlistId);
    }
  }, [position, currentIndex, source, songs.length, playlistId]);

  const togglePlay = useCallback(() => {
    playing ? TrackPlayer.pause() : TrackPlayer.play();
  }, [playing]);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => goToNext(songs, i));
  }, [songs]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => goToPrev(songs, i, position));
  }, [songs, position]);

  const handleSeekForward = useCallback(() => {
    const newPosition = Math.min(position + 10, duration);
    TrackPlayer.seekTo(newPosition);
  }, [position, duration]);

  const handleSeekBackward = useCallback(() => {
    const newPosition = Math.max(position - 10, 0);
    TrackPlayer.seekTo(newPosition);
  }, [position]);

  const handleSeekComplete = useCallback((value: number) => {
    TrackPlayer.seekTo(value);
    setIsSeeking(false);
  }, []);

  const handleSkipForward = useCallback(() => {
    if (songs.length === 0) return; // guard against % 0
    const targetIndex = (currentIndex + 2) % songs.length;
    TrackPlayer.skipToIndex(targetIndex);
    setCurrentIndex(targetIndex);
  }, [currentIndex, songs.length]);

  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  handleNextRef.current = handleNext;
  handlePrevRef.current = handlePrev;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > DIRECTION_LOCK_THRESHOLD &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx <= -SWIPE_THRESHOLD) {
          handleNextRef.current();
        } else if (gestureState.dx >= SWIPE_THRESHOLD) {
          handlePrevRef.current();
        }
      },
    }),
  ).current;

  return {
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
    handleSeekForward,
    handleSeekBackward,
    handleSkipForward,
    panHandlers: panResponder.panHandlers,
  };
};