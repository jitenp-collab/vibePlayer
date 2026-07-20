import { useEffect, useRef, useState, useCallback } from 'react';
import { checkInternet } from '../util/checkInternet';

export const useNetworkPlaybackGuard = (
  currentSong: any,
  playing: boolean,
  togglePlay: () => void,
  reloadAndPlay: () => void,
  intervalMs = 5000,
  autoResume = true, // when false, reconnecting will NOT auto-start playback — used by MiniPlayer
) => {
  const [isOffline, setIsOffline] = useState(false);
  const isOnlineSong = !!currentSong?.url?.startsWith('http');

  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const togglePlayRef = useRef(togglePlay);
  useEffect(() => {
    togglePlayRef.current = togglePlay;
  }, [togglePlay]);

  const reloadAndPlayRef = useRef(reloadAndPlay);
  useEffect(() => {
    reloadAndPlayRef.current = reloadAndPlay;
  }, [reloadAndPlay]);

  // "user wants this online song playing" — only meaningful when autoResume is true.
  const wantsToPlayRef = useRef(false);

  useEffect(() => {
    if (!isOnlineSong) {
      setIsOffline(false);
      wantsToPlayRef.current = false;
      return;
    }

    // Only pre-arm "wants to play" when autoResume is enabled (PlayerScreen).
    // MiniPlayer (autoResume=false) never auto-starts, so no intent is set.

    wantsToPlayRef.current = autoResume;

    let cancelled = false;

    const poll = async () => {
      const online = await checkInternet();
   
      if (cancelled) return;

      if (!online) {
        setIsOffline(true);
        if (playingRef.current) {
          // always force-pause on drop, regardless of autoResume we never want to keep "playing" a dead stream
          if (autoResume) wantsToPlayRef.current = true;
          togglePlayRef.current();
        }
      } else {
        setIsOffline(false);
        if (autoResume && wantsToPlayRef.current && !playingRef.current) {
          console.log('[guard] reconnected -> reloadAndPlay');
          reloadAndPlayRef.current();
        }
        // when autoResume is false, we just clear the offline banner and leave playback paused until the user presses play manually
      }
    };

    poll();
    const interval = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnlineSong, currentSong?.id, intervalMs, autoResume]);

  const handleTogglePlay = useCallback(async () => {
    if (isOnlineSong) {
      const online = await checkInternet();
      console.log('[guard] handleTogglePlay -> online:', online);
      if (!online) {
        setIsOffline(true);
        if (autoResume) wantsToPlayRef.current = true;
        return;
      }
      // online and currently not playing -> reload fresh instead of a bare toggle
      if (!playingRef.current) {
        wantsToPlayRef.current = false;
        reloadAndPlay();
        return;
      }
    }
    wantsToPlayRef.current = false;
    togglePlay();
  }, [isOnlineSong, togglePlay, reloadAndPlay, autoResume]);

  return { isOffline: isOffline && isOnlineSong, handleTogglePlay };
};