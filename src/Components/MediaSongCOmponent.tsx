import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { FolderSvg } from '../assets/svg/SVGs';
import { colors } from '../util/theme/theme';
import { useAudioPermission } from '../customeHook/useAudioPernission';
import { useDeviceAudio } from '../customeHook/useDeviceAudio';
import ItemList from '../ReusableComponent/ItemList';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite, analyzeAndSaveSongs } from '../redux/actions/actions';
import ReuseButton from '../ReusableComponent/ReuseButton';
import AnalysisLoader from '../ReusableComponent/AnalysisLoader';
import MoodSearch from './MoodSearch';
import { checkInternet } from '../util/checkInternet';

const MediaSongComponent = () => {
  const isFocused = useIsFocused();
  const { isAllowed, openSettings } = useAudioPermission();
  const { deviceSong, isLoading, error, refresh, pickSongs } = useDeviceAudio();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const favouriteSong = useAppSelector(state => state.songs.favouriteSong);
  const analysisProgress = useAppSelector(
    state => state.songs.analysisProgress,
  );

  const hasPartialProgress =
    analysisProgress.done > 0 && analysisProgress.done < analysisProgress.total;

  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (analysisProgress.isAnalyzing) {
      setShowAnalysisOverlay(true);
    }
  }, [analysisProgress.isAnalyzing]);

  // AI Analyze needs internet — keep a live connectivity flag so the
  // button can be disabled/labeled correctly without waiting for a tap.
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const online = await checkInternet();
      if (!cancelled) setIsOffline(!online);
    };

    poll();
    const interval = setInterval(poll, 8000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleAnalyze = async () => {
    const online = await checkInternet();
    if (!online) {
      setIsOffline(true);
      return; // don't start analysis without internet
    }
    setShowAnalysisOverlay(true);
    dispatch(analyzeAndSaveSongs(deviceSong));
  };

  // iOS only — opens the document picker and merges newly picked songs
  // into deviceSong (dedup handled inside useDeviceAudio's pickSongs).
  const handleImport = async () => {
    if (isImporting) return;
    setIsImporting(true);
    try {
      await pickSongs();
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleFavourite = useCallback(
    (item: any) => dispatch(AddFavourite(item)),
    [dispatch],
  );

  const checkIsFavourite = useCallback(
    (item: any) => favouriteSong.some((fav: any) => fav.id === item.id),
    [favouriteSong],
  );

  if (!isFocused) {
    return <View style={{ flex: 1 }} />;
  }

  if (!isAllowed) {
    return (
      <View style={styles.folderBox}>
        <View style={styles.folder}>
          <FolderSvg />
        </View>
        <Text style={styles.deniedText}>Audio permission not granted</Text>
        <ReuseButton onPress={openSettings} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>Open Settings</Text>
        </ReuseButton>
      </View>
    );
  }

  if (isLoading && deviceSong.length === 0) {
    return (
      <View style={styles.folderBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.deniedText}>
          {Platform.OS === 'ios'
            ? 'Loading your imported songs...'
            : 'Scanning device for audio files...'}
        </Text>
      </View>
    );
  }

  if (error && deviceSong.length === 0) {
    return (
      <View style={styles.folderBox}>
        <Text style={styles.deniedText}>{error}</Text>
        <ReuseButton onPress={refresh} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>Try Again</Text>
        </ReuseButton>
      </View>
    );
  }

  // iOS has no silent device scan — nothing exists until the user explicitly
  // imports files, so give a dedicated first-run screen instead of the
  // generic "no songs found" state.
  if (Platform.OS === 'ios' && deviceSong.length === 0) {
    return (
      <View style={styles.folderBox}>
        <View style={styles.folder}>
          <FolderSvg />
        </View>
        <Text style={styles.deniedText}>No songs imported yet</Text>
        <Text style={styles.importHint}>
          Import audio files from your Files app or iCloud to start building
          your library
        </Text>
        <ReuseButton
          onPress={handleImport}
          style={[styles.settingsBtn, isImporting && styles.settingsBtnDisabled]}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Text style={styles.settingsBtnText}>Import Songs</Text>
          )}
        </ReuseButton>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <Text style={styles.allMedia}>All Media Songs</Text>
        <View style={styles.headerButtons}>
          {Platform.OS === 'ios' && (
            <ReuseButton
              onPress={handleImport}
              style={[styles.importBtn, isImporting && styles.analyzeBtnDisabled]}
              disabled={isImporting}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.analyzeBtnText}>+ Add Songs</Text>
              )}
            </ReuseButton>
          )}
          {!analysisProgress.isAnalyzing && (
            <ReuseButton
              onPress={handleAnalyze}
              style={[styles.analyzeBtn, isOffline && styles.analyzeBtnDisabled]}
              disabled={isOffline}
            >
              <Text style={styles.analyzeBtnText}>
                {isOffline
                  ? 'No internet'
                  : hasPartialProgress
                  ? 'Resume Analysis'
                  : 'AI Analyze'}
              </Text>
            </ReuseButton>
          )}
        </View>
      </View>

      {isOffline && !analysisProgress.isAnalyzing && (
        <View style={styles.offlineBanner}>
          <View style={styles.offlineDot} />
          <Text style={styles.offlineBannerText}>
            AI Analyze needs internet — currently offline
          </Text>
        </View>
      )}

      <ItemList
        data={deviceSong}
        keyExtractor={item => item.id}
        getTitle={item => item.title}
        getSubtitle={item => item.artist}
        getArtwork={item => item.artwork}
        showIndex={false}
        onPressItem={(item, index) =>
          navigation.navigate('PlaySong', {
            songIndex: index,
            songId: item.id,
            source: 'device',
          })
        }
        refreshControl={
          // Pull-to-refresh maps to a full silent rescan on Android — correct there.
          // On iOS the equivalent action is the explicit "+ Add Songs" button above,
          // since pull-to-refresh reopening a file picker unprompted is bad UX.
          Platform.OS === 'android' ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.folderBox}>
            <Text style={styles.deniedText}>
              No audio files found on this device
            </Text>
          </View>
        }
        onToggleFavourite={handleToggleFavourite}
        isFavourite={checkIsFavourite}
        Paddingbottom={240}
      />

      {showAnalysisOverlay && (
        <AnalysisLoader
          done={analysisProgress.done}
          total={analysisProgress.total}
          onClose={() => setShowAnalysisOverlay(false)}
        />
      )}
      <MoodSearch />
    </View>
  );
};

export default MediaSongComponent;

const styles = StyleSheet.create({
  folder: {
    backgroundColor: colors.folderBg,
    borderRadius: 5,
  },
  folderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  deniedText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  importHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  settingsBtn: {
    backgroundColor: colors.primary,
    marginTop: 12,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnDisabled: {
    opacity: 0.6,
  },
  settingsBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingStart: 15,
    paddingEnd: 15,
    paddingTop: 15,
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  allMedia: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },

  analyzeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeBtnDisabled: {
    backgroundColor: '#3A3A45',
    opacity: 0.6,
  },
  analyzeBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  importBtn: {
    backgroundColor: '#3A3A45',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A22',
    borderWidth: 1,
    borderColor: '#3A3A45',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5252',
    marginRight: 8,
  },
  offlineBannerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  searchBar: {
    marginHorizontal: 5,
    marginTop: 12,
    marginBottom: 15,
  },
});