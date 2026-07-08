import { useCallback, useState, useEffect } from "react";
import TrackPlayer, { useIsPlaying, useActiveMediaItem } from "@rntp/player";
import { lastPlayedData, SongProp } from "../util/const/Type";
import { useIsFocused } from "@react-navigation/native";
import { getLastPlay, goToNext, saveLastPlay, goToPrev, toMediaItem } from "./usePlayer";

export const useMiniPlayer = (
  songs: SongProp[],
  deviceSong: SongProp[],
  favouriteSong: SongProp[],
  PlayList: any[]
) => {
  const [lastPlayed, setLastPlayed] = useState<lastPlayedData | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playing = useIsPlaying();
  const activeItem = useActiveMediaItem();
  const isFocused = useIsFocused();

  // pick the correct list for a given source — single source of truth
  const getListForSource = useCallback(
    (source: any, playlistId?: string) => {
      if (source === "device") return deviceSong;
      if (source === "favourite") return favouriteSong;
      if (source === "playList") {
        return PlayList?.find((p: any) => p.id === playlistId)?.songs ?? [];
      }
      return songs;
    },
    [songs, deviceSong, favouriteSong, PlayList],
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
  const song = lastPlayed ? activeList[lastPlayed.songIndex] : undefined;

  const ensureQueueLoaded = useCallback( async() => {
    if (!lastPlayed) return;

    const list = getListForSource(lastPlayed.source, lastPlayed.playlistId);
    const activeIdx = TrackPlayer.getActiveMediaItemIndex();
    const activeQueue = TrackPlayer.getQueue();
    const queueEmpty = activeIdx === null || activeQueue.length === 0;

    if (queueEmpty) {
      // await
       TrackPlayer.setMediaItems(list.map(toMediaItem), lastPlayed.songIndex);
      if (lastPlayed.position > 0) {
        // await
         TrackPlayer.seekTo(lastPlayed.position);
      }
    }
  }, [lastPlayed, getListForSource]);

  const togglePlay = useCallback(async () => {
    if (!lastPlayed) return;
    await ensureQueueLoaded();
    TrackPlayer.isPlaying() ? TrackPlayer.pause() : TrackPlayer.play();
  }, [lastPlayed, ensureQueueLoaded]);

  const handleNext = useCallback(() => {
    if (!lastPlayed) return;
    const list = getListForSource(lastPlayed.source, lastPlayed.playlistId);
    const newIndex = goToNext(list, lastPlayed.songIndex);
    setLastPlayed({
      songIndex: newIndex,
      position: 0,
      source: lastPlayed.source,
      playlistId: lastPlayed.playlistId,
    });
    saveLastPlay(newIndex, 0, lastPlayed.source, lastPlayed.playlistId);
  }, [lastPlayed, getListForSource]);

  const handlePrev = useCallback(() => {
    if (!lastPlayed) return;
    const list = getListForSource(lastPlayed.source, lastPlayed.playlistId);
    const newIndex = goToPrev(list, lastPlayed.songIndex, position);
    setLastPlayed({
      songIndex: newIndex,
      position: 0,
      source: lastPlayed.source,
      playlistId: lastPlayed.playlistId,
    });
    saveLastPlay(newIndex, 0, lastPlayed.source, lastPlayed.playlistId);
  }, [lastPlayed, position, getListForSource]);

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return {
    song,
    lastPlayed,
    playing,
    progressPercent,
    togglePlay,
    handleNext,
    handlePrev,
  };
};