// customeHook/usePlayer.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import TrackPlayer, { useIsPlaying, useActiveMediaItem, Event, PlaybackState } from '@rntp/player';
import { lastPlayedData, SongProp } from '../util/const/Type';
import { PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lastPlayedSong } from '../util/const/ConstName';
import { useAppDispatch } from '../redux/hook';
import { recordPlay, loadRecommendedSongs } from '../redux/actions/actions';

const SWIPE_THRESHOLD = 50;
const DIRECTION_LOCK_THRESHOLD = 20;

// formats raw seconds into "m:ss" for UI display
export const formatTime = (secs: number): string => {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// maps our SongProp shape to what the native player expects
export const toMediaItem = (song: SongProp) => ({
  url: song.url,
  title: song.title,
  artist: song.artist,
  artworkUrl: song.artwork,
});

// REUSABLE: shared skip-lock hook used by usePlayer + useMiniPlayer — stops a double-tap firing two skips at once
export const useSkipLock = (lockMs = 350) => {
  const isTransitioningRef = useRef(false);
  const withSkipLock = useCallback((fn: () => Promise<void> | void) => {
    if (isTransitioningRef.current) return; // a skip is already in flight, ignore this call
    isTransitioningRef.current = true;
    Promise.resolve()
      .then(fn) // works for both sync and async fn bodies
      .catch(error => console.log('skip lock error', error)) // never let a native rejection bubble unhandled
      .finally(() => {
        setTimeout(() => { isTransitioningRef.current = false; }, lockMs); // release lock after cooldown
      });
  }, [lockMs]);
  return { withSkipLock, isTransitioningRef };
};

// REUSABLE: shared safe-progress reader used by both hooks' polling loops, clamped to >= 0
export const readProgress = () => {
  try {
    const p = TrackPlayer.getProgress();
    return { position: Math.max(0, p.position || 0), duration: Math.max(0, p.duration || 0) };
  } catch (error) {
    return null; // native side may briefly be mid-transition
  }
};

export const saveLastPlay = async (
  songIndex: number,
  position: number,
  source: 'offline' | 'device' | 'favourite' | 'playList' | 'Reccomandation' | 'MoodSongs' = 'offline',
  playlistId?: string,
  songId?: string,
  mood?: string,
) => {
  try {
    const data: lastPlayedData = { songIndex, position, source, playlistId, songId, mood };
    await AsyncStorage.setItem(lastPlayedSong, JSON.stringify(data)); // persist last-played state
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

// moves the queue forward one song, reloading the queue first if it's drifted out of sync
export const goToNext = async (songs: SongProp[], currentIndex: number): Promise<number> => {
  if (songs.length === 0) return currentIndex;
  try {
    const queueLen = TrackPlayer.getQueue().length;
    if (queueLen !== songs.length) {
      // await 
      TrackPlayer.setMediaItems(songs.map(toMediaItem), 0); // queue drifted, reload it
      return 0;
    }
    const safeCurrent = Math.min(Math.max(currentIndex, 0), songs.length - 1); // clamp to valid range
    if (safeCurrent < songs.length - 1) {
      // await 
      TrackPlayer.skipToNext();
      return safeCurrent + 1;
    }
    // await
     TrackPlayer.skipToIndex(0); // wrap back to start
    return 0;
  } catch (error) {
    console.log('goToNext native error', error); // swallow native rejection, never let it bubble unhandled
    return currentIndex;
  }
};

// moves the queue back one song, or restarts the current song if already a few seconds in
export const goToPrev = async (
  songs: SongProp[],
  currentIndex: number,
  position: number,
): Promise<number> => {
  if (songs.length === 0) return currentIndex;
  try {
    const queueLen = TrackPlayer.getQueue().length;
    if (queueLen !== songs.length) {
      // await
       TrackPlayer.setMediaItems(songs.map(toMediaItem), songs.length - 1); // queue drifted, reload it
      return songs.length - 1;
    }
    const safeCurrent = Math.min(Math.max(currentIndex, 0), songs.length - 1);
    if (position > 3) {
      // await 
      TrackPlayer.seekTo(0); // restart current song instead of going back
      return safeCurrent;
    }
    if (safeCurrent > 0) {
      // await
       TrackPlayer.skipToPrevious();
      return safeCurrent - 1;
    }
    // await
     TrackPlayer.skipToIndex(songs.length - 1); // wrap back to end
    return songs.length - 1;
  } catch (error) {
    console.log('goToPrev native error', error);
    return currentIndex;
  }
};

export const usePlayer = (
  songs: SongProp[],
  songIndex: number,
  initialPosition?: number,
  source: 'offline' | 'device' | 'favourite' | 'playList' | 'Reccomandation' | 'MoodSongs' = 'offline',
  playlistId?: string,
  mood?: string,
) => {
  const [currentIndex, setCurrentIndex] = useState(songIndex);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRecordedIndexRef = useRef<number | null>(null); // last index we already recorded a play for
  const hasLoopedRef = useRef(false); // guards against looping to song 0 more than once per queue-end
  const recordPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueSongsRef = useRef<SongProp[]>(songs); // always-current queue snapshot, avoids stale closures

  const { withSkipLock, isTransitioningRef } = useSkipLock(); // shared next/prev lock

  const playing = useIsPlaying();
  const activeItem = useActiveMediaItem();
  const dispatch = useAppDispatch();

  const sessionKey = `${source}-${playlistId ?? ''}-${mood ?? ''}-${songs[0]?.id ?? ''}-${songIndex}`;
  const lastSessionRef = useRef<string | null>(null);

  // load queue + resume saved position — runs once per screen mount/session only
  useEffect(() => {
    if (lastSessionRef.current === sessionKey) return; // same session, don't reload
    lastSessionRef.current = sessionKey;
    queueSongsRef.current = songs; // keep ref in sync with the new list

    const initialSongs = queueSongsRef.current;
    if (!initialSongs || initialSongs.length === 0) return;

    const init = async () => {
      const safeIndex = Math.min(Math.max(songIndex, 0), initialSongs.length - 1);
      const activeIdx = TrackPlayer.getActiveMediaItemIndex();
      const activeQueue = TrackPlayer.getQueue();

      const alreadyLoaded =
        activeIdx !== null &&
        activeIdx === safeIndex &&
        activeQueue.length === initialSongs.length &&
        activeQueue[safeIndex]?.url === toMediaItem(initialSongs[safeIndex]).url;

      if (alreadyLoaded) {
        const progress = TrackPlayer.getProgress();
        setCurrentIndex(activeIdx);
        setPosition(progress.position);
        setDuration(progress.duration);
        if (!TrackPlayer.isPlaying()) TrackPlayer.play();
        return;
      }

      TrackPlayer.setMediaItems(initialSongs.map(toMediaItem), safeIndex);
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
  }, [sessionKey]);

  // sync currentIndex on track change + record play for recommendations after a short delay
  useEffect(() => {
    const idx = TrackPlayer.getActiveMediaItemIndex();
    if (idx !== null && idx !== lastRecordedIndexRef.current) {
      lastRecordedIndexRef.current = idx;
      setCurrentIndex(idx);
      hasLoopedRef.current = false;

      recordPlayTimerRef.current = setTimeout(() => {
        const playedSong = queueSongsRef.current[idx];
        if (playedSong) {
          dispatch(recordPlay(playedSong.id));
          dispatch(loadRecommendedSongs());
        }
      }, 600);
    }

    return () => {
      if (recordPlayTimerRef.current) clearTimeout(recordPlayTimerRef.current);
    };
  }, [activeItem]);

  // poll playback progress + auto-loop back to song 0 when the last song ends
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isSeeking) return; // don't fight a manual seek in progress
      const list = queueSongsRef.current;
      if (list.length === 0) return;

      const progress = readProgress();
      if (!progress) return;
      setPosition(progress.position);
      setDuration(progress.duration);

      const isLastSong = currentIndex === list.length - 1;
      const nearEnd = progress.duration > 0 && progress.position >= progress.duration - 0.5;

      if (isLastSong && nearEnd && !hasLoopedRef.current) {
        if (isTransitioningRef.current) return; // don't fight a manual skip in progress
        hasLoopedRef.current = true;
        isTransitioningRef.current = true;
        TrackPlayer.skipToIndex(0);
        TrackPlayer.play();
        setCurrentIndex(0);
        setTimeout(() => { isTransitioningRef.current = false; }, 300);
      } else if (!nearEnd) {
        hasLoopedRef.current = false;
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSeeking, currentIndex]);

  // keep isBuffering + currentIndex in sync with native playback state changes
  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackStateChanged, (event) => {
      const idx = TrackPlayer.getActiveMediaItemIndex();
      if (idx !== null) setCurrentIndex(idx);
      if (event?.state !== undefined) setIsBuffering(event.state === PlaybackState.Buffering);
    });
    return () => sub.remove();
  }, []);

  // persist last-played song immediately whenever the current song changes
  useEffect(() => {
    if (queueSongsRef.current.length === 0) return;
    saveLastPlay(currentIndex, 0, source, playlistId, queueSongsRef.current[currentIndex]?.id, mood);
  }, [currentIndex, source, playlistId, mood]);

  // periodically persist playback position too (every ~10th tick), so resume works after a kill
  const saveTickRef = useRef(0);
  useEffect(() => {
    if (queueSongsRef.current.length === 0) return;
    saveTickRef.current += 1;
    if (saveTickRef.current % 10 === 0) {
      saveLastPlay(currentIndex, position, source, playlistId, queueSongsRef.current[currentIndex]?.id, mood);
    }
  }, [position, currentIndex, source, playlistId, mood]);

  const togglePlay = useCallback(() => {
    playing ? TrackPlayer.pause() : TrackPlayer.play();
  }, [playing]);

  // skip forward one song, reloading the queue first if it's drifted out of sync
  const handleNext = useCallback(() => {
    withSkipLock(() => {
      const list = queueSongsRef.current;
      if (list.length === 0) return;

      const queueLen = TrackPlayer.getQueue().length;
      let newIndex: number;

      if (queueLen !== list.length) {
        TrackPlayer.setMediaItems(list.map(toMediaItem), 0);
        newIndex = 0;
      } else if (currentIndex < list.length - 1) {
        TrackPlayer.skipToNext();
        newIndex = currentIndex + 1;
      } else {
        TrackPlayer.skipToIndex(0);
        newIndex = 0;
      }

      newIndex = Math.min(Math.max(newIndex, 0), list.length - 1);
      setPosition(0);
      hasLoopedRef.current = false;
      setCurrentIndex(newIndex);
    });
  }, [currentIndex, withSkipLock]);

  // skip back one song, or restart current song if already a few seconds in
  const handlePrev = useCallback(() => {
    withSkipLock(() => {
      const list = queueSongsRef.current;
      if (list.length === 0) return;

      const queueLen = TrackPlayer.getQueue().length;
      let newIndex: number;

      if (queueLen !== list.length) {
        TrackPlayer.setMediaItems(list.map(toMediaItem), list.length - 1);
        newIndex = list.length - 1;
      } else if (position > 3) {
        TrackPlayer.seekTo(0);
        newIndex = currentIndex;
      } else if (currentIndex > 0) {
        TrackPlayer.skipToPrevious();
        newIndex = currentIndex - 1;
      } else {
        TrackPlayer.skipToIndex(list.length - 1);
        newIndex = list.length - 1;
      }

      newIndex = Math.min(Math.max(newIndex, 0), list.length - 1);
      setPosition(0);
      hasLoopedRef.current = false;
      setCurrentIndex(newIndex);
    });
  }, [currentIndex, position, withSkipLock]);

  const handleSeekForward = useCallback(() => {
    TrackPlayer.seekTo(Math.min(position + 10, duration));
  }, [position, duration]);

  const handleSeekBackward = useCallback(() => {
    TrackPlayer.seekTo(Math.max(position - 10, 0));
  }, [position]);

  const handleSeekComplete = useCallback((value: number) => {
    TrackPlayer.seekTo(value);
    setIsSeeking(false);
  }, []);

  // jumps ahead 2 songs, wrapping around the queue (used for a "skip preview" gesture)
  const handleSkipForward = useCallback(() => {
    const list = queueSongsRef.current;
    if (list.length === 0) return; // guard against % 0
    const targetIndex = (currentIndex + 2) % list.length;
    TrackPlayer.skipToIndex(targetIndex);
    setCurrentIndex(targetIndex);
  }, [currentIndex]);

  // refs so PanResponder always calls the latest handler, without recreating the responder
  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  handleNextRef.current = handleNext;
  handlePrevRef.current = handlePrev;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > DIRECTION_LOCK_THRESHOLD &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx <= -SWIPE_THRESHOLD) handleNextRef.current();
        else if (gestureState.dx >= SWIPE_THRESHOLD) handlePrevRef.current();
      },
    }),
  ).current;

  return {
    playing,
    currentIndex,
    position,
    duration,
    isSeeking,
    isBuffering,
    setIsSeeking,
    togglePlay,
    handleNext,
    handlePrev,
    handleSeekComplete,
    handleSeekForward,
    handleSeekBackward,
    handleSkipForward,
    panHandlers: panResponder.panHandlers,
    queueSongs: queueSongsRef.current,
  };
};