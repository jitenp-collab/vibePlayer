// customeHook/useMiniPlayer.ts
import { useCallback, useState, useEffect } from "react";
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
) => {
  const [lastPlayed, setLastPlayed] = useState<lastPlayedData | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const playing = useIsPlaying();
  const activeItem = useActiveMediaItem();
  const isFocused = useIsFocused();

  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackStateChanged, (event) => {
      if (event?.state !== undefined) {
        setIsBuffering(event.state === PlaybackState.Buffering);
      }
    });
    return () => sub.remove();
  }, []);

  const getListForSource = useCallback(
    (source: any, playlistId?: string) => {
      if (source === "device") return deviceSong;
      if (source === "favourite") return favouriteSong;
      if (source === "playList") {
        return PlayList?.find((p: any) => p.id === playlistId)?.songs ?? [];
      }
      if (source === "Reccomandation") return recommendeSong ?? [];
      return songs;
    },
    [songs, deviceSong, favouriteSong, PlayList, recommendeSong],
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
      const progress = TrackPlayer.getProgress();
      setPosition(Math.max(0, progress.position || 0));
      setDuration(Math.max(0, progress.duration || 0));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lastPlayed) return;
    const idx = TrackPlayer.getActiveMediaItemIndex();
    if (idx !== null && idx !== lastPlayed.songIndex) {
      setLastPlayed(prev => (prev ? { ...prev, songIndex: idx } : prev));
    }
  }, [activeItem]);

  const activeList = getListForSource(lastPlayed?.source, lastPlayed?.playlistId);
  const resolvedIndex = resolveIndex(activeList, lastPlayed);
  const song = lastPlayed && resolvedIndex !== -1 ? activeList[resolvedIndex] : undefined;

  const ensureQueueLoaded = useCallback(async () => {
    if (!lastPlayed) return;

    const list = getListForSource(lastPlayed.source, lastPlayed.playlistId);
    const activeIdx = TrackPlayer.getActiveMediaItemIndex();
    const activeQueue = TrackPlayer.getQueue();
    const queueEmpty = activeIdx === null || activeQueue.length === 0;

    if (queueEmpty) {
      const startIndex = resolveIndex(list, lastPlayed);
      const safeStartIndex = startIndex !== -1 ? startIndex : 0;

      TrackPlayer.setMediaItems(list.map(toMediaItem), safeStartIndex);
      if (lastPlayed.position > 0) {
        TrackPlayer.seekTo(lastPlayed.position);
      }
    }
  }, [lastPlayed, getListForSource, resolveIndex]);

  const togglePlay = useCallback(async () => {
    if (!lastPlayed || isBuffering) return;
    await ensureQueueLoaded();
    TrackPlayer.isPlaying() ? TrackPlayer.pause() : TrackPlayer.play();
  }, [lastPlayed, ensureQueueLoaded, isBuffering]);

  const handleNext = useCallback(() => {
    if (!lastPlayed) return;
    const list = getListForSource(lastPlayed.source, lastPlayed.playlistId);
    const currentIdx = resolveIndex(list, lastPlayed);
    const newIndex = goToNext(list, currentIdx !== -1 ? currentIdx : 0);
    const newSongId = list[newIndex]?.id;
    setLastPlayed({
      songIndex: newIndex,
      position: 0,
      source: lastPlayed.source,
      playlistId: lastPlayed.playlistId,
      songId: newSongId,
    });
    saveLastPlay(newIndex, 0, lastPlayed.source, lastPlayed.playlistId, newSongId);
  }, [lastPlayed, getListForSource, resolveIndex]);

  const handlePrev = useCallback(() => {
    if (!lastPlayed) return;
    const list = getListForSource(lastPlayed.source, lastPlayed.playlistId);
    const currentIdx = resolveIndex(list, lastPlayed);
    const newIndex = goToPrev(list, currentIdx !== -1 ? currentIdx : 0, position);
    const newSongId = list[newIndex]?.id;
    setLastPlayed({
      songIndex: newIndex,
      position: 0,
      source: lastPlayed.source,
      playlistId: lastPlayed.playlistId,
      songId: newSongId,
    });
    saveLastPlay(newIndex, 0, lastPlayed.source, lastPlayed.playlistId, newSongId);
  }, [lastPlayed, position, getListForSource, resolveIndex]);

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