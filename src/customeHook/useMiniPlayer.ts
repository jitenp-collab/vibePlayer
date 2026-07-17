// customeHook/useMiniPlayer.ts
import { useCallback, useState, useEffect, useRef } from "react";
import TrackPlayer, { useIsPlaying, useActiveMediaItem, Event, PlaybackState } from "@rntp/player";
import { lastPlayedData, SongProp } from "../util/const/Type";
import { useIsFocused } from "@react-navigation/native";
import { getLastPlay, goToNext, saveLastPlay, goToPrev, toMediaItem } from "./usePlayer";

export const useMiniPlayer = (
  songs: SongProp[],
  deviceSong: SongProp[],
  favouriteSong: SongProp[],
  PlayList: any[],
  recommendeSong: SongProp[],
  songMoods: Record<string, any>,
) => {
  const [lastPlayed, setLastPlayed] = useState<lastPlayedData | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const playing = useIsPlaying();
  const activeItem = useActiveMediaItem();
  const isFocused = useIsFocused();

  // FIX: single ref used everywhere below — this is the only lock flag now
  const isTransitioningRef = useRef(false);

  // FIX: supports both sync and async fn, and catches native promise rejections
  // (setMediaItems/skipToNext/etc can reject async — a plain try/catch around
 
  const withSkipLock = useCallback((fn: () => Promise<void> | void) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    Promise.resolve()
      .then(fn)
      .catch(error => console.log('MiniPlayer skip error', error))
      .finally(() => {
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 350);
      });
  }, []);

  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackStateChanged, (event) => {
      if (event?.state !== undefined) {
        setIsBuffering(event.state === PlaybackState.Buffering);
      }
    });
    return () => sub.remove();
  }, []);

  const getListForSource = useCallback(
    (source: any, playlistId?: string, mood?: string) => {
      if (source === "device") return deviceSong;
      if (source === "favourite") return favouriteSong;
      if (source === "playList") {
        return PlayList?.find((p: any) => p.id === playlistId)?.songs ?? [];
      }
      if (source === "Reccomandation") return recommendeSong ?? [];
      if (source === "MoodSongs") {
        // stay scoped to mood songs even if `mood` is momentarily falsy —
        // never silently fall back to the full library mid-session
        if (!mood) return [];
        return deviceSong.filter(s => songMoods[s.id]?.mood === mood);
      }
      return songs;
    },
    [songs, deviceSong, favouriteSong, PlayList, recommendeSong, songMoods],
  );

  // resolves the correct index for a saved lastPlayed entry against a *current* list,
  // preferring songId lookup since list order (e.g. recommendations) can shift between sessions
  const resolveIndex = useCallback(
    (list: SongProp[], data: lastPlayedData | null) => {
      if (!data) return -1;
      if (data.songId) {
        const idx = list.findIndex(s => s.id === data.songId);
        if (idx !== -1) return idx;
      }
      return data.songIndex;
    },
    [],
  );

  const loadLastPlayed = useCallback(async () => {
    const data = await getLastPlay();
    if (data) setLastPlayed(data);
  }, []);

  useEffect(() => {
    if (isFocused) loadLastPlayed();
  }, [isFocused, loadLastPlayed]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const progress = TrackPlayer.getProgress();
        setPosition(Math.max(0, progress.position || 0));
        setDuration(Math.max(0, progress.duration || 0));
      } catch (error) {
        // native side may briefly be mid-transition; skip this tick
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lastPlayed) return;
    try {
      const idx = TrackPlayer.getActiveMediaItemIndex();
      if (idx !== null && idx !== lastPlayed.songIndex) {
        const list = getListForSource(lastPlayed.source, lastPlayed.playlistId, lastPlayed.mood);
        const newSongId = list[idx]?.id;
        setLastPlayed(prev =>
          prev ? { ...prev, songIndex: idx, songId: newSongId } : prev,
        );
      }
    } catch (error) {
      console.log('MiniPlayer index sync error', error);
    }
  }, [activeItem, getListForSource]);

  const activeList = getListForSource(lastPlayed?.source, lastPlayed?.playlistId, lastPlayed?.mood);
  const resolvedIndex = resolveIndex(activeList, lastPlayed);
  const song = lastPlayed && resolvedIndex !== -1 ? activeList[resolvedIndex] : undefined;

  const ensureQueueLoaded = useCallback(async () => {
    if (!lastPlayed) return;

    try {
      const list = getListForSource(lastPlayed.source, lastPlayed.playlistId, lastPlayed.mood);
      const activeIdx = TrackPlayer.getActiveMediaItemIndex();
      const activeQueue = TrackPlayer.getQueue();
      const queueEmpty = activeIdx === null || activeQueue.length === 0;

      if (queueEmpty) {
        const startIndex = resolveIndex(list, lastPlayed);
        const safeStartIndex = startIndex !== -1 ? startIndex : 0;

        await TrackPlayer.setMediaItems(list.map(toMediaItem), safeStartIndex); // FIX: await
        if (lastPlayed.position > 0) {
          await TrackPlayer.seekTo(lastPlayed.position); // FIX: await
        }
      }
    } catch (error) {
      console.log('MiniPlayer ensureQueueLoaded error', error);
    }
  }, [lastPlayed, getListForSource, resolveIndex]);

  const togglePlay = useCallback(async () => {
    if (!lastPlayed || isBuffering) return;
    await ensureQueueLoaded();
    try {
      TrackPlayer.isPlaying() ? TrackPlayer.pause() : TrackPlayer.play();
    } catch (error) {
      console.log('MiniPlayer togglePlay error', error);
    }
  }, [lastPlayed, ensureQueueLoaded, isBuffering]);

  const handleNext = useCallback(() => {
    if (!lastPlayed) return;
    withSkipLock(async () => {
      const list = getListForSource(lastPlayed.source, lastPlayed.playlistId, lastPlayed.mood);
      const currentIdx = resolveIndex(list, lastPlayed);
      const newIndex = await goToNext(list, currentIdx !== -1 ? currentIdx : 0); // FIX: await
      const newSongId = list[newIndex]?.id;
      setLastPlayed({
        songIndex: newIndex,
        position: 0,
        source: lastPlayed.source,
        playlistId: lastPlayed.playlistId,
        songId: newSongId,
        mood: lastPlayed.mood,
      });
      saveLastPlay(newIndex, 0, lastPlayed.source, lastPlayed.playlistId, newSongId, lastPlayed.mood);
    });
  }, [lastPlayed, getListForSource, resolveIndex, withSkipLock]);

  const handlePrev = useCallback(() => {
    if (!lastPlayed) return;
    withSkipLock(async () => {
      const list = getListForSource(lastPlayed.source, lastPlayed.playlistId, lastPlayed.mood);
      const currentIdx = resolveIndex(list, lastPlayed);
      const newIndex = await goToPrev(list, currentIdx !== -1 ? currentIdx : 0, position); // FIX: await
      const newSongId = list[newIndex]?.id;
      setLastPlayed({
        songIndex: newIndex,
        position: 0,
        source: lastPlayed.source,
        playlistId: lastPlayed.playlistId,
        songId: newSongId,
        mood: lastPlayed.mood,
      });
      saveLastPlay(newIndex, 0, lastPlayed.source, lastPlayed.playlistId, newSongId, lastPlayed.mood);
    });
  }, [lastPlayed, position, getListForSource, resolveIndex, withSkipLock]);

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return {
    song,
    lastPlayed,
    playing,
    progressPercent,
    isBuffering,
    togglePlay,
    handleNext,
    handlePrev,
  };
};